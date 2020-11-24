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

const main = async function() {
    var contract = readlineSync.question('which to be deployed?\r\n 1 - EvolutionTeller(default)\r\n 2 - SnapshotProxy\r\n');
    var helper = 'which network?\r\n';
    networks.forEach(function(option) {
        helper = helper + option.id + " - " + option.name + "\r\n";
    });
    //var network = readlineSync.question('which network?\r\n 1 - rinkeby(default)\r\n 2 - mainnet\r\n');
    var network = readlineSync.question(helper);

    const contractname = contract == 1 || contract == "" ? "EvolutionTeller" : "SnapshotProxy";
    //const networkname = network == 1 || network == "" ? config.rinkeby_provider : config.mainnet_provider;
    const web3 = new Web3(networks[network-1].provider);
    const key =  config.key;
    web3.eth.accounts.wallet.add(key);
    const networkname = networks[network-1].name;
    
    if (contractname == "EvolutionTeller") {
        var registry = readlineSync.question("Please enter the registry contract address\r\n");
        var addr = readlineSync.question("Please enter the staking contract address\r\n");
        console.log(`Your select is ${contractname}, and network api ${networkname}`);
        if (!deploy.confirmInfo()) {
            return;
        }
        console.log(`start to deploy contract: ${contractname}`);
        await deploy.deploy(web3, "./build/EvolutionTeller.bin", "./build/EvolutionTeller.abi", [registry, addr])
    } else {
        var addr = readlineSync.question("Please enter the EvolutionTeller address\r\n");
        console.log(`Your select is ${contractname}, and network api ${networkname}, init teller addr ${addr}`);
        if (!deploy.confirmInfo()) {
            return;
        }
        console.log(`start to deploy contract: ${contractname}`);
        await deploy.deploy(web3, "./build/SnapshotProxy.bin", "./build/SnapshotProxy.abi", [addr])
    }
}

main();
