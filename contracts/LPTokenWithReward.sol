//SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "./LPTokenWrapper.sol";
import "./Ownable.sol";
import "@openzeppelin/contracts/math/Math.sol";

contract LPTokenWithReward is LPTokenWrapper, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public token;
    mapping (address => bool) public rewardDistributions;
    // 604800 seconds
    uint256 public constant DURATION = 7 days;
    uint256 public rewardRate;
    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;
    uint256 public periodEnd;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    //event
    event RewardAdded(uint256 reward);
    event RewardPaid(address indexed account, uint256 reward);

    function initReward(address _vote, address _reward) public {
        token = IERC20(_reward);
        _owner = msg.sender;
        addRewardDistribution(_owner);
        initLPToken(_vote);
    }

    modifier onlyRewardDistribution() {
        require(rewardDistributions[msg.sender] == true, "Caller is not reward distribution");
        _;
    }

    function addRewardDistribution (address _address) public onlyOwner{
        rewardDistributions[_address] = true;
    }
    
    function removeRewardDistribution (address _address) public onlyOwner{
        rewardDistributions[_address] = false;
    }

    // any other erc20 tokens
    function seize(IERC20 _token, uint _amount) onlyOwner external {
        require(_token != token, "reward");
        require(_token != vote, "vote");
        _token.safeTransfer(owner(), _amount);
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = Math.min(block.timestamp, periodEnd);
        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }
        _;
    }

    function earned(address _account) public view returns (uint256) {
        return super.balanceOf(_account)
        .mul(rewardPerToken().sub(userRewardPerTokenPaid[_account]))
        .div(1e18)
        .add(rewards[_account]);
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

    function rewardAmount(uint256 _amount) external updateReward(address(0)) onlyRewardDistribution() {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        if (block.timestamp >= periodEnd) {
            rewardRate = _amount.div(DURATION);
        } else {
            uint256 remaining = periodEnd.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = _amount.add(leftover).div(DURATION);
        }
        lastUpdateTime = block.timestamp;
        periodEnd = block.timestamp.add(DURATION);
        emit RewardAdded(_amount);
    }
}

