const { expect } = require('chai')
const { ethers } = require('hardhat')

async function getBlockTimeStamp(bn) {
    return (await ethers.provider.getBlock(bn)).timestamp
}

const BALLOT_DURATION = 259200

describe('getBallotInfo', async function () {
    let owner,
        testUser,
        candidate1,
        candidate2,
        candidate3,
        candidate1addr,
        candidate2addr,
        candidate3addr,
        candidatesAddrList

    const ballotTitle = 'TestBallot'

    beforeEach(async function () {
        ;[owner, testUser, candidate1, candidate2, candidate3] =
            await ethers.getSigners()

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

    it('should fail if there is no such ballot', async function () {
        await expect(
            voting.connect(testUser).getBallotInfo('abc')
        ).to.be.revertedWith('There is no such ballot.')
    })
    it('should show correct info if a deadline is not passed', async function () {
        await ethers.provider.send('evm_mine', [
            (await getBlockTimeStamp(voting.blockNumber)) + 5,
        ])
        let info = await voting.getBallotInfo(ballotTitle)
        let totalSecondsLeft = info[1]
        let candidate1addrStr = info[4][0]
        let candidate2addrStr = info[4][1]
        let candidate3addrStr = info[4][2]
        expect(+totalSecondsLeft).to.be.above(259190) //almost 3 days
        expect(candidate1addrStr).to.equal(String(candidate1addr))
        expect(candidate2addrStr).to.equal(String(candidate2addr))
        expect(candidate3addrStr).to.equal(String(candidate3addr))
        expect(info[0]).to.equal(0)
    })
    it('should show 0 time left if a ballots deadline is passed', async function () {
        await ethers.provider.send('evm_mine', [
            (await getBlockTimeStamp(voting.blockNumber)) + BALLOT_DURATION + 1,
        ])
        let info = await voting.getBallotInfo(ballotTitle)
        let totalSecondsLeft = info[1]
        expect(totalSecondsLeft).to.equal(0)
    })
    it('should show 0 time left if a ballot has "Finished" state', async function () {
        await ethers.provider.send('evm_mine', [
            (await getBlockTimeStamp(voting.blockNumber)) + BALLOT_DURATION + 1,
        ])

        await voting.connect(testUser).endVoting(ballotTitle)
        let info = await voting.getBallotInfo(ballotTitle)
        let totalSecondsLeft = info[1]
        expect(totalSecondsLeft).to.equal(0)
    })
})
