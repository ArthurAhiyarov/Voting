require('dotenv').config()

task('get-winner-list', 'Shows winners list')
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await hre.ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        await voting.getWinnerList(taskArgs.title).then(
            (result) => {
                console.log(result)
            },
            (error) => {
                console.log(error.message)
            }
        )
    })
