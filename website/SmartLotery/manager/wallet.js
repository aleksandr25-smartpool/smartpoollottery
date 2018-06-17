//Wallet
var WALLET_ABI = [{"constant":false,"inputs":[],"name":"cleanAddresses","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"a","type":"address"}],"name":"getReward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"payMe","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getAvailableReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"distribute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];

//To transfer half tokens
var WALLET_ADDR = '0x6f91cbcdddc3ac1c0f8153fed260c4ba33c041ab';

class WalletController
{
	constructor()
	{
		this.wallet = ETH.getContract(WALLET_ABI, WALLET_ADDR);
		
		this.getBalance();
	}
	
	getTokens()
	{
		ETH.get(this.wallet.balanceOf, [ETH.account], function(res) 
		{
			showTokens(res);
		});
	}
	
	getBalance()
	{
		ETH.web3.eth.getBalance(WALLET_ADDR, function(err, res)
		{
			showBalance(res);
		});
	}
	
	distribute()
	{
		ETH.send(this.wallet.distribute, [], 0, function(res)
		{
		
		});
	}
	
	getReward()
	{
		ETH.send(this.wallet.getReward, [ETH.account], 0, function(res)
		{
		
		});
	}
}


//Redefine showAccount from ETH.js
function showAccount(val)
{
	$('#Account').html(val);
}

function showTokens(val)
{
	$('#Tokens').html(val.toString(10));
}
function showBalance(val)
{
	//ETH.web3.fromWei(result, 'ether')

	$('#WalletBalance').html(val.toString(10));
}

$(document).ready(function()
{
	ETH.init();
	
	$("#WalletAddr").html(WALLET_ADDR);
	
	var wallet = new WalletController();
	

	$("#UpdateTokens").click(function()
	{
		wallet.getTokens();
	});
	
	$("#Distribute").click(function()
	{
		wallet.distribute();
	});
	
	$("#GetReward").click(function()
	{
		wallet.getReward();
	});
});
