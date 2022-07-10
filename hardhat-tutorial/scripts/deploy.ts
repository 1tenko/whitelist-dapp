import { ethers } from "hardhat";

async function main() {
  // a ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  //so whitelistContract here is a factory for instances of our Whitelist contract
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  // here we deploy the contract
  const deployedWhitelistContract = await whitelistContract.deploy(10);
  // 10 is the maximum number of whitelisted addresses allowed

  // wait for the contract to finish deploying
  await deployedWhitelistContract.deployed();

  // print the address of the deployed contract
  console.log(
    "Whitelist Contract Address: ",
    deployedWhitelistContract.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
