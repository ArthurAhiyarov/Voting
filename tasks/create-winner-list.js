require('dotenv').config()

task('create-winner-list', 'Defines current winners in a ballot')
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await hre.ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        await voting.createWinnerList(taskArgs.title).then(
            () => {
                console.log(
                    'You have successfully created a current winners list. You can the getWinnerList function to view them.'
                )
            },
            (error) => {
                console.log(error.message)
            }
        )
    })
