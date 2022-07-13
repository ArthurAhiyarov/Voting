const { expect } = require('chai')
const { ethers } = require('hardhat')

const DEFAULT_VALUE = ethers.utils.parseEther('0.01')
const BALLOT_DURATION = 259200

async function getBlockTimeStamp(bn) {
    return (await ethers.provider.getBlock(bn)).timestamp
}

describe('vote', function () {
    let owner,
        testUser,
        candidate1,
        candidate2,
        candidate3,
        candidate1addr,
        candidate2addr,
        candidate3addr,
        candidatesAddrList,
        voter1

    const ballotTitle = 'TestBallot'

    beforeEach(async function () {
        ;[owner, testUser, candidate1, candidate2, candidate3, voter1] =
            await ethers.getSigners()

        ownerAddr = await owner.getAddress()
        testUserAddr = await testUser.getAddress()
        candidate1addr = await candidate1.getAddress()
        candidate2addr = await candidate2.getAddress()
        candidate3addr = await candidate3.getAddress()

        candidatesAddrList = [candidate1addr, candidate2addr, candidate3addr]

        const VotingContractFactory = await ethers.getContractFactory(
            'VotingContract',
            owner
        )
        voting = await VotingContractFactory.deploy()
        await voting.deployed()
        await voting
            .connect(owner)
            .createBallot(ballotTitle, candidatesAddrList)
    })
    it('should successfully let a person vote and emit the personVoted event', async function () {
        tx = await voting
            .connect(voter1)
            .vote(ballotTitle, String(candidate1addr), {
                value: DEFAULT_VALUE,
            })
        await tx.wait()
        let info = await voting.getBallotInfo(ballotTitle)
        let balance = info[2] / 10 ** 18 // to eth
        expect(balance).to.equal(0.01)
        expect(tx)
            .to.emit(voting, 'personVoted')
            .withArgs(
                ballotTitle,
                candidate1addr,
                await getBlockTimeStamp(tx.blockNumber)
            )
    })
    it('should fail if the address votes for the second time', async function () {
        await voting.connect(voter1).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        await expect(
            voting.connect(voter1).vote(ballotTitle, String(candidate1addr), {
                value: DEFAULT_VALUE,
            })
        ).to.be.revertedWith('You have already voted!')
    })
    it('should fail if a nonexisting title was given', async function () {
        await expect(
            voting
                .connect(voter1)
                .vote('Nonexisting Title', String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
        ).to.be.revertedWith('There is no such ballot!')
    })
    it('should fail if a wrong candidate address was given', async function () {
        await expect(
            voting.connect(voter1).vote(ballotTitle, String(testUserAddr), {
                value: DEFAULT_VALUE,
            })
        ).to.be.revertedWith('There is no such candidate in this ballot!')
    })
    it('should fail if there is not enough eth was paid', async function () {
        await expect(
            voting.connect(voter1).vote(ballotTitle, String(candidate1addr), {
                value: ethers.utils.parseEther('0.001'),
            })
        ).to.be.revertedWith(
            'In order to vote you have to pay 10000000000000000 wei!'
        )
    })
    it('should fail if the ballot has already finished', async function () {
        await ethers.provider.send('evm_mine', [
            (await getBlockTimeStamp(voting.blockNumber)) + BALLOT_DURATION + 1,
        ])

        await voting.connect(testUser).endVoting(ballotTitle)
        await expect(
            voting.connect(voter1).vote(ballotTitle, String(candidate1addr), {
                value: DEFAULT_VALUE,
            })
        ).to.be.revertedWith('This ballot has already finished!')
    })
})
