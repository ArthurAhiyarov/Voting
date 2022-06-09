const { expect } = require('chai')
const { ethers } = require('hardhat')
const {
    isCallTrace,
} = require('hardhat/internal/hardhat-network/stack-traces/message-trace')

const BALLOT_DURATION = 259200
const DEFAULT_VALUE = ethers.utils.parseEther('0.01')

describe('Voting', async function () {
    let VotingContract,
        owner,
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

    async function getBlockTimeStamp(bn) {
        return (await ethers.provider.getBlock(bn)).timestamp
    }

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

    describe('createBallot', async function () {
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
                voting
                    .connect(owner)
                    .createBallot(ballotTitle, candidatesAddrList)
            ).to.be.revertedWith('A ballot with such title already exists!')
        })

        it('should successfully create a new ballot', async function () {
            let testName = 'Test name'
            await voting
                .connect(owner)
                .createBallot(testName, candidatesAddrList)
            let info = await voting.getBallotInfo(testName)
            let candidate1addrStr = info[7][0]
            let candidate2addrStr = info[7][1]
            let candidate3addrStr = info[7][2]
            expect(info).not.to.be.undefined
            expect(candidate1addrStr).to.equal(String(candidate1addr))
            expect(candidate2addrStr).to.equal(String(candidate2addr))
            expect(candidate3addrStr).to.equal(String(candidate3addr))
            expect(info[0]).to.equal(0)
        })
        it('should correctly emit the createdBallot event', async function () {
            let testName = 'Test name'
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

    describe('getBallotInfo', async function () {
        it('should fail if there is no such ballot', async function () {
            await expect(
                voting.connect(testUser).getBallotInfo('abc')
            ).to.be.revertedWith('There is no such ballot.')
        })
        it('should show correct info given the input is correct', async function () {
            let info = await voting.getBallotInfo(ballotTitle)
            let candidate1addrStr = info[7][0]
            let candidate2addrStr = info[7][1]
            let candidate3addrStr = info[7][2]
            expect(info).not.to.be.undefined
            expect(candidate1addrStr).to.equal(String(candidate1addr))
            expect(candidate2addrStr).to.equal(String(candidate2addr))
            expect(candidate3addrStr).to.equal(String(candidate3addr))
            expect(info[0]).to.equal(0)
        })
    })

    describe('vote', function () {
        it('should successfully let a person vote', async function () {
            await voting
                .connect(voter1)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            let info = await voting.getBallotInfo(ballotTitle)
            let balance = info[5] / 10 ** 18 // to ether
            expect(balance).to.equal(0.01)
            expect()
        })
        it('should correctly emit the personVoted event', async function () {
            tx = await voting
                .connect(voter1)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            await tx.wait()
            expect(tx)
                .to.emit(voting, 'personVoted')
                .withArgs(
                    ballotTitle,
                    candidate1addr,
                    await getBlockTimeStamp(tx.blockNumber)
                )
        })
        it('should fail if the address votes for the second time', async function () {
            await voting
                .connect(voter1)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            await expect(
                voting
                    .connect(voter1)
                    .vote(ballotTitle, String(candidate1addr), {
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
                voting
                    .connect(voter1)
                    .vote(ballotTitle, String(candidate1addr), {
                        value: ethers.utils.parseEther('0.001'),
                    })
            ).to.be.revertedWith(
                'In order to vote you have to pay 10000000000000000 wei!'
            )
        })
        // it('should fail if the ballot has already finished', async function () {
        //     setTimeout(() => console.log('Go'), 5000)
        //     await expect(
        //         voting
        //             .connect(voter1)
        //             .vote(ballotTitle, String(candidate1addr), {
        //                 value: DEFAULT_VALUE,
        //             })
        //     ).to.be.revertedWith('This ballot has already finished!')
        // })
    })

    describe('getWinnerList', function () {
        it('should fail if a nonexisting title was given', async function () {
            await expect(
                voting.connect(testUser).getWinnerList('Wrong Title')
            ).to.be.revertedWith('There is no such ballot!')
        })
        it('should give data on current winners', async function () {
            await voting
                .connect(voter1)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            let info = await voting.getWinnerList(ballotTitle)
            expect(info).not.to.be.undefined
        })
    })

    describe('endVoting', function () {
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
            await voting
                .connect(voter1)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            await voting
                .connect(voter2)
                .vote(ballotTitle, String(candidate2addr), {
                    value: DEFAULT_VALUE,
                })
            await voting
                .connect(voter3)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            const tx = await voting
                .connect(voter4)
                .vote(ballotTitle, String(candidate3addr), {
                    value: DEFAULT_VALUE,
                })
            await tx.wait()
            await ethers.provider.send('evm_mine', [
                (await getBlockTimeStamp(tx.blockNumber)) + BALLOT_DURATION + 1,
            ])
            const endTx = await voting.connect(testUser).endVoting(ballotTitle)
            await endTx.wait()
            expect(endTx)
                .to.emit(voting, 'votingEnded')
                .withArgs(
                    ballotTitle,
                    await getBlockTimeStamp(endTx.blockNumber)
                )
        })
        it('should successfully finish and send correctly send prize eth to 1 winner', async function () {
            // let candidate1Balance = await ethers.provider.getBalance(
            //     candidate1addr
            // )
            await voting
                .connect(voter1)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            await voting
                .connect(voter2)
                .vote(ballotTitle, String(candidate2addr), {
                    value: DEFAULT_VALUE,
                })
            await voting
                .connect(voter3)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            const tx = await voting
                .connect(voter4)
                .vote(ballotTitle, String(candidate3addr), {
                    value: DEFAULT_VALUE,
                })
            await tx.wait()
            await ethers.provider.send('evm_mine', [
                (await getBlockTimeStamp(tx.blockNumber)) + BALLOT_DURATION + 1,
            ])
            // const endTx = await voting.connect(testUser).endVoting(ballotTitle)
            // await endTx.wait()

            await expect(
                await voting.connect(testUser).endVoting(ballotTitle)
            ).to.changeEtherBalance(candidate1addr, 0.036 * 10 ** 16)
            // let winnerBalance = await expect(winnerBalance).to.equal(
            //     0.036 * 10 ** 16
            // )
        })
        it('should successfully finish and send correctly send prize eth to several winners', async function () {
            await voting
                .connect(voter1)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            await voting
                .connect(voter2)
                .vote(ballotTitle, String(candidate2addr), {
                    value: DEFAULT_VALUE,
                })
            await voting
                .connect(voter3)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            const tx = await voting
                .connect(voter4)
                .vote(ballotTitle, String(candidate2addr), {
                    value: DEFAULT_VALUE,
                })
            await tx.wait()
            await ethers.provider.send('evm_mine', [
                (await getBlockTimeStamp(tx.blockNumber)) + BALLOT_DURATION + 1,
            ])
        })
        it('should fail if a ballot has alreay finished', async function () {
            await voting
                .connect(voter1)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            await voting
                .connect(voter2)
                .vote(ballotTitle, String(candidate2addr), {
                    value: DEFAULT_VALUE,
                })
            await voting
                .connect(voter3)
                .vote(ballotTitle, String(candidate1addr), {
                    value: DEFAULT_VALUE,
                })
            const tx = await voting
                .connect(voter4)
                .vote(ballotTitle, String(candidate3addr), {
                    value: DEFAULT_VALUE,
                })
            await tx.wait()
            await ethers.provider.send('evm_mine', [
                (await getBlockTimeStamp(tx.blockNumber)) + BALLOT_DURATION + 1,
            ])
            const endTx = await voting.connect(testUser).endVoting(ballotTitle)
            await endTx.wait()
            await expect(
                voting.connect(testUser).endVoting(ballotTitle)
            ).to.be.revertedWith('This ballot is already finished!')
        })
    })

    describe('withdrawFee', function () {
        it('should fail if a non-owner tries to withdraw fee', async function () {
            await expect(
                voting.connect(testUser).withdrawFee(ballotTitle)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })
        it('should fail if the deadline has not been reached yet', async function () {
            await expect(
                voting.connect(owner).withdrawFee(ballotTitle)
            ).to.be.revertedWith(
                'This ballot has not reached its deadline yet!'
            )
        })
    })
})
