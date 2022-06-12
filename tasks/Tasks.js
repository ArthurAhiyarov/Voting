// const { ethers } = require('hardhat')
// const { task } = require('hardhat/config')
// const { types } = require('hardhat/config')
require('dotenv').config()

task('create-ballot', 'Create a new Ballot (onlyOwner)')
    .addParam('title', 'Title of a ballot')
    .addParam(
        'candidateaddresses',
        'List of unique addresses of candidates',
        types.array
    )
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

task('get-ballot-info', 'Get info on a ballot')
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        await voting.getBallotInfo(taskArgs.title).then(
            (result) => {
                const info = `State: ${result.state}
                TimeLeft: ${result.totalTimeInSecondsLeft}
                Balance: ${result.balance}
                Winner: ${result.winners}
                Candidates = ${result.candidates}`
                console.log(info)
            },
            (error) => {
                console.log(error.message)
            }
        )
    })

task('vote', 'Vote for a candidate in a ballot')
    .addParam('title', 'Title of a ballot')
    .addParam('candidateaddress', 'Candidates address')
    .setAction(async (taskArgs) => {
        const value = ethers.utils.parseEther('0.01')
        const VotingContractFactory = await ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingContractFactory.attach(
            process.env.CONTRACT_ADDRESS
        )
        await voting
            .vote(taskArgs.title, taskArgs.candidateaddress, value)
            .then(
                () => {
                    console.log('You have successfully voted!')
                },
                (error) => {
                    console.log(error.message)
                }
            )
    })

task('get-candidate-votes-count', 'Gets a number of votes for a candidate')
    .addParam('title', 'Title of a ballot')
    .addParam('candidateaddress', 'Candidates address')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
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

task('create-winner-list', 'Defines current winners in a ballot')
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
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

task('get-winner-list', 'Shows winners list')
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
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

task('end-voting', 'Finishes a ballot')
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
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

task('withdraw-fee', "Withdrawes owner's comission (onlyOwner)")
    .addParam('title', 'Title of a ballot')
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
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
