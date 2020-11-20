// SPDX-License-Identifier: MIT

pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockRewardToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("yKton token", "yKton") public {
        _mint(msg.sender, initialSupply);
    }
}
