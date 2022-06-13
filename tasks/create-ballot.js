require('dotenv').config()

task('create-ballot', 'Create a new Ballot (onlyOwner)')
    .addParam('title', 'Title of a ballot')
    .addParam('candidateaddresses', 'List of unique addresses of candidates')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        const candidateAddresses = taskArgs.candidateaddresses.split(' ')
        await voting.createBallot(taskArgs.title, candidateAddresses).then(
            () => {
                console.log('A new ballot has been created!')
            },
            (error) => {
                console.log(error.message)
            }
        )
    })
