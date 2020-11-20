// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockLand is ERC721, Ownable {
    uint256 tokenid = 0;

    constructor() ERC721("Land", "LND") {
    }

    function mint() external onlyOwner {
        tokenid = tokenid + 1;
        _safeMint(owner(), tokenid);
    }


    function transfer(address to, uint256 tokenId) external {
        _transfer(msg.sender, to, tokenId);
    }
}
