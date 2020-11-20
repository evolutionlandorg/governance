const config = require('./config.json')
const fs = require("fs");

var api = {
    createContractObj: function(web3, abi, addr) {
        const abistream = fs.readFileSync(abi).toString();
        const jsonabi = JSON.parse(abistream);
        return new web3.eth.Contract(jsonabi, addr);
    },
    owner: async function(contract) {
        const _owner = await contract.methods.owner().call();
        console.log("owner:", _owner);
        return _owner;
    },
    balance: async function(contract, addr) {
        const _balance = await contract.methods.balanceOf(addr).call();
        console.log("balance:", _balance);
        return _balance;
    },
    earned: async function(contract, addr) {
        const _earned = await contract.methods.earned(addr).call();
        console.log("earned:", _earned);
        return _earned;
    },
    setLock: async function(web3, contract, lock) {
        const walletAddress = web3.eth.accounts.wallet[0].address;
        let result = await contract.methods.setLock(
            lock
        ).send({
            from: walletAddress,
            //value: 1e18,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(20000000000),
        });
        console.log(result.transactionHash);
    },
    transfer: async function(web3, contract, to, amount) {
        const address = web3.eth.accounts.wallet[0].address;
        let result = await contract.methods.transfer(
            to,
            amount
        ).send({
            from: address,
            //value: 1e18,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(20000000000),
        });
        console.log(result.transactionHash);
    },
    approve: async function(web3, contract, address, spender, amount) {
        let result = await contract.methods.approve(
            spender,
            amount
        ).send({
            from: address,
            //value: 1e18,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(20000000000),
        });
        console.log(result.transactionHash);
    },
    addAddress: async function(web3, contract, land_addr) {
        const address = web3.eth.accounts.wallet[0].address;
        let result = await contract.methods.addAddress(
            "0x434f4e54524143545f4f424a4543545f4f574e45525348495000000000000000",
            land_addr,
        ).send({
            from: address,
            //value: 1e18,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(20000000000),
        });
        console.log(result.transactionHash);
    },
    stake: async function(web3, contract, address, amount) {
        let result = await contract.methods.stake(
            amount
        ).send({
            from: address,
            //value: 1e18,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(20000000000),
        });
        console.log(result.transactionHash);
    },
    withdraw: async function(web3, contract, address, amount) {
        let result = await contract.methods.withdraw(
            amount
        ).send({
            from: address,
            //value: 1e18,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(20000000000),
        });
        console.log(result.transactionHash);
    },
    setRewardDistribution: async function(web3, contract) {
        const walletAddress = web3.eth.accounts.wallet[0].address;
        let result = await contract.methods.setRewardDistribution(
            walletAddress
        ).send({
            from: walletAddress,
            //value: 1e18,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(20000000000),
        });
        console.log(result.transactionHash);
    },
    rewardAmount: async function(web3, contract, amount) {
        const walletAddress = web3.eth.accounts.wallet[0].address;
        let result = await contract.methods.rewardAmount(
            amount
        ).send({
            from: walletAddress,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(20000000000),
        });
        console.log(result.transactionHash);
    },
    mint: async function(web3, contract) {
        const walletAddress = web3.eth.accounts.wallet[0].address;
        let result = await contract.methods.mint(
        ).send({
            from: walletAddress,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(20000000000),
        });
        console.log(result.transactionHash);
    },
    teller: async function(contract) {
        let _teller = await contract.methods.getTeller().call();
        console.log("teller:", _teller);
        return _teller;
    }
}

module.exports = api

