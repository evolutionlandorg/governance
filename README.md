# Evolution Land Governance



# Local Development

The following assumes the use of `node@>=v14.10.0`, `solc@>=0.7.1` and `make@>=3.81`.

## Install Dependencies

`npm install`

## Compile Contracts

`make`

This will compile the following contracts.
```
// Contract for teller votes power
contracts/EvolutionTeller.sol
// The proxy contract for snapshot
contracts/SnapshotProxy.sol
contracts/SnapshotProxyAdmin.sol

// test
contracts/test/MockInterstellarEncoder.sol
contracts/test/MockKton.sol
contracts/test/MockOwnership.sol
contracts/test/MockRegister.sol
contracts/test/MockReward.sol
```

## Deploy Contracts

####  deploy

First, you should edit the configure file `compile/config.json`, and set your own private key.

`make deploy`

Follow the steps and deploy the main contracts EvolutionTeller, SnapshotProxyAdmin first and then SnapshotProxy. Test contracts are required if you want to test on rinkeby or ropsten. SnapshotProxy's constructor needs five addresses, [EvolutionTeller](https://github.com/evolutionlandorg/governance/blob/main/contracts/EvolutionTeller.sol), [SnapshotProxyAdmin](https://github.com/evolutionlandorg/governance/blob/main/contracts/SnapshotProxyAdmin.sol), [SettingsRegistry](https://github.com/evolutionlandorg/common-contracts/blob/master/contracts/SettingsRegistry.sol), Kton and Reward address.

#### Configure
##### For contract SnapshotProxy

* set the locked time for staking calculated by block number
`function setLock(uint256 _lock)`
* set land vote rate, this is the additional vote power for landlord
`function setLandVoteRate(uint256 _landVoteRate)`
* set reward distribution, only distributor has the right to reward 
`function setRewardDistribution(address _rewardDistribution)`

Everytime before you give reward or stake, remember that approve first!

##### For snapshot
* the space file should be like this
```
{
  ... ...
  "strategies": [
    {
      "name": "erc20-balance-of",
      "params": {
        "address": "filled by SnapshotProxy address",
        "symbol": "Kton",
        "decimals": 18
      }
    }
  ],
  ......
}

```

## Generate Flatten
`make flatten`
