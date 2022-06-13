require('dotenv').config()

task('end-voting', 'Finishes a ballot')
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await hre.ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        await voting.endVoting(taskArgs.title).then(
            () => {
                console.log('You have successfully finished a voting process')
            },
            (error) => {
                console.log(error.message)
            }
        )
    })
