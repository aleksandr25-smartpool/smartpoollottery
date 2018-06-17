//Helper for web3 calls

function _ETH()
{
	this.account = eth.coinbase;
	
	this.init = function() 
	{
		
	}
	
	this.deployContract = function(abi, bytes, callback)
	{
		var oThis = this;
		
		console.log('deploy from ' + this.account);
		
		var contractData = eth.contract(abi).new.getData({from: this.account, data: bytes});
		eth.estimateGas({data: contractData}, function(err, estimatedGas)
		{
			eth.contract(abi).new({from: this.account, data: bytes, gas: estimatedGas + 10000, gasPrice: oThis.web3.toWei(2, 'gwei') }, function (err, contract) 
			{
				if (err)
				{
					console.log('error');
					console.log(err);
					return;
				}
				else if (contract.address)
					callback(contract);					
				else
				{
					console.log('waiting for mining');
					
				}
			});
		});
	}
	
	this.getContract = function(abi, address)
	{
		return eth.contract(abi).at(address);
	}

	this.send = function(callable, params, value, callback)
	{
		var oThis = this;
		
		//Transaction params
		var transactionParams = {'from': this.account};
		if (value > 0) transactionParams.value = value;	
		
		//Add transaction params
		params[params.length] = transactionParams;
		
		//Bind our callback
		params[params.length] = function(err, estimatedGas)
		{
			params.pop(); // remove it
			
			console.log('gas : ' + estimatedGas);
			
			//Check gas limit
			if (estimatedGas > 4476768 - 10000)
			{
				console.log('the transaction will fail');
				return;
			}
			
			//Set gas
			transactionParams.gas = estimatedGas + 10000;
		
			//Send transaction
			oThis._send(callable, params, callback);
		};
		
		//Call estimateGas with our params
		callable.estimateGas.apply(callable, params);
	}
	
	this.get = function(callable, params, callback)
	{
		params[params.length] = {}; // empty transaction params
		this._send(callable, params, callback);
	}
	
	this._send = function(callable, params, callback)
	{		
		//Add params for callback
		params[params.length] = function(err, res)
		{
			params.pop(); // remove transactionParams
			params.pop(); // remove callback
			if (err)
			{
				console.log(err);
				return;
			}
				
			callback(res);
		};
		
		//Call the function with our params
		callable.apply(callable, params);
	}
	
	this.getBalance = function(address, callback)
	{
		this._send(eth.getBalance, [address, eth.defaultBlock], callback);
	}
	
	this.fromWei = function(wei, unit)
	{
		return fromWei(wei, unit);
	}
}

//Instance
ETH = new _ETH();

//Show error
function showError(val)
{
	console.log(val);
}


//Show account info
function showAccount(val)
{
	console.log("Account = " + val);
}