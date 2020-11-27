//SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";
import "./interfaces/ISettingsRegistry.sol";
import "./interfaces/IInterstellarEncoder.sol";
import "./LPTokenWithReward.sol";

contract EvolutionTeller is Initializable, LPTokenWithReward {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    //"0x434f4e54524143545f4f424a4543545f4f574e45525348495000000000000000"
    bytes32 public constant CONTRACT_OBJECT_OWNERSHIP = "CONTRACT_OBJECT_OWNERSHIP";
    //"0x434f4e54524143545f494e5445525354454c4c41525f454e434f444552000000"
    bytes32 public constant CONTRACT_INTERSTELLAR_ENCODER = "CONTRACT_INTERSTELLAR_ENCODER";

    mapping(address => uint) public stakingLock;
    uint256 public lock;
    ISettingsRegistry public registry;
    uint256 public landVoteRate;
    uint256 public apostleVoteRate;
    uint256 public tokenVoteRate;
    bool private withdrawProtected;

    //event
    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);

    function initialize(address _registry, address _voter, address _reward) public initializer {
        registry = ISettingsRegistry(_registry);
        landVoteRate = 100;
        apostleVoteRate = 1;
        tokenVoteRate = 10;
        withdrawProtected = false;
        initReward(_voter, _reward);
    }
    
    function setLock(uint256 _lock) onlyOwner external {
        lock = _lock;
    }

    function setLandVoteRate(uint256 _landVoteRate) onlyOwner external {
        landVoteRate = _landVoteRate;
    }

    function setApostleVoteRate(uint256 _apostleVoteRate) onlyOwner external {
        apostleVoteRate = _apostleVoteRate;
    }

    function setTokenVoteRate(uint256 _tokenVoteRate) onlyOwner external {
        tokenVoteRate = _tokenVoteRate;
    }

    // if lock too long or we have some other bugs
    function protectWithdraw() onlyOwner external {
        withdrawProtected = true;
    }

    function stake(uint256 amount) public updateReward(msg.sender) override {
        require(amount > 0, "Cannot stake 0");
        stakingLock[msg.sender] = lock.add(block.number);
        super.stake(amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public updateReward(msg.sender) override {
        require(amount > 0, "Cannot withdraw 0");
        if (!withdrawProtected) {
            require(stakingLock[msg.sender] < block.number,"!locked");
        }
        super.withdraw(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function withdrawWithReward() external {
        withdraw(balanceOf(msg.sender));
        getReward();
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
        .add(balanceOfLandOwner(account).mul(landVoteRate).mul(1 ether))
        .add(balanceOfApostleOwner(account).mul(apostleVoteRate).mul(1 ether));
    }
}

