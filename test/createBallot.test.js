const { expect } = require('chai')
const { ethers } = require('hardhat')

const BALLOT_DURATION = 259200

async function getBlockTimeStamp(bn) {
    return (await ethers.provider.getBlock(bn)).timestamp
}

describe('createBallot', async function () {
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
    const testName = 'Test name'

    beforeEach(async function () {
        ;[owner, testUser, candidate1, candidate2, candidate3] =
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

    it('should fail if not the owner is creating a new ballot', async function () {
        await expect(
            voting
                .connect(candidate1)
                .createBallot(ballotTitle, candidatesAddrList)
        ).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('should fail if there are less than 2 candidate addresses in args', async function () {
        await expect(
            voting
                .connect(owner)
                .createBallot(ballotTitle, candidatesAddrList.slice(-1))
        ).to.be.revertedWith(
            'There should be at least 2 candidates in a Ballot!'
        )
    })

    it('should fail if there is already a ballot with the same title', async function () {
        await expect(
            voting.connect(owner).createBallot(ballotTitle, candidatesAddrList)
        ).to.be.revertedWith('A ballot with such title already exists!')
    })

    it('should fail candidates are not unique', async function () {
        let notUniqueAddrList = [
            candidate1addr,
            candidate2addr,
            candidate3addr,
            candidate3addr,
        ]
        await expect(
            voting.connect(owner).createBallot('Title', notUniqueAddrList)
        ).to.be.revertedWith('All candidates must be unique!')
    })

    it('should successfully create a new ballot', async function () {
        await voting.connect(owner).createBallot(testName, candidatesAddrList)
        let info = await voting.getBallotInfo(testName)
        let candidate1addrStr = info[4][0]
        let candidate2addrStr = info[4][1]
        let candidate3addrStr = info[4][2]
        expect(info).not.to.be.undefined
        expect(candidate1addrStr).to.equal(String(candidate1addr))
        expect(candidate2addrStr).to.equal(String(candidate2addr))
        expect(candidate3addrStr).to.equal(String(candidate3addr))
        expect(info[0]).to.equal(0)
    })
    it('should correctly emit the createdBallot event', async function () {
        const tx = await voting
            .connect(owner)
            .createBallot(testName, candidatesAddrList)
        await tx.wait()
        expect(tx)
            .to.emit(voting, 'createdBallot')
            .withArgs(
                testName,
                (await getBlockTimeStamp(tx.blockNumber)) + BALLOT_DURATION,
                await getBlockTimeStamp(tx.blockNumber)
            )
    })
})
