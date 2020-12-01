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
            // ropsten 0x6982702995b053A21389219c1BFc0b188eB5a372
            var registry = readlineSync.question("Please enter the registry contract address\r\n");
            // kton 0x1994100c58753793D52c6f457f189aa3ce9cEe94
            var addr = readlineSync.question("Please enter the kton contract address\r\n");
            // ring 0xb52FBE2B925ab79a821b261C82c5Ba0814AAA5e0
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
    const web3 = new Web3(networks[1].provider);
    const key =  config.key;
    web3.eth.accounts.wallet.add(key);
    const _1e8 = web3.utils.toHex("0x52b7d2dcc80cd2e4000000");
    // 0x6B1CbD582111F9E9941E0b8aBE9Be844048fc4C6
    await deploy.deploy(web3, "./build/MockKtonToken.bin", "./build/MockKtonToken.abi", [_1e8]);
    // 0x5Dff1322f066187708fFa544b9a6b32Fbb464dBA
    await deploy.deploy(web3, "./build/MockInterstellarEncoder.bin", "./build/MockInterstellarEncoder.abi", []);
    // 0x00eBE3C02ce0a65efBe7BDDF056641eA46Ba200E
    await deploy.deploy(web3, "./build/MockOwnership.bin", "./build/MockOwnership.abi", []);
    // 0x7Cc40c5aC89aF12367e124CfB7a2A34F6CEC265A
    await deploy.deploy(web3, "./build/MockRegister.bin", "./build/MockRegister.abi", []);
    // 0xcfcad1252B8FE36079BEe14c5401f0f41eB0332f
    await deploy.deploy(web3, "./build/MockRewardToken.bin", "./build/MockRewardToken.abi", [_1e8]);
}

// rinkeby
// 0x22C3adf4CF1f91716da0129A86A75Fc39DdC31a1
// 0x85422da798241fF8f8962eCac886C37bc0D560fa
// 0x83F3BeDb84CAc95E0E5C3ef6D20DB4B8Bc434D35

//deployTest()

// deploy json from truffle
const deployJsonTest = async function() {
    const web3 = new Web3(networks[1].provider);
    const key =  config.key;
    web3.eth.accounts.wallet.add(key);
    const jfile = require("./build/RevenuePool.json");
    await deploy.deployJson(web3, jfile, []);
}
//0x047901b3160FbD7AB5bb927fa9531727ffE95e1B

//deployJsonTest();
