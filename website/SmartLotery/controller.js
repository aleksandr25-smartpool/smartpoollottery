

var poolNames = ['The John M. pool', 'The Jihan W. pool', 'The Nick S pool', 'The Bobby & Charles L. pool', 'The Andreas A. pool', 'The Vitalik B. pool'];
var poolMax = ['inf', '10', '100', '10,000', '100,000', '10,000,000'];

//Init
$(document).ready(function()
{
	//Init manager
	PoolManager.init(fillPool, fillPoolDone);
	
	//Global action buttons
	$('#BtnClearPools').click(function()
	{
		PoolManager.clearPoolsDone();
	});

	$('#BtnRefreshAll').click(function()
	{
        refreshAll();
	});
});


//Redefine showError from ETH.js
function showError(val)
{
	$('#Error').html(val);
}
//Redefine showAccount from ETH.js
function showAccount(val)
{
	$('#Account').html(val);
    refreshAll();
}


//Redefine fillPool (callback) from PoolManager.js, called when a pool is loaded
function fillPool(index, pool)
{
	//Replace info if line exists
	var poolLine = $("#Pool" + index);
	if (poolLine.length > 0)
	{
		fillPoolLine(poolLine, pool);
		return;
	}
	
	//Else create new line from empty line
	var poolEmptyLine = $("#PoolLine");
	
	//Insert pool line in dom with new id
	poolLine = poolEmptyLine.clone();
	$('#PoolList').append(poolLine);
	poolLine.attr("id", "Pool" + index);
		
	//Fill pool line
	fillPoolLine(poolLine, pool);
	
	//Bind pool buttons
	bindPoolBtns(index, pool.ended, pool.terminated, pool.moneySent);
	
	//Show line
	poolLine.show();
}

function fillPoolDone(index, pool)
{	
	//Replace info if line exists
	var poolLine = $("#PoolDone" + index);
	if (poolLine.length > 0)
	{
		fillPoolLine(poolLine, pool);
		return;
	}
	
	var poolEmptyLine = $("#PoolLine");
	
	//Insert pool line in dom with new id
	poolLine = poolEmptyLine.clone();
	$('#PoolDoneList').append(poolLine);
	poolLine.attr("id", "PoolDone" + index);
		
	//Set pool infos
	fillPoolLine(poolLine, pool);
	
	//Bind pool buttons
	bindPoolBtns(index, pool.ended, pool.terminated, pool.moneySent);
	
	//Show line
	poolLine.show();
}
function Date_Format(date)
{
    if (typeof(date.getDate) !== 'function')
        date = new Date(date * 1000); // create date with sec param
    var day = date.getDate(); if (day < 10) day = '0' + day;
    var month = date.getMonth() + 1;  if (month < 10) month = '0' + month;
    var hours = ''+date.getHours(); if (hours.length == 1) hours = '0' + hours;
    var min = ''+date.getMinutes(); if (min.length == 1) min = '0' + min;

    return date.getFullYear() + '/' + month + '/' + day + ' ' + hours + ':' + min;
}
function fillPoolLine(poolLine, pool)
{
    //Get name of the pool
    var poolName = poolNames[0];
    var ticketCount = pool.ticketCount.toString(10);
    var maxEth = ETH.fromWei(pool.ticketCount * pool.ticketPrice, 'ether').toString(10);
    if (ticketCount.length > 32)
    {
        ticketCount = '<span class="infinity">&infin;</span>';
        maxEth = '<span class="infinity">&infin;</span>';
    }
    else
    {
		var i = 1;
        for (i = 1; i < poolMax.length; i++)
        {
            if (parseInt(maxEth) < parseInt(poolMax[i].replace(',','')))
                break;
        }
		i--;
		poolName = poolNames[i];
		maxEth = poolMax[i];
    }

	poolLine.find('.PoolId').html(''+pool.index);
	poolLine.find('.PoolName').html(poolName);
	poolLine.find('.PoolState').html((pool.ended ? (pool.terminated ? (pool.moneySent ? "money sent" : "winner picked") : "ended, waiting to pick winner") : "open"));
	poolLine.find('.PoolTicketPrice').html(ETH.fromWei(pool.ticketPrice, 'ether').toString(10));



    poolLine.find('.PoolTicketInfo').html(pool.boughtTicketCount.toString(10) + '/' + ticketCount);

    poolLine.find('.PoolEth').html(maxEth);

	poolLine.find('.PoolCurrAmount').html(ETH.fromWei(pool.currAmount, 'ether').toString(10));
	poolLine.find('.PoolStartDate').html(Date_Format(pool.startDate));
	poolLine.find('.PoolDuration').html(''+ (pool.duration) + ' blocks');
	poolLine.find('.PoolEndDate').html(''+(pool.endDate == 0 ? '-' : Date_Format(pool.endDate)));
	poolLine.find('.PoolWinner').html(pool.winner);

	poolLine.find('.PoolStartBlock').html(pool.startBlock.toString(10));
	poolLine.find('.PoolEndBlock').html(pool.endBlock.toString(10));

    if (pool.ended)
    {
        poolLine.find('.PoolEndedInfo').show();
        poolLine.find('.PoolStartInfo').hide();
    }
    else
    {
        poolLine.find('.PoolEndedInfo').hide();
        poolLine.find('.PoolStartInfo').show();
    }

    //Find tickets owned
    var ticketOwned = 0;
    for (var i = 0; i < pool.tickets.length; i++)
    {
        if (pool.tickets[i] == ETH.account)
            ticketOwned++;
    }

    if (ticketOwned > 0)
    {
        var poolTicketLine = $(".TicketOwnedLine").clone();
        var poolTicketContainer = pool.ended?$("#TicketEnded"):$("#TicketActive");

        //Insert ticket line in dom
        poolTicketContainer.append(poolTicketLine);
        poolTicketLine.removeClass('TicketOwnedLine');

        //Fill ticket bought info
        poolTicketLine.find('.TicketPoolName').html(poolName);
        poolTicketLine.find('.TicketPoolIndex').html(pool.index);
        poolTicketLine.find('.TicketPoolValue').html(ticketOwned + ' ticket' + (ticketOwned > 1 ? 's':''));
        poolTicketLine.find('.TicketPoolChance').html((ticketOwned * 100 / pool.boughtTicketCount).toFixed(2));
    }
}

