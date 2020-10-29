pragma solidity ^0.6.0;
import "./NTULearnToken.sol";

contract DutchAuction {

    /*
     *  Events
     */
    event BidSubmission(address indexed sender, uint256 amount);

    /*
     *  Constants
     */
    uint256 public MAX_TOKENS_SOLD = 10000000; 
    uint256 public AUCTION_DURATION = 20 minutes;

    /*
     *  Storage
     */
    NTULearnToken public LearnToken;
    address payable public wallet;
    address public owner;
    uint256 public startPrice;
    uint256 public clearPrice;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public totalReceived;
    uint256 public finalPrice;
    mapping (address => uint) public bids;
    Stages public stage;

    /*
     *  Enums
     */
    enum Stages {
        AuctionDeployed,
        AuctionSetUp,
        AuctionStarted,
        AuctionEnded
    }

    /*
     *  Modifiers
     */
    modifier atStage(Stages _stage) {
        if (stage != _stage)
            // Contract not in expected state
            revert();
        _;
    }

    modifier isOwner() {
        if (msg.sender != owner)
            // Only owner is allowed to proceed
            revert();
        _;
    }

    modifier isWallet() {
        if (msg.sender != wallet)
            // Only wallet is allowed to proceed
            revert();
        _;
    }

    modifier isValidPayload() {
        if (msg.data.length != 4 && msg.data.length != 36)
            revert();
        _;
    }

    modifier timedTransitions() {
        if (stage == Stages.AuctionStarted && now > startTime + AUCTION_DURATION)
            finalizeAuction();
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Contract constructor function sets owner.
    /// @param _wallet Learn wallet.
    /// @param _startPrice Auction start price.
    function CreateAuction(address payable _wallet, uint256 _startPrice, uint256 _clearPrice)
        public
    {
        if (_wallet == address(0) || _startPrice == 0 || _clearPrice == 0)
            // Arguments are null.
            revert();
        owner = msg.sender;
        wallet = _wallet;
        startPrice = _startPrice;
        clearPrice = _clearPrice;
        stage = Stages.AuctionDeployed;
    }

    /// @dev Setup function sets external contracts' addresses.
    /// @param _LearnToken Learn token address.
    function setup(address _LearnToken)
        public
        isOwner
        atStage(Stages.AuctionDeployed)
    {
        if (_LearnToken == address(0))
            // Argument is null.
            revert();
        LearnToken = NTULearnToken(_LearnToken);
        // Validate token balance
        if (LearnToken.balanceOf(wallet) < MAX_TOKENS_SOLD)
            revert();
        stage = Stages.AuctionSetUp;
    }

    function checkStage()
        public
        view
        returns (uint256)
    {
        if (stage==Stages.AuctionDeployed)
            return(0);
        if (stage==Stages.AuctionSetUp)
            return(1);
        if (stage==Stages.AuctionStarted)
            return(2);
        if (stage==Stages.AuctionEnded)
            return(3);
    }

    /// @dev Starts auction and sets startTime.
    function startAuction()
        public
        isWallet
        atStage(Stages.AuctionSetUp)
    {
        stage = Stages.AuctionStarted;
        startTime = now;
    }

    /// @dev Changes price factor before auction is started.
    /// @param _startPrice Updated start price factor.
    function changeSettings(uint256 _startPrice, uint _clearPrice)
        public
        isWallet
        atStage(Stages.AuctionSetUp)
    {
        startPrice = _startPrice;
        clearPrice = _clearPrice;
    }

    /// @dev Calculates current token price.
    /// @return Returns token price.
    function calcCurrentTokenPrice()
        public
        timedTransitions
        returns (uint256)
    {
        if (stage == Stages.AuctionEnded)
            return finalPrice;
        return calcTokenPrice();
    }

    /// @dev Returns correct stage, even if a function with timedTransitions modifier has not yet been called yet.
    /// @return Returns current auction stage.
    function updateStage()
        public
        timedTransitions
        returns (Stages)
    {
        return stage;
    }

    /// @dev Allows to send a bid to the auction.
    /// @param receiver Bid will be assigned to this address if set.
    function bid(address payable receiver)
        public
        payable
        isValidPayload
        timedTransitions
        atStage(Stages.AuctionStarted)
        returns (uint256 amount)
    {
        // If a bid is done on behalf of a user via ShapeShift, the receiver address is set.
        if (receiver == address(0))
            receiver = msg.sender;
        amount = msg.value;

        uint256 tokenSupply = tokensLeft();
        uint256 currentPrice = calcTokenPrice();
        uint256 maxWei = tokenSupply * currentPrice;
        uint256 returnAmt = 0;
        // Unable to buy at least one token
        if (amount < currentPrice)
            revert();
        // Only invest maximum possible amount 
        if (amount >= maxWei) {
                amount = maxWei;
            returnAmt = msg.value - amount;
            // Send change back to receiver address.
            if (!receiver.send(returnAmt))
            // Sending failed
                revert();
        }
        // Forward funding to ether wallet
        if (amount == 0||!wallet.send(amount))
            // No amount sent or sending failed
            revert();
        bids[receiver] += amount;
        totalReceived += amount;
        uint256 cap = MAX_TOKENS_SOLD * currentPrice;
        if (totalReceived >= cap)
            // When maxWei is equal to the big amount the auction is ended and finalizeAuction is triggered.
            finalizeAuction();
        BidSubmission(receiver, amount);
    }

    /// @dev Claims tokens for bidder after auction.
    /// @param receiver Tokens will be assigned to this address if set.
    function claimTokens(address receiver)
        public
        isValidPayload
        timedTransitions
        atStage(Stages.AuctionEnded)
    {
        if (receiver == address(0))
            receiver = msg.sender;
        // tokenCount will be rounded down for all successful bids
        uint256 tokenCount = bids[receiver]  / finalPrice;
        bids[receiver] = 0;
        LearnToken.transferFrom(wallet, receiver, tokenCount);
    }

    /// @dev Calculates token price.
    /// @return Returns token price.
    function calcTokenPrice()
        public
        view
        returns (uint256)
    {
        //need to scale from start price to clear price
        uint256 interval = AUCTION_DURATION / 5;
        uint256 decrement = (startPrice - clearPrice) / 4;
        if (now < startTime + interval)
            return startPrice;
        else if (now < startTime + (2*interval))
            return startPrice - decrement;
        else if (now < startTime + (3*interval))
            return startPrice - (2*decrement);
        else if (now < startTime + (4*interval))
            return startPrice - (3*decrement);
        else{
            return clearPrice;
        }
    }

    function endAuction() 
        public 
    {
        finalizeAuction();
    }

    function skipTime()
        public
    {
        AUCTION_DURATION = 0 minutes;
    }

    function tokensLeft()
        public
        view
        returns (uint256)
    {
        uint256 currPrice = calcTokenPrice(); 
        uint256 soldTokens = totalReceived / currPrice;
        uint256 tokensRemaining = MAX_TOKENS_SOLD - soldTokens;
        return tokensRemaining; 
    }

    /*
     *  Private functions
     */
    function finalizeAuction()
        private
    {
        stage = Stages.AuctionEnded;
        finalPrice = calcTokenPrice();
        uint256 soldTokens = totalReceived / finalPrice;
        // Auction contract burns all unsold tokens
        LearnToken.burnFrom(wallet, LearnToken.totalSupply() - soldTokens);
        endTime = now;
    }
}