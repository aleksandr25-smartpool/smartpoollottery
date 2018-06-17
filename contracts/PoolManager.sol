pragma solidity ^0.4.16;

import "SmartPool.sol";
       
//Wallet interface
contract WalletContract
{
	function payMe() public payable;
}
	   
	   
contract PoolManager {

	//Pool owner (address which manage the pool creation)
    address owner;
	
	//Wallet which receive the fees (1% of ticket price)
	address wallet;
	
	//Fees infos (external websites providing access to pools get 1% too)
	mapping(address => uint) fees;
		
	//Fees divider (1% for the wallet, and 1% for external website where player can buy tickets)
	uint constant feeDivider = 100; //(1/100 of the amount)

	//The ticket price for pools must be a multiple of 0.010205 ether (to avoid truncating the fees, and having a minimum to send to the winner)
    uint constant ticketPriceMultiple = 10205000000000000; //(multiple of 0.010205 ether for ticketPrice)

	//Pools infos (current active pools. When a pool is done, it goes into the poolsDone array bellow and a new pool is created to replace it at the same index)
	SmartPool[] pools;
	
	//Ended pools (cleaned automatically after winners get their prices)
	SmartPool[] poolsDone;
	
	//History (contains all the pools since the deploy)
	SmartPool[] poolsHistory;
	
	//Current rand seed (it changes a lot so it's pretty hard to know its value when the winner is picked)
	uint randSeed;

	//Constructor (only owner)
	function PoolManager(address wal) public
	{
		owner = msg.sender;
		wallet = wal;

		randSeed = 0;
	}
	
	//Called frequently by other functions to keep the seed moving
	function updateSeed() private
	{
		randSeed += (uint(block.blockhash(block.number - 1)));
	}
	
	//Create a new pool (only owner can do this)
	function addPool(uint ticketPrice, uint ticketCount, uint duration) public
	{
		require(msg.sender == owner);
		require(ticketPrice >= ticketPriceMultiple && ticketPrice % ticketPriceMultiple == 0);
		
		//Deploy a new pool
		pools.push(new SmartPool(ticketPrice, ticketCount, duration));
	}
	
	//Accessors (public)
	
	//Get Active Pools
	function getPoolCount() public constant returns(uint)
	{
		return pools.length;
	}
	function getPool(uint index) public constant returns(address)
	{
		require(index < pools.length);
		return pools[index];
	}
	
	//Get Ended Pools
	function getPoolDoneCount() public constant returns(uint)
	{
		return poolsDone.length;
	}
	function getPoolDone(uint index) public constant returns(address)
	{
		require(index < poolsDone.length);
		return poolsDone[index];
	}

	//Get History
	function getPoolHistoryCount() public constant returns(uint)
	{
		return poolsHistory.length;
	}
	function getPoolHistory(uint index) public constant returns(address)
	{
		require(index < poolsHistory.length);
		return poolsHistory[index];
	}
		
	//Buy tickets for a pool (public)
	function buyTicket(uint poolIndex, uint ticketCount, address websiteFeeAddr) public payable
	{
		require(poolIndex < pools.length);
		require(ticketCount > 0);
		
		//Get pool and check state
		SmartPool pool = pools[poolIndex];
		pool.checkEnd();
		require (!pool.isEnded());
		
		//Adjust ticketCount according to available tickets
		uint availableCount = pool.getAvailableTicketCount();
		if (ticketCount > availableCount)
			ticketCount = availableCount;
		
		//Get amount required and check msg.value
		uint amountRequired = ticketCount * pool.getTicketPrice();
		require(msg.value >= amountRequired);
		
		//If too much value sent, we send it back to player
		uint amountLeft = msg.value - amountRequired;
		
		//if no websiteFeeAddr given, the wallet get the fee
		if (websiteFeeAddr == address(0))
			websiteFeeAddr = wallet;
		
		//Compute fee
		uint feeAmount = amountRequired / feeDivider;
		
		addFee(websiteFeeAddr, feeAmount);
		addFee(wallet, feeAmount);
		
		//Add player to the pool with the amount minus the fees (1% + 1% = 2%)
		pool.addPlayer(msg.sender, ticketCount, amountRequired - 2 * feeAmount);
		
		//Send back amountLeft to player if too much value sent
		if (amountLeft > 0 && !msg.sender.send(amountLeft))
		{
			addFee(wallet, amountLeft); // if it fails, we take it as a fee..
		}
		
		updateSeed();
	}

	//Check pools end. (called by our console each 10 minutes, or can be called by anybody)
	function checkPoolsEnd() public 
	{
		for (uint i = 0; i < pools.length; i++)
		{
			//Check each pool and restart the ended ones
			checkPoolEnd(i);
		}
	}
	
	//Check end of a pool and restart it if it's ended (public)
	function checkPoolEnd(uint i) public 
	{
		require(i < pools.length);
		
		//Check end (if not triggered yet)
		SmartPool pool = pools[i];
		if (!pool.isEnded())
			pool.checkEnd();
			
		if (!pool.isEnded())
		{
			return; // not ended yet
		}
		
		updateSeed();
		
		//Store pool done and restart a pool to replace it
		poolsDone.push(pool);
		pools[i] = new SmartPool(pool.getTicketPrice(), pool.getTicketCount(), pool.getDurationS());
	}
	
	//Check pools done. (called by our console, or can be called by anybody)
	function checkPoolsDone() public 
	{
		for (uint i = 0; i < poolsDone.length; i++)
		{
			checkPoolDone(i);
		}
	}
	
	//Check end of one pool
	function checkPoolDone(uint i) public
	{
		require(i < poolsDone.length);
		
		SmartPool pool = poolsDone[i];
		if (pool.isTerminated())
			return; // already terminated
			
		if (!pool.canTerminate())
			return; // we need to wait a bit more before random occurs, so the seed has changed enough (60 minutes before ended and terminated states)
			
		updateSeed();
		
		//Terminate (pick a winner) and store pool done
		pool.terminate(randSeed);
	}

	//Send money of the pool to the winner (public)
	function sendPoolMoney(uint i) public
	{
		require(i < poolsDone.length);
		
		SmartPool pool = poolsDone[i];
		require (pool.isTerminated()); // we need a winner picked
		
		require(!pool.isMoneySent()); // money not sent
		
		uint amount = pool.getCurrAmount();
		address winner = pool.getWinner();
		pool.onMoneySent();
		if (amount > 0 && !winner.send(amount)) // the winner can't get his money (should not happen)
		{
			addFee(wallet, amount);
		}
		
		//Pool goes into history array
		poolsHistory.push(pool);
	}
		
	//Clear pools done array (called once a week by our console, or can be called by anybody)
	function clearPoolsDone() public
	{
		//Make sure all pools are terminated with no money left
		for (uint i = 0; i < poolsDone.length; i++)
		{
			if (!poolsDone[i].isMoneySent())
				return;
		}
		
		//"Clear" poolsDone array (just reset the length, instances will be override)
		poolsDone.length = 0;
	}
	
	//Get current fee value
	function getFeeValue(address a) public constant returns (uint)
	{
		if (a == address(0))
			a = msg.sender;
		return fees[a];
	}

	//Send fee to address (public, with a min amount required)
	function getMyFee(address a) public
	{
		if (a == address(0))
			a = msg.sender;
		uint amount = fees[a];
		require (amount > 0);
		
		fees[a] = 0;
		
		if (a == wallet)
		{
			WalletContract walletContract = WalletContract(a);
			walletContract.payMe.value(amount)();
		}
		else if (!a.send(amount))
			addFee(wallet, amount); // the fee can't be sent (hacking attempt?), so we take it... :-p
	}
	
	//Add fee (private)
	function addFee(address a, uint fee) private
	{
		if (fees[a] == 0)
			fees[a] = fee;
		else
			fees[a] += fee; // we don't check for overflow, if you're billionaire in fees, call getMyFee sometimes :-)
	}
}