/**
 * Deploys smart contracts
 * 
 */
const Web3 = require('web3');
const fs = require("fs");
const config = require('./compile/config.json')
var readlineSync = require('readline-sync');
var deploy = require("./compile/deploy.js")

const networks = [
    {
        "id": 1,
        "name": "ropsten(default)",
        "provider": config.ropsten_provider
    },
    {
        "id": 2,
        "name": "rinkeby",
        "provider": config.rinkeby_provider
    },
    {
        "id": 3,
        "name": "mainnet",
        "provider": config.mainnet_provider
    }
];

const contracts = [
    {
        "id": 1,
        "name": "EvolutionTeller",
        "bin": "./build/EvolutionTeller.bin",
        "abi": "./build/EvolutionTeller.abi"
    },
    {
        "id": 2,
        "name": "SnapshotProxyAdmin(default)",
        "bin": "./build/SnapshotProxyAdmin.bin",
        "abi": "./build/SnapshotProxyAdmin.abi"
    },
    {
        "id": 3,
        "name": "SnapshotProxy",
        "bin": "./build/SnapshotProxy.bin",
        "abi": "./build/SnapshotProxy.abi"
    }
];

const main = async function() {
    var contract_prompt = 'which contract to be deployed?\r\n';
    contracts.forEach(function(option) {
        contract_prompt = contract_prompt + option.id + " - " + option.name + "\r\n";
    });
    var networ_prompt = 'which network?\r\n';
    networks.forEach(function(option) {
        networ_prompt = networ_prompt + option.id + " - " + option.name + "\r\n";
    });
    var contractid = readlineSync.question(contract_prompt);
    var networkid = readlineSync.question(networ_prompt);

    const contract = contracts[contractid-1]

    const web3 = new Web3(networks[networkid-1].provider);
    const key =  config.key;
    web3.eth.accounts.wallet.add(key);
    const networkname = networks[networkid-1].name;

    var params = [];
    switch (contract.id) {
        case 1: // teller
            params = [];
            //await deploy.deploy(web3, contract.bin, contract.abi, [registry, addr, reward])
            break;
        case 2: // admin
            params = [];
            break;
        case 3: //proxy
            var logic = readlineSync.question("Please enter the EvolutionTeller address\r\n");
            var admin = readlineSync.question("Please enter the admin contract address\r\n");
            var registry = readlineSync.question("Please enter the registry contract address\r\n");
            var addr = readlineSync.question("Please enter the kton contract address\r\n");
            var reward = readlineSync.question("Please enter the reward contract address\r\n");
            var calldata = deploy.callData(web3, contracts[0].abi, logic, "initialize", registry, addr, reward);
            params = [logic, admin, calldata];
            //await deploy.deploy(web3, contract.bin, contract.abi, [addr])
            break;
    }
    console.log(`Your select is ${contract.name}, and network api ${networkname}, params ${params}`);
    if (!deploy.confirmInfo()) {
        return;
    }
    console.log(`start to deploy contract: ${contract.name}`);
    await deploy.deploy(web3, contract.bin, contract.abi, params)
}

main();

// debug mock test
const deployTest = async function () {
    const web3 = new Web3(networks[0].provider);
    const key =  config.key;
    web3.eth.accounts.wallet.add(key);
    const _1e8 = web3.utils.toHex("0x52b7d2dcc80cd2e4000000");
    // 0x3E2A9d5894aE342dbB71E5eFeAb26da8524c7C5d
    await deploy.deploy(web3, "./build/MockKtonToken.bin", "./build/MockKtonToken.abi", [_1e8]);
    // 0xDf88f57f1d25DB669E68198aDB54E70ba417bA49
    await deploy.deploy(web3, "./build/MockInterstellarEncoder.bin", "./build/MockInterstellarEncoder.abi", []);
    // 0x41A99c8F18C1f27EBdb6606bd37913eE91D56bDC
    await deploy.deploy(web3, "./build/MockOwnership.bin", "./build/MockOwnership.abi", []);
    // 0xB18fa9e125461430b2D28Aef6e4295EEF41bA795
    await deploy.deploy(web3, "./build/MockRegister.bin", "./build/MockRegister.abi", []);
    // 0x1C1e09E05CCa54E722657C1e0bC521DE08E4E6e7
    await deploy.deploy(web3, "./build/MockRewardToken.bin", "./build/MockRewardToken.abi", [_1e8]);
}

// 0x65651789440c2057Ed1dEC6A7F0a0fAc999620C7
// 0xBEA5c3d111d6A60C64025f665A78B38B3c38857D
// 0x1ADC39eb5034CE2B9f8C584A951994113b03239F

//deployTest()