//Pool buttons
function bindPoolBtns(poolId, isDone, isTerminated, isMoneySent)
{
	var poolLine = $("#" + (isDone?"PoolDone":"Pool") + poolId);
	var btnPlay = poolLine.find('.BtnPlay');
	var btnSendMoney = poolLine.find('.BtnSendMoney');
	var btnRefresh = poolLine.find('.BtnRefresh');
	var btnEnd = poolLine.find('.BtnPoolEnd');
	var ticketCountTxt = poolLine.find('.TicketCount');
	
	//unbind previous events
	btnPlay.unbind('click');
	btnSendMoney.unbind('click');
	btnRefresh.unbind('click');
	btnEnd.unbind('click');

    poolLine.find('.PoolMsg').show();
    poolLine.find('.PoolSendMsg').hide();


    //Play
	if (!isDone)
	{
		btnSendMoney.hide();
		btnPlay.click(function()
		{		
			var ticketCount = ticketCountTxt.val();
			
			//Send transaction
			PoolManager.buyTickets(poolId, ticketCount);
		});
			
		//End
        btnEnd.html('End pool');
		btnEnd.click(function()
		{
			//Send transaction
			PoolManager.checkPoolEnd(poolId);
		});
	}
	else
	{
        poolLine.find('.PoolMsg').html('You have to wait 1 hour before picking a winner : <br>(called automatically by our bot because it costs gas)');

		ticketCountTxt.hide();
		btnPlay.hide();

        btnEnd.html('Pick a winner');
		btnEnd.click(function()
		{		
			//Send transaction
			PoolManager.checkPoolDone(poolId);
		});
		btnSendMoney.click(function()
		{		
			//Send transaction
			PoolManager.sendPoolMoney(poolId);
		});

        if (isTerminated)
        {
            if (isMoneySent)
                btnSendMoney.hide();
            else
            {
                btnSendMoney.show();
                poolLine.find('.PoolSendMsg').show();
            }

            btnEnd.hide();
            poolLine.find('.PoolMsg').hide();
        }
        else
        {
            btnSendMoney.hide();
            btnEnd.show();
        }
	}
		
	//Refresh
	btnRefresh.click(function()
	{
        refreshAll();
	});
}

function refreshAll()
{
    console.log('refreshAll');

    //Refresh all (so we can see the pool ended AND the new pool created)
    $('#PoolList, #PoolDoneList, .TicketOwned').children().remove();
    PoolManager.loadPools(fillPool, fillPoolDone);
}