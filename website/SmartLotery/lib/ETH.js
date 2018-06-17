//Helper for web3 calls (to write DAPP)

//Local provider (uncomment this for local use)
//var WEB_PROVIDER = "http://localhost:8101";

class _ETH
{
	constructor()
	{
		this.web3 = null;
		this.account = '';
	}
	
	init()
	{
		//Web3 init
		if (typeof web3 !== 'undefined')
			this.web3 = new Web3(web3.currentProvider);
		else if (typeof(WEB_PROVIDER) != 'undefined')
			this.web3 = new Web3(new Web3.providers.HttpProvider(WEB_PROVIDER));
		else
		{
			showError("You need <a href='https://github.com/ethereum/mist/releases' target='_blank'>Mist</a> browser, or <a href='https://metamask.io/' target='_blank'>MetaMask</a> browser extension (for Chrome & Firefox)");
			return;
		}
		
		//Get account
		this.account = '';
		
		//Listen account change
		var oThis = this;
		setInterval(function() {
		  if (oThis.web3.eth.accounts[0] !== oThis.account) {
			oThis.account = oThis.web3.eth.accounts[0];
			showAccount(oThis.account);
		  }
		}, 300);
	}
	
	deployContract(abi, bytes, params, callback)
	{
		var oThis = this;
		
		console.log('deploy from ' + this.account);
		
		var contractData = this.web3.eth.contract(abi).new.getData(params, {from: this.account, data: bytes});
		this.web3.eth.estimateGas({data: contractData}, function(err, estimatedGas)
		{
			oThis.web3.eth.contract(abi).new(params, {from: this.account, data: bytes, gas: estimatedGas + 10000, gasPrice: oThis.web3.toWei(2, 'gwei') }, function (err, contract) 
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
	
	getContract(abi, address)
	{
		return this.web3.eth.contract(abi).at(address);
	}

	send(callable, params, value, callback)
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
	
	get(callable, params, callback)
	{
		params[params.length] = {}; // empty transaction params
		this._send(callable, params, callback);
	}
	
	_send(callable, params, callback)
	{		
		//Add params for callback
		params[params.length] = function(err, res)
		{
			params.pop(); // remove transactionParams
			params.pop(); // remove callback
			if (err)
			{
				//console.log(err);
				return;
			}
				
			callback(res);
		};
		
		//Call the function with our params
		callable.apply(callable, params);
	}
	
	getBalance(address, callback)
	{
		this._send(this.web3.eth.getBalance, [address, this.web3.eth.defaultBlock], callback);
	}
	
	fromWei(wei, unit)
	{
		return this.web3.fromWei(wei, unit);
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