//SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "./LPTokenWithReward.sol";
import "./interfaces/ISettingsRegistry.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract EvolutionTeller is LPTokenWithReward {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping(address => uint) public stakingLock;
    uint256 public lock = 0;

    ISettingsRegistry public registry;
    uint256 landVoteRate = 100 ether;
    //"0x434f4e54524143545f4f424a4543545f4f574e45525348495000000000000000"
    bytes32 public constant CONTRACT_OBJECT_OWNERSHIP = "CONTRACT_OBJECT_OWNERSHIP";

    bool private withdrawProtected = false;

    //event
    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);

    constructor(address _registry, address _voter, address _reward) LPTokenWithReward(_voter, _reward) {
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

    function balanceOfLandOwner(address account) public view returns (uint256) {
        address objectOwnership = registry.addressOf(CONTRACT_OBJECT_OWNERSHIP);
        uint256 length = IERC721(objectOwnership).balanceOf(account);
        
        return landVoteRate.mul(length);
    }

    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account).add(balanceOfLandOwner(account));
    }
}

