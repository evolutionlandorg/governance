// SPDX-License-Identifier: MIT

pragma solidity ^0.7.1;

interface IInterstellarEncoder {
    enum ObjectClass { 
        NaN,
        LAND,
        APOSTLE,
        OBJECT_CLASS_COUNT
    }
    function getObjectClass(uint256 _tokenId) external view returns (uint8);
}
