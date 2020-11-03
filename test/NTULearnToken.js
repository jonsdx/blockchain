const NTULearnToken = artifacts.require("NTULearnToken");

contract("NTULearnToken", accounts => {
    it("have the initialised supply of tokens", async () => {
        let LearnToken = await NTULearnToken.deployed(); // get the deployed contract
        let supply = await LearnToken.totalSupply();
        // Check if the initialised supply matches
        assert.equal(supply, 10000000);
    });

    it("can transfer tokens", async () => {
        let LearnToken = await NTULearnToken.deployed(); // get the deployed contract
        let result = await LearnToken.transfer(
            accounts[1],
            1000
        );

        // get deposited balance
        let transferred = await LearnToken.balanceOf(accounts[1]);
        assert.equal(transferred, 1000);
    });
});