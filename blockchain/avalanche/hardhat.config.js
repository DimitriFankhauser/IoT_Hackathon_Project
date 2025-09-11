require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
    solidity: "0.8.20",
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            name: "hardhat",
            chainId: 31337,
        },
        // fuji: {
        //     url: "https://api.avax-test.network/ext/bc/C/rpc",
        //     chainId: 43113,
        //     accounts: [process.env.PRIVATE_KEY]
        // },
    }
};
