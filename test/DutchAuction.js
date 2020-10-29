const DutchAuction = artifacts.require("DutchAuction");
const NTULearnToken = artifacts.require("NTULearnToken");

contract("DutchAuction", accounts => {
    it("created the auction correctly", async () => {
        let Auction = await DutchAuction.deployed(); // get the deployed contract
        let LearnToken = await NTULearnToken.deployed();
        await Auction.CreateAuction(accounts[0], 10, 5);
        let owner = await Auction.owner();
        let wallet = await Auction.wallet(); 
        let startPrice = await Auction.startPrice();
        let clearPrice = await Auction.clearPrice();
        assert.equal(owner, accounts[0]); 
        assert.equal(wallet, accounts[0]);
        assert.equal(startPrice, 10); 
        assert.equal(clearPrice, 5); 
    });

    it("set up token address correctly", async () => {
        let Auction = await DutchAuction.deployed(); // get the deployed contract
        let LearnToken = await NTULearnToken.deployed();
        await Auction.checkStage() == 0;
        await Auction.setup(LearnToken.address); 
        await Auction.checkStage() == 1;
        num = await Auction.checkStage();
        assert.equal(num, 1);
        let balance = await LearnToken.balanceOf(accounts[0]);
        assert.equal(balance, 10000000);
        await LearnToken.approve(Auction.address, 10000000);
        let allowance = await LearnToken.allowance(accounts[0], Auction.address);
        assert.equal(allowance, 10000000);
    });

    it("can start auction correctly", async () => {
        let Auction = await DutchAuction.deployed(); // get the deployed contract
        await Auction.checkStage() == 1;
        await Auction.startAuction();
        await Auction.checkStage() == 2;
        let num = await Auction.checkStage();
        assert.equal(num, 2);
    });

    it("allows a bid to be sent", async () => {
        let Auction = await DutchAuction.deployed(); // get the deployed contract
        let LearnToken = await NTULearnToken.deployed();
        await Auction.checkStage() == 2;
        //Do bidding stuff
        let price = await Auction.calcTokenPrice();

        await Auction.bid(accounts[0], 
            {from: accounts[0],value: web3.utils.toWei("100", "wei")});
        await Auction.bid(accounts[1], 
            {from: accounts[1],value: web3.utils.toWei("500", "wei")});
        await Auction.bid(accounts[2], 
            {from: accounts[2],value: web3.utils.toWei("1000", "wei")});
        // await Auction.bid(accounts[3], 
        //     {from: accounts[3],value: web3.utils.toWei("9999999999", "wei")});

        // await Auction.endAuction();
        await Auction.skipTime();
        let num = await Auction.checkStage();
        assert.equal(num, 2);
        });

    it("completes the auction", async () => {
        let Auction = await DutchAuction.deployed(); // get the deployed contract
        let LearnToken = await NTULearnToken.deployed();

        Auction.claimTokens(accounts[0]);
        Auction.claimTokens(accounts[1]);
        Auction.claimTokens(accounts[2]);
        Auction.claimTokens(accounts[3]);

        let buyer0 = await LearnToken.balanceOf(accounts[0]);
        let buyer1 = await LearnToken.balanceOf(accounts[1]);
        let buyer2 = await LearnToken.balanceOf(accounts[2]);    
        let buyer3 = await LearnToken.balanceOf(accounts[3]);   
        let balance = await LearnToken.totalSupply();

        assert.equal(buyer0, 20); 
        assert.equal(buyer1, 100); 
        assert.equal(buyer2, 200);
        assert.equal(buyer3, 0);
    });
  });