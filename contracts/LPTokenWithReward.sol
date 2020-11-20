//SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "./LPTokenWrapper.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/Math.sol";

contract LPTokenWithReward is LPTokenWrapper, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address rewardDistribution;
    IERC20 public token;

    // 604800 seconds
    uint256 public constant DURATION = 7 days;
    uint256 public rewardRate = 0;
    uint256 public rewardPerTokenStored = 0;
    uint256 public lastUpdateTime = 0;
    uint256 public periodEnd = 0;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    //event
    event RewardAdded(uint256 reward);
    event RewardPaid(address indexed account, uint256 reward);

    constructor(address _vote, address _reward) LPTokenWrapper(_vote) {
        token = IERC20(_reward);
    }

    function setRewardDistribution(address _rewardDistribution) external onlyOwner {
        rewardDistribution = _rewardDistribution;
    }

    modifier onlyRewardDistribution() {
        require(_msgSender() == rewardDistribution, "Caller is not reward distribution");
        _;
    }
    
    // any other erc20 tokens
    function seize(IERC20 _token, uint amount) onlyOwner external {
        require(_token != token, "reward");
        require(_token != vote, "vote");
        _token.safeTransfer(owner(), amount);
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = Math.min(block.timestamp, periodEnd);
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function earned(address account) public view returns (uint256) {
        return super.balanceOf(account)
        .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
        .div(1e18)
        .add(rewards[account]);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored.add(
            Math.min(block.timestamp, periodEnd)
            .sub(lastUpdateTime)
            .mul(rewardRate)
            .mul(1e18)
            .div(totalSupply())
        );
    }

    function getReward() public updateReward(msg.sender) {
        uint256 reward = earned(msg.sender);
        if (reward > 0) {
            rewards[msg.sender] = 0;
            token.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function rewardAmount(uint256 amount) external updateReward(address(0)) onlyRewardDistribution() {
        token.safeTransferFrom(msg.sender, address(this), amount);
        if (block.timestamp >= periodEnd) {
            rewardRate = amount.div(DURATION);
        } else {
            uint256 remaining = periodEnd.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = amount.add(leftover).div(DURATION);
        }
        lastUpdateTime = block.timestamp;
        periodEnd = block.timestamp.add(DURATION);
        emit RewardAdded(amount);
    }
}

