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
    uint256 public MAX_TOKENS_SOLD = 100000; 
    uint256 public WAITING_PERIOD = 1 minutes;
    uint256 public AUCTION_DURATION = 20 minutes;

    /*
     *  Storage
     */
    NTULearnToken public LearnToken;
    address payable public wallet;
    address public owner;
    uint256 public ceiling;
    uint256 public startPrice;
    uint256 public clearPrice;
    uint256 public startBlock;
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
        AuctionEnded,
        TradingStarted
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
        if (stage == Stages.AuctionStarted && calcTokenPrice() < clearPrice)
            finalizeAuction();
        if (stage == Stages.AuctionEnded && now > endTime + WAITING_PERIOD)
            stage = Stages.TradingStarted;
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Contract constructor function sets owner.
    /// @param _wallet Learn wallet.
    /// @param _ceiling Auction ceiling.
    /// @param _startPrice Auction start price.
    function CreateAuction(address payable _wallet, uint256 _ceiling, uint256 _startPrice, uint256 _clearPrice)
        public
    {
        if (_wallet == address(0) || _ceiling == 0 || _startPrice == 0)
            // Arguments are null.
            revert();
        owner = msg.sender;
        wallet = _wallet;
        ceiling = _ceiling;
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
        if (stage==Stages.TradingStarted)
            return(4);
    }

    /// @dev Starts auction and sets startBlock.
    function startAuction()
        public
        isWallet
        atStage(Stages.AuctionSetUp)
    {
        stage = Stages.AuctionStarted;
        startBlock = block.number;
    }

    /// @dev Changes auction ceiling and start price factor before auction is started.
    /// @param _ceiling Updated auction ceiling.
    /// @param _startPrice Updated start price factor.
    function changeSettings(uint256 _ceiling, uint256 _startPrice)
        public
        isWallet
        atStage(Stages.AuctionSetUp)
    {
        ceiling = _ceiling;
        startPrice = _startPrice;
    }

    /// @dev Calculates current token price.
    /// @return Returns token price.
    function calcCurrentTokenPrice()
        public
        timedTransitions
        returns (uint256)
    {
        if (stage == Stages.AuctionEnded || stage == Stages.TradingStarted)
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

    function acceptMoney(address payable receiver)
        public
        payable
        isValidPayload
        atStage(Stages.AuctionStarted)
        returns (uint256 amount)
    {
        receiver = msg.sender;
        amount = msg.value;
        wallet.transfer(amount);
        bids[receiver] += amount;
        totalReceived += amount;
        BidSubmission(receiver, amount);
    }

    /// @dev Allows to send a bid to the auction.
    /// @param receiver Bid will be assigned to this address if set.
    function bid(address payable receiver)
        public
        payable
        isValidPayload
        //timedTransitions
        atStage(Stages.AuctionStarted)
        returns (uint256 amount)
    {
        // If a bid is done on behalf of a user via ShapeShift, the receiver address is set.
        if (receiver == address(0))
            receiver = msg.sender;
        amount = msg.value;

        // ceiling = max tokens sold * clearing price
        uint256 maxWei = (MAX_TOKENS_SOLD) * calcTokenPrice() - totalReceived;
        uint256 maxWeiBasedOnTotalReceived = ceiling - totalReceived;
        if (maxWeiBasedOnTotalReceived < maxWei)
            maxWei = maxWeiBasedOnTotalReceived;
        // Only invest maximum possible amount.
        if (amount > maxWei) {
            amount = maxWei;
            // Send change back to receiver address. In case of a ShapeShift bid the user receives the change back directly.
            if (!receiver.send(msg.value - amount))
            // Sending failed
                revert();
        }
        // Forward funding to ether wallet
        if (amount == 0||!wallet.send(amount))
            // No amount sent or sending failed
            revert();
        bids[receiver] += amount;
        totalReceived += amount;
        if (maxWei == amount)
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
        atStage(Stages.TradingStarted)
    {
        if (receiver == address(0))
            receiver = msg.sender;
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
        //return startPrice / (block.number - startBlock + 7500) + 1;
        return startPrice;
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
    function skipTime() 
        public 
    {
        WAITING_PERIOD = 0;
        finalizeAuction();
        stage = Stages.TradingStarted;
    }
}