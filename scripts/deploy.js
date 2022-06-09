const hre = require('hardhat')

async function main() {
    const VotingContractFactory = await hre.ethers.getContractFactory(
        'VotingContract'
    )
    const VotingContract = await VotingContractFactory.deploy()

    await VotingContract.deployed()

    console.log('VotingContract deployed to:', VotingContract.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
