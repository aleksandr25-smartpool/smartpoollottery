pragma solidity ^0.4.16;

// ------------------------------------------------------------------------------------------------
// ERC20Interface
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
// ------------------------------------------------------------------------------------------------
contract ERC20Interface {

	//Returns the name of the token
	function name() public constant returns (string name);
	
	//Returns the symbol of the token
	function symbol() public constant returns (string symbol);
	
	//Returns the number of decimals the token uses
	function decimals() public constant returns (uint8 decimals);

    //Returns the total token supply
    function totalSupply() public constant returns (uint256 totalSupply);

    //Returns the account balance of another account with address _owner
    function balanceOf(address _owner) public constant returns (uint256 balance);

    //Transfers _value amount of tokens to address _to
    function transfer(address _to, uint256 _value) public returns (bool success);

    //Transfers _value amount of tokens from address _from to address _to
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);

    //Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    //If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _value) public returns (bool success);
	
	//Returns the amount which _spender is still allowed to withdraw from _owner
    function allowance(address _owner, address _spender) public constant returns (uint256 remaining);

    //Triggered when tokens are transferred (included zero value transfer).
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    //Triggered whenever approve(address _spender, uint256 _value) is called (included zero value approve).
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}


//Define the token wallet which receive fees from games, and divide it to its shareholders
contract TokenWallet is ERC20Interface{
	
	//ERC20 infos
	string constant NAME = 'Smart Pool Lottery Token';
	string constant SYMBOL = 'SPLT';
	uint8 constant DECIMALS = 0;
	
	//ERC20 allowance
    mapping(address => mapping (address => uint256)) allowed;
    
	//Token supply
	uint tokenSupply;
	
	//Tokens attributions (how many tokens has each address)
	mapping(address => uint) tokens;
	address[] tokenAddresses;	// list of shareholders
	
	//Current balance to share
	uint totalBalance;
	
	//Reward pending (each address can withdraw its reward at any time)
	mapping(address => uint) pendingReward;
	
    //Create the wallet
    function TokenWallet() public
    {	
		//Init supply
		tokenSupply = 100000000;
		totalBalance = 0;
		
		tokens[msg.sender] = tokenSupply;
		tokenAddresses.push(msg.sender);
    }

	//Accessors
    function getBalance() public constant returns (uint)
    {
    	return totalBalance; // return the part not shared
    }
	
	//Distribute current balance to token owners
	function distribute() public
	{
		//Check min balance
		require(totalBalance >= tokenSupply);
		
		//Compute part of each shareholder
		uint onePercentValue = totalBalance / tokenSupply;
		uint realBalanceShared = onePercentValue * tokenSupply;
		
		//Update totalBalance
		totalBalance -= realBalanceShared;
		
		for (uint i = 0; i < tokenAddresses.length; i++)
		{
			address addr = tokenAddresses[i];
			if (pendingReward[addr] == 0)
				pendingReward[addr] = onePercentValue * tokens[addr];
			else
				pendingReward[addr] += onePercentValue * tokens[addr];
		}
	}
	
	//Used to clean addresses with no tokens (to optimize distribute function)
	function cleanAddresses() public
	{
		uint oldLength = tokenAddresses.length;
		uint newLength = 0;
		for (uint i = 0; i < oldLength; i++)
		{
			address addr = tokenAddresses[i];
			if (tokens[addr] > 0)
				tokenAddresses[newLength++] = addr;
		}
		tokenAddresses.length = newLength;
	}
	
	//Any address can call this to get its current reward (rewards are updated each week)
	function getReward(address a) public 
	{
		if (a == address(0))
			a = msg.sender;
		
		require (pendingReward[a] > 0);
		
		uint reward = pendingReward[a];
		pendingReward[a] = 0;
		
		if (!a.send(reward))
		{
			pendingReward[a] = reward; // if send failed, the sender can try again
		}
	}
	
	//Return the current pending reward value of the sender
	function getAvailableReward() public constant returns (uint) 
	{
		return pendingReward[msg.sender];
	}
	
	//ERC20 Implementation
	function name() public constant returns (string) { return NAME; }
	function symbol() public constant returns (string) { return SYMBOL; }
	function decimals() public constant returns (uint8) { return DECIMALS; }

    //Returns the total token supply
    function totalSupply() public constant returns (uint256) { return tokenSupply; }

    //Returns the account balance of another account with address _owner
    function balanceOf(address _owner) public constant returns (uint256) { return tokens[_owner]; }
	
	//Transfers _value amount of tokens to address _to
    function transfer(address _to, uint256 _value) public returns (bool success)
	{
	    _transfer(msg.sender, _to, _value);
		return true;
    }

	//Transfers _value amount of tokens from address _from to address _to
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) 
	{
        require(_value <= allowed[_from][msg.sender]);     // Check allowance
        allowed[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }
	
	//Internal transfer function
    function _transfer(address _from, address _to, uint _value) private
	{
		require (_value > 0);
        require(tokens[_from] >= _value);
		
		if (tokens[_to] == 0)
			tokenAddresses.push(_to);
        
		//Transfer
		tokens[_from] -= _value;
        tokens[_to] += _value;
		
		if (tokens[_from] == 0)
			cleanAddresses();
			
        Transfer(_from, _to, _value);
    }
	
    //Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    //If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _value) public returns (bool) 
	{
        allowed[msg.sender][_spender] = _value;
		Approval(msg.sender, _spender, _value);
        return true;
    }

	//Returns the amount which _spender is still allowed to withdraw from _owner
    function allowance(address _owner, address _spender) public constant returns (uint256)
	{
		return allowed[_owner][_spender];
	}

	
	/**
	* approve should be called when allowed[_spender] == 0. To increment
	* allowed value is better to use this function to avoid 2 calls (and wait until
	* the first transaction is mined)
	* From MonolithDAO Token.sol
	*/
	function increaseApproval (address _spender, uint _addedValue) public returns (bool success) {
		require(_addedValue > 0);
		assert(allowed[msg.sender][_spender] + _addedValue > allowed[msg.sender][_spender]);
		allowed[msg.sender][_spender] += _addedValue;
		Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
		return true;
	}

	function decreaseApproval (address _spender, uint _subtractedValue) public returns (bool success) {
		require(_subtractedValue > 0);
		uint oldValue = allowed[msg.sender][_spender];
		if (_subtractedValue > oldValue) {
		  allowed[msg.sender][_spender] = 0;
		} else {
		  allowed[msg.sender][_spender] = oldValue - _subtractedValue;
		}
		Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
		return true;
	}
	
	//Fallback function to receive value
	function () public payable {
		totalBalance += msg.value;
	}
	
	//Same as fallback, but can be called from another contracts
	function payMe() public payable {
		totalBalance += msg.value;
	}
}