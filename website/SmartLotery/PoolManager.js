//ENTER YOUR ETHERUM ADDRESS HERE TO RECEIVE FEES
var MY_ADDRESS = '0x6f91cbcdddc3ac1c0f8153fed260c4ba33c041ab'; // <---- This address will get 1% fee for each ticket sold

//Contract informations
var MANAGER_ABI = [{"constant":false,"inputs":[{"name":"poolIndex","type":"uint256"},{"name":"ticketCount","type":"uint256"},{"name":"websiteFeeAddr","type":"address"}],"name":"buyTicket","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getPool","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"checkPoolsEnd","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"i","type":"uint256"}],"name":"checkPoolDone","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getPoolHistory","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getPoolDone","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"address"}],"name":"getFeeValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"i","type":"uint256"}],"name":"sendPoolMoney","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"a","type":"address"}],"name":"getMyFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getPoolDoneCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"checkPoolsDone","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getPoolHistoryCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPoolCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"i","type":"uint256"}],"name":"checkPoolEnd","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"ticketPrice","type":"uint256"},{"name":"ticketCount","type":"uint256"},{"name":"duration","type":"uint256"}],"name":"addPool","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"clearPoolsDone","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"wal","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
var POOL_ABI = [{"constant":true,"inputs":[],"name":"getDurationS","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCurrAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getTicketCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getAvailableTicketCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"checkEnd","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getBoughtTicketCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getStartDate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"randSeed","type":"uint256"}],"name":"terminate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getTicketPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPlayers","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getWinner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isMoneySent","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isEnded","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getStartBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getDuration","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getEndDate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"player","type":"address"},{"name":"ticketBoughtCount","type":"uint256"},{"name":"amount","type":"uint256"}],"name":"addPlayer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"canTerminate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isTerminated","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"onMoneySent","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getEndBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_ticketPrice","type":"uint256"},{"name":"_ticketCount","type":"uint256"},{"name":"_duration","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

var MANAGER_ADDR = '0x00fc2e075bc935c7c4283d277b90e6b9c822a105';

//Pool infos
function _Pool(index, contract)
{
	this.index = index;
	this.contract = contract;
	
	this.ticketPrice = 0;
	this.currAmount = 0;
	this.startDate = 0;
	this.duration = 0;
	this.endDate = 0;
	
	this.ticketCount = 0;
	this.boughtTicketCount = 0;
	this.availableTicketCount = 0;
	
	this.ended = false;
	this.canTerminate = false;
	this.terminated = false;
	this.moneySent = false;
	this.winner = '';

	this.startBlock = 0;
	this.endBlock = 0;

    this.tickets = [];

	this.propCount = 16;
	
	this.loaded = function(){};
	
	this.load = function(loadedCallback)
	{
		this.propLoaded = 0;
		if (typeof(loadedCallback) == 'function')
			this.loaded = loadedCallback;
		
		//The values must be loaded async to be compatible with metamask
		this.getPoolData('ticketPrice', 'getTicketPrice');
		this.getPoolData('currAmount', 'getCurrAmount');
		this.getPoolData('startDate', 'getStartDate');
		this.getPoolData('duration', 'getDuration');
		this.getPoolData('endDate', 'getEndDate');
		
		this.getPoolData('ticketCount', 'getTicketCount');
		this.getPoolData('boughtTicketCount', 'getBoughtTicketCount');
		this.getPoolData('availableTicketCount', 'getAvailableTicketCount');
		
		this.getPoolData('ended', 'isEnded');
		this.getPoolData('canTerminate', 'canTerminate');
		this.getPoolData('terminated', 'isTerminated');
		this.getPoolData('moneySent', 'isMoneySent');
		this.getPoolData('winner', 'getWinner');
		
		this.getPoolData('startBlock', 'getStartBlock');
		this.getPoolData('endBlock', 'getEndBlock');
        this.getPoolData('tickets', 'getPlayers');
    }
	
	this.getPoolData = function(name, func)
	{
		var oThis = this;
		this.contract[func](function(err, val)
		{
			oThis[name] = val;
			oThis.propLoaded++;
			if (oThis.propLoaded == oThis.propCount)
				oThis.loaded();
		});
	}
}

