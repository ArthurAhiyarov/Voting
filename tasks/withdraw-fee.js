require('dotenv').config()

task('withdraw-fee', "Withdrawes owner's comission (onlyOwner)")
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await hre.ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        await voting.withdrawFee(taskArgs.title).then(
            () => {
                console.log(
                    'You have successfully withdrawed comission from the ballot'
                )
            },
            (error) => {
                console.log(error.message)
            }
        )
    })
