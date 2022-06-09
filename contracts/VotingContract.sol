// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingContract is Ownable {

    uint constant DURATION = 3 days;
    uint constant FEE = 10 ** 16; // wei

    struct Candidate {

        address addr;
        uint votesCount;

    }

    struct Voter {

        address addr;
        bool voted;
        
    }

    struct Ballot {

        BallotState state;
        string title;
        uint deadline;
        uint balance;
        bool feeWithdrawed;

        address[] winnersList;
        mapping(address => Candidate) candidates;
        address[] candidatesAddresses;
        mapping (address => Voter) voters;

    }

    enum BallotState { Active, Finished }

    mapping(string => Ballot) public ballots;

    event createdBallot(string title, uint deadline, uint timeCreated);
    event personVoted(string ballotTitle, address voterAddress, uint voteTime);
    event feeWithdrawed(string ballotTitle, uint withdrawTime);
    event votingEnded(string ballotTitle, uint endTime);

    function createBallot(string calldata ballotTitle, address[] calldata candidateAddresses) external onlyOwner {

        require(candidateAddresses.length >= 2, "There should be at least 2 candidates in a Ballot!");
        require(ballots[ballotTitle].deadline == 0, "A ballot with such title already exists!");
        Ballot storage newBallot = ballots[ballotTitle];
        newBallot.deadline = block.timestamp + DURATION;
        newBallot.title = ballotTitle;
        newBallot.balance = 0;
        newBallot.state = BallotState.Active;
        newBallot.feeWithdrawed = false;

        mapping(address => Candidate) storage candidates = newBallot.candidates;
        address[] storage candidatesAddresses = newBallot.candidatesAddresses;

        for (uint i; i < candidateAddresses.length; i++) {

            address candidateAddress = candidateAddresses[i];
            candidatesAddresses.push(candidateAddress);
            Candidate memory candidate = Candidate( {addr: candidateAddress, votesCount: 0} );
            candidates[candidateAddress] = candidate;
            
        }

        emit createdBallot(ballotTitle, newBallot.deadline, block.timestamp);
    }

    function getBallotInfo(string calldata ballotTitle) 
        external 
        view
        returns (BallotState state, uint totalTimeInSecondsLeft, uint balance, address[] memory winners, address[] memory candidates)
    {
        Ballot storage ballot = ballots[ballotTitle];
        require(ballot.deadline > 0, "There is no such ballot.");
        uint nowTime = block.timestamp;
        uint totalLeftTime_;

        if ((ballot.state == BallotState.Active && nowTime >= ballot.deadline) || (ballot.state == BallotState.Finished)) {
            totalLeftTime_ = 0;
        } else {
                totalLeftTime_ = ballot.deadline - nowTime;
            }
        return (ballot.state, totalLeftTime_, ballot.balance, ballot.winnersList, ballot.candidatesAddresses);
    }


    function vote(string calldata ballotTitle, address candidateAddress) external payable {
        
        Ballot storage ballot = ballots[ballotTitle];
        require(ballot.deadline != 0, "There is no such ballot!");
        require(ballot.candidates[candidateAddress].addr == candidateAddress, "There is no such candidate in this ballot!");
        require(msg.value == FEE, "In order to vote you have to pay 10000000000000000 wei!");
        require(ballot.voters[msg.sender].voted == false, "You have already voted!");
        require(ballot.state == BallotState.Active, "This ballot has already finished!");

        ballot.balance += msg.value;
        ballot.candidates[candidateAddress].votesCount++;
        ballot.voters[msg.sender] = Voter(msg.sender, true);

        emit personVoted(ballot.title, msg.sender, block.timestamp);
    }

    function getWinnerList(string calldata ballotTitle) external returns(address[] memory winnersList){

        Ballot storage ballot = ballots[ballotTitle];
        require(ballot.deadline != 0, "There is no such ballot!");
        uint maxVotes = 0;
        address[] storage candidatesAddresses = ballot.candidatesAddresses;
        mapping(address => Candidate) storage candidates = ballot.candidates;

        for (uint index; index < candidatesAddresses.length; index++) {
            address candidateAddress = candidatesAddresses[index];
            if (candidates[candidateAddress].votesCount > maxVotes) {
                maxVotes = candidates[candidateAddress].votesCount;
            }
        }
        for (uint index; index < candidatesAddresses.length; index++) {
            address candidateAddress = candidatesAddresses[index];
            if (candidates[candidateAddress].votesCount == maxVotes) {
                ballot.winnersList.push(candidateAddress);
            }
        }
        return ballot.winnersList;
    }

    function endVoting(string calldata ballotTitle) external returns (address[] memory winnersList_){

        Ballot storage ballot = ballots[ballotTitle];
        require(ballot.deadline != 0, "There is no such ballot!");
        require(ballot.state == BallotState.Active, "This ballot is already finished!");
        require(ballot.deadline < block.timestamp, "It is too early to finish this ballot!");

        ballot.state = BallotState.Finished;
        address[] memory winnersList = this.getWinnerList(ballotTitle);
        uint winnersAmount = winnersList.length;
        if (winnersAmount == 1) {
            address payable winnerAddress = payable(ballot.winnersList[0]);
            winnerAddress.transfer((ballot.balance / 10) * 9);
        } else {
            uint prizeMoney = (ballot.balance / 10) * 9;
            uint moneyPerWinner = prizeMoney / winnersAmount;
            for (uint index; index < winnersAmount; index++) {
                address payable winnerAddress = payable(winnersList[index]);
                winnerAddress.transfer(moneyPerWinner);
                ballot.balance -= moneyPerWinner;
            }
        }
        emit votingEnded(ballotTitle, block.timestamp);
        return ballot.winnersList;
    }

    function withdrawFee(string calldata ballotTitle) external onlyOwner {

        Ballot storage ballot = ballots[ballotTitle];
        require(ballot.deadline != 0, "There is no such ballot!");
        require(ballot.deadline < block.timestamp, "This ballot has not reached its deadline yet!");
        require(ballot.state == BallotState.Finished, "This ballot is still Active! Please use endVoting.");
        require(ballot.feeWithdrawed == false, "You have already withdrawed the fee from this ballot!");

        address payable ownerAddress = payable(msg.sender);
        ownerAddress.transfer(ballot.balance);
        ballot.balance = 0;
        ballot.feeWithdrawed = true;

        emit feeWithdrawed(ballotTitle, block.timestamp);
    }

}








