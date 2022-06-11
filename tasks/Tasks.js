const { ethers } = require('hardhat')
const { task } = require('hardhat/config')
const { types } = require('hardhat/config')
require('dotenv').config()

task('createBallot', 'Create a new Ballot (onlyOwner)')
    .addParam('ballotTitle', 'Title of a ballot', types.string)
    .addParam(
        'candidateAddresses',
        'List of unique addresses of candidates',
        types.array
    )
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingFactory.attach(process.env.CONTRACT_ADDRESS)
        await voting
            .createBallot(taskArgs.ballotTitle, taskArgs.candidateAddresses)
            .then(
                () => {
                    console.log('A new ballot has been created!')
                },
                (error) => {
                    console.log(error.message)
                }
            )
    })

task('getBallotInfo', 'Get info on a ballot')
    .addParam('ballotTitle', 'Title of a ballot', types.string)
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingFactory.attach(process.env.CONTRACT_ADDRESS)
        await voting.getBallotInfo(taskArgs.ballotTitle).then(
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
    .addParam('ballotTitle', 'Title of a ballot', types.string)
    .addParam('candidateAddress', 'Candidates address', types.address)
    .setAction(async (taskArgs) => {
        const value = ethers.utils.parseEther('0.01')
        const VotingContractFactory = await ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingFactory.attach(process.env.CONTRACT_ADDRESS)
        await voting
            .vote(taskArgs.ballotTitle, taskArgs.candidateAddress, value)
            .them(
                () => {
                    console.log('You have successfully voted!')
                },
                (error) => {
                    console.log(error.message)
                }
            )
    })

task('getWinnerList', 'Defines current winners in a ballot')
    .addParam('ballotTitle', 'Title of a ballot', types.string)
    .setAction(async (taskArgs) => {
        const VotingContractFactory = await ethers.getContractFactory(
            'VotingContract'
        )
        const voting = await VotingFactory.attach(process.env.CONTRACT_ADDRESS)
        await voting.getWinnerList
    })

task('endVoting', 'Finishes a ballot')
    .addParam('ballotTitle', 'Title of a ballot', types.string)
    .setAction(async)

task('withdrawFee', "Withdrawes owner's comission (onlyOwner)")
    .addParam('ballotTitle', 'Title of a ballot', types.string)
    .setAction(async)
