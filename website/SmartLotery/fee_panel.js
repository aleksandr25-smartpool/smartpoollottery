//Init (MY_ADDRESS must be defined in PoolManager.js)
$(document).ready(function()
{
	//Init
	PoolManager.init();
	
	//Show current address
	$('#WebsiteAddr').html(MY_ADDRESS);
	
	//Show fees
	PoolManager.getFeeValue(showFees);
	
	//Buttons
	$('#BtnRefreshFee').click(function()
	{
		PoolManager.getFeeValue(showFees);
	});
	$('#BtnSendMyFee').click(function()
	{
		PoolManager.getMyFee();
	});
});

//Redefine showError from ETH.js
function showError(val)
{
	$('#Error').html(val);
}
//Redefine showFees from PoolManager.js
function showFees(val)
{
	$('#CurrentFees').html(val.toString(10));
}