#!/usr/bin/env node
const hardhat = require('hardhat');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');
const _ = require('lodash');

const {
  log,
  chainTypeById,
  chainNameById,
  chainIdByName,
} = require('../js-helpers/utils');

const info = (msg) => console.log(chalk.dim(msg));
const success = (msg) => console.log(chalk.green(msg));

const verifyContract = async ({name, networkName, contractRef = null, addressOverride = null}) => {
  try {
    const deployment = (await deployments.get(name)) || {};
    const address = addressOverride || deployment.address;
    const constructorArgs = deployment.constructorArgs || [];
    info(`Verifying ${name} at address "${address}" ${constructorArgs ? 'with args' : ''}...`);

    const execArgs = constructorArgs.map(String).join(' ');
    const execCmd = [];
    execCmd.push('hardhat', 'verify', '--network', networkName);
    if (_.isString(contractRef) && contractRef.length > 0) {
      execCmd.push('--contract', `contracts/${contractRef}`);
    }
    execCmd.push(address, execArgs);

    info(`CMD: ${execCmd.join(' ')}`);
    await exec(execCmd.join(' '));
    success(`${name} verified!`);
  }
  catch (err) {
    if (/Contract source code already verified/.test(err.message || err)) {
      info(`${name} already verified`);
    } else {
      console.error(err);
    }
  }
}

async function run() {
  const network = await hardhat.network;
  const chainId = chainIdByName(network.name);

  const networkName = network.name === 'homestead' ? 'mainnet' : network.name;
  info(`Verifying contracts on network "${networkName} (${chainId})"...`);

  // Upgradeable Contracts; need to get implementation adderss from `.openzeppelin/__network__.json`
  let universeAddress = null;
  let chargedParticlesAddress = null;
  let chargedStateAddress = null;
  let chargedSettingsAddress = null;
  let chargedManagersAddress = null;
  if (networkName === 'mainnet') {
    universeAddress = '0xd6ed8455903CBd94d8F432eC4059197984baA65e';
    chargedParticlesAddress = '0x660De54CEA09838d11Df0812E2754eD8D08CD2f7';
  }
  if (networkName === 'kovan') {
    universeAddress = '0xaF197D367124E50a9E719493A374c57d8dE302FA';
    chargedParticlesAddress = '0x78C96ABf20bf43E129FF27B25a135c0E70ceb2bc';
    chargedStateAddress = '0xC67C35927dfBF19C7519b1795Ae52996962Da845';
    chargedSettingsAddress = '0x0c84f8B1D020d3E5907448A65cAD8bF11Af456C3';
    chargedManagersAddress = '0x3e748F1879512C9A2c87f3180c2E19531479882a';
  }
  if (networkName === 'polygon') {
    universeAddress = '0x1E70aa1599a624880e91103738591C920cCbb925';
    chargedParticlesAddress = '0xB29256073C63960daAa398f1227D0adBC574341C';
  }
  if (networkName === 'mumbai') {
    universeAddress = '0x3e9A9544f8a995DF33771E84600E02a2fc81De58';
    chargedParticlesAddress = '0xA85B3d84f54Fb238Ef257158da99FdfCe905C7aA';
  }

  // Protocol
  await verifyContract({name: 'Universe', networkName, addressOverride: universeAddress});
  await verifyContract({name: 'ChargedParticles', networkName, addressOverride: chargedParticlesAddress});
  await verifyContract({name: 'ChargedState', networkName, addressOverride: chargedStateAddress});
  await verifyContract({name: 'ChargedSettings', networkName, addressOverride: chargedSettingsAddress});
  await verifyContract({name: 'ChargedManagers', networkName, addressOverride: chargedManagersAddress});
  await verifyContract({name: 'Ionx', networkName});

  // Wallet Managers
  await verifyContract({name: 'GenericWalletManager', networkName});
  await verifyContract({name: 'GenericWalletManagerB', networkName});
  await verifyContract({name: 'GenericBasketManager', networkName});
  await verifyContract({name: 'GenericBasketManagerB', networkName});
  await verifyContract({name: 'AaveWalletManager', networkName});
  await verifyContract({name: 'AaveWalletManagerB', networkName});

  // NFTs
  await verifyContract({name: 'Proton', networkName});
  await verifyContract({name: 'ProtonB', networkName});
  await verifyContract({name: 'Lepton', networkName});
  await verifyContract({name: 'Lepton2', networkName});
  await verifyContract({name: 'ExternalNFT', networkName});
  await verifyContract({name: 'ParticleSplitter', networkName});
  await verifyContract({name: 'TokenInfoProxy', networkName});

  // Incentives
  // await verifyContract({name: 'CommunityVault', networkName});

  // await verifyContract({name: 'Staking', networkName});
  // await verifyContract({name: 'IonxYieldFarm', networkName});
  // await verifyContract({name: 'LPYieldFarm', networkName});

  // await verifyContract({name: 'Staking2', networkName, contractRef: 'incentives/Staking2.sol:Staking2'});
  // await verifyContract({name: 'IonxYieldFarm2', networkName, contractRef: 'incentives/YieldFarm2.sol:YieldFarm2'});
  // await verifyContract({name: 'LPYieldFarm2', networkName, contractRef: 'incentives/YieldFarm2.sol:YieldFarm2'});

  // await verifyContract({name: 'Staking3', networkName, contractRef: 'incentives/Staking3.sol:Staking3'});
  // await verifyContract({name: 'IonxYieldFarm3', networkName, contractRef: 'incentives/YieldFarm3.sol:YieldFarm3'});
  // await verifyContract({name: 'LPYieldFarm3', networkName, contractRef: 'incentives/YieldFarm3.sol:YieldFarm3'});

  // await verifyContract({name: 'MerkleDistributor', networkName});
  // await verifyContract({name: 'MerkleDistributor2', networkName});
  // await verifyContract({name: 'MerkleDistributor3', networkName});

  // await verifyContract({name: 'VestingClaim2', networkName});
  // await verifyContract({name: 'VestingClaim3', networkName});
  // await verifyContract({name: 'VestingClaim4', networkName});

  success('Done!');
};

run();
