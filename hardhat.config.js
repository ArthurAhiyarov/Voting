require('dotenv').config()
require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('@nomiclabs/hardhat-etherscan')
require('hardhat-dependency-compiler')
require('@nomiclabs/hardhat-ethers')

require('./tasks/create-ballot')
require('./tasks/create-winner-list')
require('./tasks/end-voting')
require('./tasks/get-ballot-info')
require('./tasks/get-candidate-votes-count')
require('./tasks/get-winner-list')
require('./tasks/vote')
require('./tasks/withdraw-fee')

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
 * Note: In order to run tasks on the network you deployed your contract to please change defaultNetwork to the network you use
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
    defaultNetwork: 'rinkeby',
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
