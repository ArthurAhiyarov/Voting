const hre = require('hardhat')

async function main() {
    const VotingContractFactory = await hre.ethers.getContractFactory(
        'VotingContract'
    )
    const VotingContract = await VotingContractFactory.deploy()

    await VotingContract.deployed()

    console.log('VotingContract deployed to:', VotingContract.address)
    console.log(
        'Do not forget to assing the address above to the CONTRACT_ADDRESS variable in your .env file. Otherwise hardhat tasks will not work properly.'
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
