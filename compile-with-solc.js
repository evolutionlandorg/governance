const { exec } = require('child_process');

const compile = async function (file) {
    exec(`solc @openzeppelin/=$(pwd)/node_modules/@openzeppelin/ ${file}  --overwrite --bin --abi --output-dir ./build`, (err, stdout, stderr) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log(`compile contract ${file}`);
        console.log(`stdout: ${stdout}`);
        //console.log(`stderr: ${stderr}`);
    })
}

const main = async function() {
    await compile("contracts/EvolutionTeller.sol");
    await compile("contracts/SnapshotProxy.sol");
    await compile("contracts/SnapshotProxyAdmin.sol");
    await compile("contracts/test/MockInterstellarEncoder.sol");
    await compile("contracts/test/MockOwnership.sol");
    await compile("contracts/test/MockRegister.sol");
    await compile("contracts/test/MockKton.sol");
    await compile("contracts/test/MockReward.sol");
}

main()
