// SPDX-License-Identifier: MIT

pragma solidity ^0.7.1;

/**
 * @dev Interface of the VoteContract used by proxy contract to get vote power.
 */
interface ITeller {
    /**
     * @dev Returns the vote power owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);
}

