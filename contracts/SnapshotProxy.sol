//SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITeller.sol";

contract SnapshotProxy is Ownable {
    address public teller;

    constructor(address addr) {
        teller = addr;
    }

    function balanceOf(address account) external view returns (uint256) {
        return ITeller(teller).balanceOf(account);
    }

    function setTeller(address addr) external onlyOwner {
        teller = addr;
    }
}

