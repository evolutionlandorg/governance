// SPDX-License-Identifier: MIT

pragma solidity ^0.7.1;

/**
 * @dev Interface of the evolution land.
 */
interface ISettingsRegistry {
    /**
     * @dev Returns the lands owned by address `account`.
     */
    function addressOf(bytes32 _propertyName) external view returns (address);
}

