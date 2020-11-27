//SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol";

contract SnapshotProxy is TransparentUpgradeableProxy {
	constructor(
		address _logic,
		address _admin,
		bytes memory _data
	) public payable TransparentUpgradeableProxy(_logic, _admin, _data) {}
}
