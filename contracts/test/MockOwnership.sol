// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockOwnership is ERC721, Ownable {
    uint128 landObjectId = 0;
    uint128 apostleObjectId = 0;

    uint8 LAND = 1;
    uint8 APOSTLE = 2;

    constructor() ERC721("OwnerShip", "OSP") {
    }

    function obj2tokenID(uint128 objID, uint8 objClass) internal returns(uint256) {
        return (uint256(objClass) << 192) + uint256(objID);
    }

    function mintLand() external onlyOwner {
        landObjectId = landObjectId + 1;
        uint256 tokenid = obj2tokenID(landObjectId, LAND);
        _safeMint(owner(), tokenid);
    }

    function mintApostle() external onlyOwner {
        apostleObjectId = apostleObjectId + 1;
        uint256 tokenid = obj2tokenID(apostleObjectId, APOSTLE);
        _safeMint(owner(), tokenid);
    }

    function transferLand(address to, uint128 id) external {
        uint256 tokenid = obj2tokenID(id, LAND);
        transfer(to, tokenid);
    }

    function transferApostle(address to, uint128 id) external {
        uint256 tokenid = obj2tokenID(id, APOSTLE);
        transfer(to, tokenid);
    }

    function transfer(address to, uint256 tokenId) internal {
        _transfer(msg.sender, to, tokenId);
    }
}
