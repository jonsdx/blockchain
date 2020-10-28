pragma solidity ^0.6.0;
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

contract NTULearnToken is ERC20Burnable {
    constructor(uint256 initialSupply) public ERC20("NTULearnToken", "NLT") {
        _mint(msg.sender, initialSupply);
    }
}