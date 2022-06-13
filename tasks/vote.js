require('dotenv').config()

task('vote', 'Vote for a candidate in a ballot')
    .addParam('title', 'Title of a ballot')
    .addParam('candidateaddress', 'Candidates address')
    .setAction(async (taskArgs) => {
        const value = ethers.utils.parseEther('0.01')
        const VotingContractFactory = await hre.ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        await voting
            .vote(taskArgs.title, taskArgs.candidateaddress, { value: value })
            .then(
                () => {
                    console.log('You have successfully voted!')
                },
                (error) => {
                    console.log(error.message)
                }
            )
    })
