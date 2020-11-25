//SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "./LPTokenWrapper.sol";
import "./interfaces/ISettingsRegistry.sol";
import "./interfaces/IInterstellarEncoder.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EvolutionTeller is LPTokenWrapper, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping(address => uint) public stakingLock;
    uint256 public lock = 0;

    ISettingsRegistry public registry;
    uint256 public landVoteRate = 100 ether;
    uint256 public apostleVoteRate = 1 ether;
    uint256 public tokenVoteRate = 10;
    //"0x434f4e54524143545f4f424a4543545f4f574e45525348495000000000000000"
    bytes32 public constant CONTRACT_OBJECT_OWNERSHIP = "CONTRACT_OBJECT_OWNERSHIP";
    bytes32 public constant CONTRACT_INTERSTELLAR_ENCODER = "CONTRACT_INTERSTELLAR_ENCODER";

    bool private withdrawProtected = false;

    //event
    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);

    constructor(address _registry, address _voter) LPTokenWrapper(_voter) {
        registry = ISettingsRegistry(_registry);
    }
    
    function setLock(uint256 _lock) onlyOwner external {
        lock = _lock;
    }

    // if lock too long or we have some other bugs
    function protectWithdraw() onlyOwner external {
        withdrawProtected = true;
    }

    function setLandVoteRate(uint256 _landVoteRate) onlyOwner external {
        landVoteRate = _landVoteRate;
    }

    function stake(uint256 amount) public override {
        require(amount > 0, "Cannot stake 0");
        stakingLock[msg.sender] = lock.add(block.number);
        super.stake(amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public override {
        require(amount > 0, "Cannot withdraw 0");
        if (!withdrawProtected) {
            require(stakingLock[msg.sender] < block.number,"!locked");
        }
        super.withdraw(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function balanceOfOwnerShip(address account, IInterstellarEncoder.ObjectClass objectClass) internal view returns (uint256) {
        address objectOwnership = registry.addressOf(CONTRACT_OBJECT_OWNERSHIP);
        address interstellarEncoder = registry.addressOf(CONTRACT_INTERSTELLAR_ENCODER);
        uint256 length = ERC721(objectOwnership).balanceOf(account);
        uint256 balance = 0;
        for(uint i = 0; i < length; i++) {
            uint256 tokenId = ERC721(objectOwnership).tokenOfOwnerByIndex(account, i);
            if (IInterstellarEncoder(interstellarEncoder).getObjectClass(tokenId) == uint8(objectClass)) {
                balance = balance.add(1);
            }
        }
        return balance;
    }

    function balanceOfLandOwner(address account) public view returns (uint256) {
        return balanceOfOwnerShip(account, IInterstellarEncoder.ObjectClass.LAND);
    }

    function balanceOfApostleOwner(address account) public view returns (uint256) {
        return balanceOfOwnerShip(account, IInterstellarEncoder.ObjectClass.APOSTLE);
    }

	function BalanceOfStaking(address account) external view returns (uint256) {
		return super.balanceOf(account);
	}

    function balanceOf(address account) public view override returns (uint256) {
        return (super.balanceOf(account).mul(tokenVoteRate))
        .add(balanceOfLandOwner(account).mul(landVoteRate))
        .add(balanceOfApostleOwner(account).mul(apostleVoteRate));
    }
}

