require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/OR_4cilVv9WecoAGX3vbcjhlBVZKqUzFF",
      accounts: [
        "da737f827dabe35670d853941b39ce645a107765ffbcf1e904f7e2e41a229a7c",
      ],
    },
  },
};
