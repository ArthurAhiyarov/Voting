require('dotenv').config()

task('get-ballot-info', 'Get info on a ballot')
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await hre.ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        await voting.getBallotInfo(taskArgs.title).then(
            (result) => {
                console.log('Gooooooooood')
                const info = `State: ${result.state}
                TimeLeft: ${result.totalTimeInSecondsLeft}
                Balance: ${result.balance}
                Winner: ${result.winners}
                Candidates = ${result.candidates}`
                console.log(info)
            },
            (error) => {
                console.log('Baaaaad')
                console.log(error.message)
            }
        )
    })