//Class to simplify web3js calls
function _PoolManager()
{
	this.manager = null;
	this.pools = {};
	this.poolsDone = {};
	this.poolCount = 0;
	this.poolDoneCount = 0;
	
	this.callbackPool = showPool;
	this.callbackPoolDone = showPool;
	
	this.inited = false;

	//Init with 2 callbacks to show pools
	this.init = function(callbackPool, callbackPoolDone)
	{
		if (this.inited)
		{
			showInfo('PoolManager already inited');
			return;
		}
		
		this.inited = true;
		if (typeof(callbackPool) == 'function')
			this.callbackPool = callbackPool;
		if (typeof(callbackPoolDone) == 'function')
			this.callbackPoolDone = callbackPoolDone;
			
		//ETH Init
		ETH.init();
		
		//Load manager
		this._loadManager();
		
		//Load pools
		this.loadPools();
	}
	
	this._loadManager = function()
	{
		this.manager = ETH.getContract(MANAGER_ABI, MANAGER_ADDR);
	}
	
	this.loadPools = function(callbackPool, callbackPoolDone)
	{
		showInfo('loading active pools');
		var oThis = this;

        this.loadCount = 0;
        this.loadDoneCount = 0;

        if (typeof(callbackPool) == 'function')
            this.callbackPool = callbackPool;
        if (typeof(callbackPoolDone) == 'function')
            this.callbackPoolDone = callbackPoolDone;

		ETH.get(this.manager.getPoolCount, [], function(poolCount)
		{
			oThis.poolCount = poolCount;
			console.log(poolCount + ' active pools');
			for (var i = 0; i < poolCount; i++)
				oThis.loadPool(i, false);
		});
		showInfo('loading pools done');
		ETH.get(this.manager.getPoolDoneCount, [], function(poolDoneCount)
		{
			console.log(poolDoneCount + ' ended pools');
			oThis.poolDoneCount = poolDoneCount;
			for (var i = 0; i < poolDoneCount; i++)
				oThis.loadPool(i, true);
		});
		showInfo('all loaded');
	}

	this.loadPool = function(index, isDone)
	{
		var address = '';
		
		var oThis = this;
		if (isDone)
        {
			ETH.get(this.manager.getPoolDone, [index], function(address)
			{
				oThis._loadPool(index, isDone, function()
                {
                    oThis.loadDoneCount++;
                    oThis._checkLoadedDone();
                }, address);
			});
        }
		else
        {
			ETH.get(this.manager.getPool, [index], function(address)
			{
				oThis._loadPool(index, isDone, function()
                {
                    oThis.loadCount++;
                    oThis._checkLoadedDone();
                }, address);
			});
        }
	}

    this._checkLoadedDone = function()
    {
        if (this.loadDoneCount < this.poolDoneCount || this.loadCount < this.poolCount)
            return;

        if (typeof (this.callbackPool) == 'function')
        {
            for (var i = 0; i < this.poolCount; i++)
				if (typeof(this.pools[i]) != 'undefined')
					this.callbackPool(i, this.pools[i]);
        }
        if (typeof (this.callbackPoolDone) == 'function')
        {
            for (var i = 0; i < this.poolDoneCount; i++)
				if (typeof(this.poolsDone[i]) != 'undefined')
					this.callbackPoolDone(i, this.poolsDone[i]);
        }
    }
	
	this._loadPool = function(index, isDone, callback, address)
	{
		var contract = ETH.getContract(POOL_ABI, address);
		
		showInfo('pool ' + index + ' at address ' + address + ' loaded');
		
		//Load pool data
		var pool = new _Pool(index, contract);
		var oThis = this;
		pool.load(function()
		{
			//Store and call callback function
			if (isDone)
			{
				oThis.poolsDone[index] = pool;
                callback();
			}
			else
			{
				oThis.pools[index] = pool;
                callback();
			}
		});
	}
	
	//Getters
	
	//Active pools
	this.getPoolCount = function()
	{
		return this.poolCount;
	}
	this.getPools = function()
	{
		return this.pools;
	}
	
	this.getPool = function(index)
	{
		return this.pools[index];
	}
	
	//Pools done
	this.getPoolDoneCount = function()
	{
		return this.poolDoneCount;
	}
	this.getPoolsDone = function()
	{
		return this.poolsDone;
	}
	this.getPoolDone = function(index)
	{
		return this.poolsDone[index];
	}
	
	//Fee value
	this.getFeeValue = function(callBack)
	{
		ETH.get(this.manager.getFeeValue, [MY_ADDRESS], function(res)
		{
			if (typeof(callBack) == 'function')
				callBack(res)
			else
				showFees(res); // default callback
		});
	}
	
	
	//Modifiers (transactions)
	
	//Make a player buy tickets
	this.buyTickets = function(poolIndex, ticketCount)
	{
		var ticketPrice = this.pools[poolIndex].ticketPrice;

		console.log("player buy tickets, waiting transaction to be mined " + (ticketPrice * ticketCount));
		
		var oThis = this;
		ETH.send(this.manager.buyTicket, [parseInt(poolIndex), parseInt(ticketCount), MY_ADDRESS], ticketPrice * ticketCount, function(res)
		{
			showInfo("player bought " + ticketCount + " tickets for pool " + poolIndex + "(ticketprice = " + ticketPrice + ") , waiting transaction to be mined");
		});
	}
	
	//Fees
	this.getMyFee = function()
	{
		ETH.send(this.manager.getMyFee, [MY_ADDRESS], 0, function(res)
		{
			showInfo("fees sent, waiting transaction to be mined");
		});
	}
	
	//Ending
	this.checkPoolEnd = function(index)
	{
		ETH.send(this.manager.checkPoolEnd, [index], 0, function(res)
		{
			showInfo("pool " + index + " updated, waiting transaction to be mined");
		});
	}
	
	this.checkPoolDone = function(index)
	{
		if (!this.poolsDone[index].canTerminate)
		{
			console.log('you have to wait 1 hour before picking a winner');
			return false;
		}
		ETH.send(this.manager.checkPoolDone, [index], 0, function(res)
		{
			showInfo("pool " + index + " updated, waiting transaction to be mined");
		});

        return true;
	}

	//Money retrieval
	this.sendPoolMoney = function(index)
	{
		ETH.send(this.manager.sendPoolMoney, [index], 0, function(res)
		{
			showInfo("money of pool " + index + " have been sent to the winner, waiting transaction to be mined");
		});
	}
	
	//Clear empty pools
	this.clearPoolsDone = function()
	{
		ETH.send(this.manager.clearPoolsDone, [], 0, function(res)
		{
			showInfo("pools updated, waiting transaction to be mined");
		});
	}
}


//Create global manager instance
var PoolManager = new _PoolManager();

//Show debug info
function showInfo(val)
{
	console.log(val);
}

//Show fees
function showFees(val)
{
	console.log("Fees = " + val.toString(10));
}

//Show pool infos (default function if no callback provided)
function showPool(index, pool)
{
	//TODO : rewrite this
	console.log('Id : ' + pool.index);
	console.log('State : ' + (pool.ended ? (pool.terminated ? (pool.moneySent ? "money sent" : "winner picked") : "ended, waiting to pick winner") : "open"));
	console.log('TicketPrice : ' + pool.ticketPrice.toString(10));
	console.log('CurrAmount : ' + pool.currAmount.toString(10));	
	console.log('StartDate : ' + pool.startDate);
	console.log('Duration : ' + (pool.duration * 15) + ' s');
	console.log('EndDate : ' + pool.endDate);
	console.log('Winner : ' + pool.winner);
}