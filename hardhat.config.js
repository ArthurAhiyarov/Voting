require('dotenv').config()
require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('@nomiclabs/hardhat-etherscan')

const { WEB3_INFURA_PROJECT_ID, PRIVATE_KEY, REPORT_GAS, ETHERSCAN_API_KEY } =
    process.env

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        version: '0.8.13',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    defaultNetwork: 'hardhat',
    networks: {
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${WEB3_INFURA_PROJECT_ID}`,
            accounts: [`${PRIVATE_KEY}`],
        },
    },
    gasReporter: {
        enabled: REPORT_GAS ? true : false,
        currency: 'USD',
        gasPrice: 21,
    },
    dependencyCompiler: {
        paths: ['@openzeppelin/contracts/access/Ownable.sol'],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}
