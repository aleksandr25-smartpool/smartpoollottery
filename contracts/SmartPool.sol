pragma solidity ^0.4.16;

//Define the pool
contract SmartPool {

    //Pool info
    uint currAmount;    //Current amount in the pool (=balance)
    uint ticketPrice;   //Price of one ticket
    uint startDate;		//The date of opening
	uint endDate;		//The date of closing (or 0 if still open)
	
	//Block infos (better to use block number than dates to trigger the end)
	uint startBlock;
	uint endBlock;
	
	//End triggers
	uint duration;		//The pool ends when the duration expire
    uint ticketCount;	//Or when the reserve of tickets has been sold
    bool ended;			//Current state (can't buy tickets when ended)
	bool terminated;	//true if a winner has been picked
	bool moneySent;		//true if the winner has picked his money
    
	//Min wait duration between ended and terminated states
	uint constant blockDuration = 15; // we use 15 sec for the block duration
	uint constant minWaitDuration = 240; // (= 3600 / blockDuration => 60 minutes waiting between 'ended' and 'terminated')
	
    //Players
    address[] players;	//List of tickets owners, each ticket gives an entry in the array
	
	//Winning info
    address winner;		//The final winner (only available when terminated == true)
     
    //Pool manager address (only the manager can call modifiers of this contract, see PoolManager.sol)
    address poolManager;
    
    //Create a pool with a fixed ticket price, a ticket reserve and/or a duration)
    function SmartPool(uint _ticketPrice, uint _ticketCount, uint _duration) public
    {
		//Positive ticket price and either ticketCount or duration must be provided
        require(_ticketPrice > 0 && (_ticketCount > 0 || _duration > blockDuration));
		
		//Check for overflows
		require(now + _duration >= now);
		
		//Set ticketCount if needed (according to max balance)
		if (_ticketCount == 0)
		{
			_ticketCount = (2 ** 256 - 1) / _ticketPrice;
		}
		
		require(_ticketCount * _ticketPrice >= _ticketPrice);
		
		//Store manager
		poolManager = msg.sender;
		
        //Init
        currAmount = 0;
		startDate = now;
		endDate = 0;
		startBlock = block.number;
		endBlock = 0;
        ticketPrice = _ticketPrice;
        ticketCount = _ticketCount;
		duration = _duration / blockDuration; // compute duration in blocks
        ended = false;
		terminated = false;
		moneySent = false;
		winner = 0x0000000000000000000000000000000000000000;
    }

	
	//Accessors
	function getPlayers() public constant returns (address[])
    {
    	return players;
    }
	
	function getStartDate() public constant returns (uint)
    {
    	return startDate;
    }
	
	function getStartBlock() public constant returns (uint)
    {
    	return startBlock;
    }
	
    function getCurrAmount() public constant returns (uint)
    {
    	return currAmount;
    }
	
	function getTicketPrice() public constant returns (uint)
	{
		return ticketPrice;
	}
	
	function getTicketCount() public constant returns (uint)
	{
		return ticketCount;
	}
	
	function getBoughtTicketCount() public constant returns (uint)
	{
		return players.length;
	}
	
	function getAvailableTicketCount() public constant returns (uint)
	{
		return ticketCount - players.length;
	}
	
	function getEndDate() public constant returns (uint)
	{
		return endDate;
	}
	
	function getEndBlock() public constant returns (uint)
    {
    	return endBlock;
    }
	
	function getDuration() public constant returns (uint)
	{
		return duration; // duration in blocks
	}
	
	function getDurationS() public constant returns (uint)
	{
		return duration * blockDuration; // duration in seconds
	}
		
	function isEnded() public constant returns (bool)
	{
		return ended;
	}

	function isTerminated() public constant returns (bool)
	{
		return terminated;
	}
	
	function isMoneySent() public constant returns (bool)
	{
		return moneySent;
	}
	
	function getWinner() public constant returns (address)
	{
		return winner;
	}

	//End trigger
	function checkEnd() public
	{
		if ( (duration > 0 && block.number >= startBlock + duration) || (players.length >= ticketCount) )
        {
			ended = true;
			endDate = now;
			endBlock = block.number;
        }
	}
	
    //Add player with ticketCount to the pool (only poolManager can do this)
    function addPlayer(address player, uint ticketBoughtCount, uint amount) public  
	{
		//Only manager can call this
		require(msg.sender == poolManager);
		
        //Revert if pool ended (should not happen because the manager check this too)
        require (!ended);
		
        //Add amount to the pool
        currAmount += amount; // amount has been checked by the manager
        
        //Add player to the ticket owner array, for each bought ticket
		for (uint i = 0; i < ticketBoughtCount; i++)
			players.push(player);
        
        //Check end	
		checkEnd();
    }
	
	function canTerminate() public constant returns(bool)
	{
		return ended && !terminated && block.number - endBlock >= minWaitDuration;
	}

    //Terminate the pool by picking a winner (only poolManager can do this, after the pool is ended and some time has passed so the seed has changed many times)
    function terminate(uint randSeed) public 
	{		
		//Only manager can call this
		require(msg.sender == poolManager);
		
        //The pool need to be ended, but not terminated
        require(ended && !terminated);
		
		//Min duration between ended and terminated
		require(block.number - endBlock >= minWaitDuration);
		
		//Only one call to this function
        terminated = true;

		//Pick a winner
		if (players.length > 0)
			winner = players[randSeed % players.length];
    }
	
	//Update pool state (only poolManager can call this when the money has been sent)
	function onMoneySent() public
	{
		//Only manager can call this
		require(msg.sender == poolManager);
		
		//The pool must be terminated (winner picked)
		require(terminated);
		
		//Update money sent (only one call to this function)
		require(!moneySent);
		moneySent = true;
	}
}