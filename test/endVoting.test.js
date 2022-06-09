const { expect } = require('chai')
const { ethers } = require('hardhat')
const { BigNumber } = require('ethers')
const { utils } = require('ethers')

const DEFAULT_VALUE = ethers.utils.parseEther('0.01')
const BALLOT_DURATION = 259200

async function getBlockTimeStamp(bn) {
    return (await ethers.provider.getBlock(bn)).timestamp
}

describe('endVoting', function () {
    let owner,
        testUser,
        candidate1,
        candidate2,
        candidate3,
        candidate1addr,
        candidate2addr,
        candidate3addr,
        candidatesAddrList,
        voter1,
        voter2,
        voter3,
        voter4

    const ballotTitle = 'TestBallot'

    beforeEach(async function () {
        ;[
            owner,
            testUser,
            candidate1,
            candidate2,
            candidate3,
            voter1,
            voter2,
            voter3,
            voter4,
        ] = await ethers.getSigners()

        ownerAddr = await owner.getAddress()
        testUserAddr = await testUser.getAddress()
        candidate1addr = await candidate1.getAddress()
        candidate2addr = await candidate2.getAddress()
        candidate3addr = await candidate3.getAddress()

        candidatesAddrList = [candidate1addr, candidate2addr, candidate3addr]

        VotingContractFactory = await ethers.getContractFactory(
            'VotingContract',
            owner
        )
        voting = await VotingContractFactory.deploy()
        await voting.deployed()
        await voting
            .connect(owner)
            .createBallot(ballotTitle, candidatesAddrList)
    })

    it('should fail if a nonexisting title was given', async function () {
        await expect(
            voting.connect(testUser).endVoting('Wrong Title')
        ).to.be.revertedWith('There is no such ballot!')
    })
    it('should fail if the deadline has not been reached yet', async function () {
        await expect(
            voting.connect(testUser).endVoting(ballotTitle)
        ).to.be.revertedWith('It is too early to finish this ballot!')
    })
    it('should successfully finish voting and emit votingEnded', async function () {
        await voting.connect(voter1).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter2).vote(ballotTitle, String(candidate2addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter3).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter4).vote(ballotTitle, String(candidate3addr), {
            value: DEFAULT_VALUE,
        })
        await ethers.provider.send('evm_mine', [
            (await getBlockTimeStamp(voting.blockNumber)) + BALLOT_DURATION + 1,
        ])
        expect(await voting.connect(testUser).endVoting(ballotTitle))
            .to.emit(voting, 'votingEnded')
            .withArgs(ballotTitle, await getBlockTimeStamp(voting.blockNumber))
    })
    it('should successfully finish and send correctly send prize eth to 1 winner', async function () {
        await voting.connect(voter1).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter2).vote(ballotTitle, String(candidate2addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter3).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter4).vote(ballotTitle, String(candidate3addr), {
            value: DEFAULT_VALUE,
        })

        await ethers.provider.send('evm_mine', [
            (await getBlockTimeStamp(voting.blockNumber)) + BALLOT_DURATION + 1,
        ])

        await expect(
            await voting.connect(testUser).endVoting(ballotTitle)
        ).to.changeEtherBalance(candidate1, utils.parseEther('0.036'))
    })
    it('should successfully finish and correctly send prize eth to several winners', async function () {
        await voting.connect(voter1).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter2).vote(ballotTitle, String(candidate2addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter3).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter4).vote(ballotTitle, String(candidate2addr), {
            value: DEFAULT_VALUE,
        })
        await ethers.provider.send('evm_mine', [
            (await getBlockTimeStamp(voting.blockNumber)) + BALLOT_DURATION + 1,
        ])
        const endTx = await voting.connect(testUser).endVoting(ballotTitle)
        await expect(endTx).to.changeEtherBalance(
            candidate1,
            utils.parseEther('0.018')
        )
        await expect(endTx).to.changeEtherBalance(
            candidate2,
            utils.parseEther('0.018')
        )
    })
    it('should fail if a ballot has alreay finished', async function () {
        await voting.connect(voter1).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter2).vote(ballotTitle, String(candidate2addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter3).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        await voting.connect(voter4).vote(ballotTitle, String(candidate3addr), {
            value: DEFAULT_VALUE,
        })
        await ethers.provider.send('evm_mine', [
            (await getBlockTimeStamp(voting.blockNumber)) + BALLOT_DURATION + 1,
        ])
        await voting.connect(testUser).endVoting(ballotTitle)
        await expect(
            voting.connect(testUser).endVoting(ballotTitle)
        ).to.be.revertedWith('This ballot is already finished!')
    })
})
