
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

contract MockInterstellarEncoder {
    function getObjectClass(uint256 tokenId) external returns(uint8) {
        return uint8((tokenId << 56) >> 248);
    }
}

