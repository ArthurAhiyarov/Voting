require('dotenv').config()

task('get-candidate-votes-count', 'Gets a number of votes for a candidate')
    .addParam('title', 'Title of a ballot')
    .addParam('candidateaddress', 'Candidates address')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await hre.ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        await voting
            .getCandidateVotesCount(taskArgs.title, taskArgs.candidateaddress)
            .then(
                (result) => {
                    console.log(result)
                },
                (error) => {
                    console.log(error.message)
                }
            )
    })
