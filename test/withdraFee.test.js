const { expect, util } = require('chai')
const { ethers } = require('hardhat')
const { utils } = require('ethers')

const DEFAULT_VALUE = ethers.utils.parseEther('0.01')
const BALLOT_DURATION = 259200

async function getBlockTimeStamp(bn) {
    return (await ethers.provider.getBlock(bn)).timestamp
}

describe('withdrawFee', function () {
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

    it('should fail if a non-owner tries to withdraw fee', async function () {
        await expect(
            voting.connect(testUser).withdrawFee(ballotTitle)
        ).to.be.revertedWith('Ownable: caller is not the owner')
    })
    it('should fail if a nonexisiting ballot title was given', async function () {
        await expect(
            voting.connect(owner).withdrawFee('Wrong Title')
        ).to.be.revertedWith('There is no such ballot!')
    })
    it('should fail if the deadline has not been reached yet', async function () {
        await expect(
            voting.connect(owner).withdrawFee(ballotTitle)
        ).to.be.revertedWith('This ballot has not reached its deadline yet!')
    })
    it('should fail if a ballot is still Active, but a deadline is over', async function () {
        await ethers.provider.send('evm_mine', [
            (await getBlockTimeStamp(voting.blockNumber)) + BALLOT_DURATION + 1,
        ])
        await expect(
            voting.connect(owner).withdrawFee(ballotTitle)
        ).to.be.revertedWith(
            'This ballot is still Active! Please use endVoting.'
        )
    })
    it('should successfully withdraw a fee and emit feeWithdrawed', async function () {
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
        let infoBefore = await voting.getBallotInfo(ballotTitle) //before ending voting
        let ballotBalance = infoBefore[2] //ballot balance after all votes
        let ownerComission = ballotBalance / 10 //owner's 10%
        await voting.connect(testUser).endVoting(ballotTitle)
        withdrawTX = await voting.connect(owner).withdrawFee(ballotTitle)
        let infoAfter = await voting.getBallotInfo(ballotTitle) //after withdraw
        let newBalance = infoAfter[2]

        expect(withdrawTX).to.changeEtherBalance(owner, ownerComission)
        expect(withdrawTX)
            .to.emit(voting, 'feeWithdrawed')
            .withArgs(ballotTitle, await getBlockTimeStamp(voting.blockNumber))
        expect(newBalance).to.be.equal(0)
    })
    it('should fail if the owner has withdrawed a fee', async function () {
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

        await voting.connect(testUser).endVoting(ballotTitle)
        await voting.connect(owner).withdrawFee(ballotTitle)
        await expect(
            voting.connect(owner).withdrawFee(ballotTitle)
        ).to.be.revertedWith(
            'You have already withdrawed the fee from this ballot!'
        )
    })
})
