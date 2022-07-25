const { expect } = require('chai')
const { ethers } = require('hardhat')

const DEFAULT_VALUE = ethers.utils.parseEther('0.01')

describe('createWinnerList', function () {
    let owner,
        voting,
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

    it('should fail if a nonexisting title was given', async function () {
        await expect(
            voting.connect(testUser).createWinnerList('Wrong Title')
        ).to.be.revertedWith('There is no such ballot!')
    })
    it('should provide correct data on current winners', async function () {
        await voting.connect(voter1).vote(ballotTitle, String(candidate1addr), {
            value: DEFAULT_VALUE,
        })
        const info = await voting.getWinnerList(ballotTitle)
        expect(info).to.have.lengthOf(0)
        await voting.connect(testUser).createWinnerList(ballotTitle)
        const newInfo = await voting.getWinnerList(ballotTitle)
        expect(newInfo).to.have.lengthOf(1)
        const winnerCandidate = newInfo[0]
        expect(winnerCandidate).to.be.equal(candidate1addr)
    })
})
