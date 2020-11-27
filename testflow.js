const Web3 = require('web3');
deploy = require("./compile/deploy.js")
api = require("./compile/api.js")
const assert = require('assert');
const config = require('./compile/config.json')

const network = config.ropsten_provider;
const key =  config.key;
const web3 = new Web3(network);
web3.eth.accounts.wallet.add(key);

// 2 test keys
web3.eth.accounts.wallet.add(config.test01);
web3.eth.accounts.wallet.add(config.test02);
const mainaddress = web3.eth.accounts.wallet[0].address;
const address01 = web3.eth.accounts.wallet[1].address;
const address02 = web3.eth.accounts.wallet[2].address;

const _1e8 = web3.utils.toHex("0x52b7d2dcc80cd2e4000000");
const _10000 = web3.utils.toHex("0x21e19e0c9bab2400000");
const _1000 = web3.utils.toHex("0x3635c9adc5dea00000");
const _100 = web3.utils.toHex("0x56bc75e2d63100000");
const _10 = web3.utils.toHex("0x8ac7230489e80000");

function sleep(delay) {
    return new Promise(resolve => setTimeout(() => resolve(), delay));
}

const test = async function() {
    // create kton and reward mock token
    const kton_addr = await deploy.deploy(web3, "./build/MockKtonToken.bin", "./build/MockKtonToken.abi", [_1e8]);
    const encoder_addr = await deploy.deploy(web3, "./build/MockInterstellarEncoder.bin", "./build/MockInterstellarEncoder.abi", []);
    const ownership_addr = await deploy.deploy(web3, "./build/MockOwnership.bin", "./build/MockOwnership.abi", []);
    const registry_addr = await deploy.deploy(web3, "./build/MockRegister.bin", "./build/MockRegister.abi", []);
    const reward_addr = await deploy.deploy(web3, "./build/MockRewardToken.bin", "./build/MockRewardToken.abi", [_1e8]);

    // create teller and proxy address
    const teller_addr = await deploy.deploy(web3, "./build/EvolutionTeller.bin", "./build/EvolutionTeller.abi", []);
    const admin_addr = await deploy.deploy(web3, "./build/SnapshotProxyAdmin.bin", "./build/SnapshotProxyAdmin.abi", []);
    var calldata = deploy.callData(web3, "./build/EvolutionTeller.abi", teller_addr, "initialize", registry_addr, kton_addr, reward_addr);
    const proxy_addr = await deploy.deploy(web3, "./build/SnapshotProxy.bin", "./build/SnapshotProxy.abi", [teller_addr, admin_addr, calldata]);

    // init configure
    const ktoncontract = api.createContractObj(web3, "./build/MockKtonToken.abi", kton_addr);
    const rewardcontract = api.createContractObj(web3, "./build/MockRewardToken.abi", reward_addr);
    const tellercontract = api.createContractObj(web3, "./build/EvolutionTeller.abi", teller_addr);
    const registrycontract = api.createContractObj(web3, "./build/MockRegister.abi", registry_addr);
    const ownershipcontract = api.createContractObj(web3, "./build/MockOwnership.abi", ownership_addr);
    const proxycontract = api.createContractObj(web3, "./build/EvolutionTeller.abi", proxy_addr);

    console.log("init configure");
    await api.send(web3, proxycontract, 'setRewardDistribution', mainaddress, mainaddress);
    // only test needed
    await api.send(web3, registrycontract, 'addAddress', mainaddress, "0x434f4e54524143545f4f424a4543545f4f574e45525348495000000000000000", ownership_addr);
    await api.send(web3, registrycontract, 'addAddress', mainaddress, "0x434f4e54524143545f494e5445525354454c4c41525f454e434f444552000000", encoder_addr);

    console.log("mint nft");
    await api.send(web3, ownershipcontract, "mintLand", mainaddress);
    await api.send(web3, ownershipcontract, "mintApostle", mainaddress);

    // send to test address
    console.log("send token and nft to test account");
    await api.send(web3, ktoncontract, "transfer", mainaddress, address01, _100);
    await api.send(web3, ktoncontract, "transfer", mainaddress, address02, _100);
	await api.send(web3, ownershipcontract, "transferLand", mainaddress, address01, 1);
	await api.send(web3, ownershipcontract, "transferApostle", mainaddress, address02, 1);
    // approve
    console.log("start to approve");
	await api.send(web3, ktoncontract, "approve", address01, proxy_addr, _100);
	await api.send(web3, ktoncontract, "approve", address02, proxy_addr, _100);

    // stake
    console.log("start to stake");
	await api.send(web3, proxycontract, "stake", address01, _10);
	await api.send(web3, proxycontract, "stake", address02, _100);

    console.log("start to get balance");
	const balance1 = await api.call(proxycontract, "balanceOf", address01);
	const balance2 = await api.call(proxycontract, "balanceOf", address02);
    //assert(balance1 == balance2/10, "balance verify failed");
    //
    console.log("start to reward"); 
    await api.send(web3, rewardcontract, "approve", mainaddress, proxy_addr, _10000);  
    await api.send(web3, proxycontract, "rewardAmount", mainaddress, _10000);  

    console.log("sleep 100 second");    
    await sleep(100000);    
    const earned01 = await api.call(proxycontract, "earned", address01);   
    const earned02 = await api.call(proxycontract, "earned", address02);
    //assert(earned01 <= earned02/10 + 1e10 && earned01 >= earned02/10 + 1e10, "earn money verify failed");

    // withdraw
    console.log("start to withdraw");
	await api.send(web3, proxycontract, "withdraw", address01, _10);
	await api.send(web3, proxycontract, "withdraw", address02, _100);
	const balance1after = await api.call(proxycontract, "balanceOf", address01);
	const balance2after = await api.call(proxycontract, "balanceOf", address02);
    //assert(balance1after == 0, "balance verify failed");
    //assert(balance2after == 0, "balance verify failed");
}

test()
