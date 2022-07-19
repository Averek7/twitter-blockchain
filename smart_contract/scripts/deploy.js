const hre = require("hardhat");

const main = async () => {
  const ProfileImageFactory = await hre.ethers.getContractFactory(
    "ProfileImageNfts"
  );
  const profileImageContract = await ProfileImageFactory.deploy();

  await profileImageContract.deployed();

  console.log(
    "Profile Image Minter Contract deployed to:",
    profileImageContract.address
  );
};

(async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
