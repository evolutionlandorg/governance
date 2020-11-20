// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

contract MockRegister {
    mapping(bytes32=>address) addresses;

    function addAddress(bytes32 name, address addr) external {
        addresses[name] = addr;
    }

    function addressOf(bytes32 _propertyName) external view returns (address) {
        return addresses[_propertyName];
    }
}
