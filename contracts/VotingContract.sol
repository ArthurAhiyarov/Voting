// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingContract is Ownable {

    //Duration of ballots after which they can be finished manually
    uint constant DURATION = 3 days;
    //Fee to be able to vote for a candidate
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
        mapping(address => uint) uniqueCandidates;

    }

    enum BallotState { Active, Finished }

    mapping(string => Ballot) public ballots;

    /*
        EVENTS
    */

    // Emitted when a ballot is successfully created
    event createdBallot(string title, uint deadline, uint timeCreated);
    //Emitted when a person has successfully voted
    event personVoted(string ballotTitle, address voterAddress, uint voteTime);
    //Emitted when comission is withdrawed by the owner
    event feeWithdrawed(string ballotTitle, uint withdrawTime);
    //Emitted when a ballot was successfully finished
    event votingEnded(string ballotTitle, uint endTime);

    /*
        FUNCTIONS
    */

    /** @dev Creates a new ballot
      * @param ballotTitle Title for a new ballot
      * @param candidateAddresses A list of candidates' addresses in string format
      * Emits a createdBallot event
      * Note: the same candidate can be present in different ballots, but two ballots with the same name cannot be created
     */
    function createBallot(string calldata ballotTitle, address[] calldata candidateAddresses) external onlyOwner {

        require(candidateAddresses.length >= 2, "There should be at least 2 candidates in a Ballot!");
        require(ballots[ballotTitle].deadline == 0, "A ballot with such title already exists!");

        Ballot storage newBallot = ballots[ballotTitle];
        newBallot.deadline = block.timestamp + DURATION;
        newBallot.title = ballotTitle;
        newBallot.balance = 0;
        newBallot.state = BallotState.Active;
        newBallot.feeWithdrawed = false;

        for (uint i = 0; i < candidateAddresses.length; i++) {
            address candidateAddr = candidateAddresses[i];
            require(newBallot.uniqueCandidates[candidateAddr] == 0, "All candidates must be unique!");
            newBallot.uniqueCandidates[candidateAddr] = i + 1;
        }

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

    /** @dev Provides info on a ballot
      * @param ballotTitle Title of a ballot to get info about
      * @return state State of a ballot
      * @return totalTimeInSecondsLeft Time in seconds left till it's possible to finish a voting process 
      * @return balance Ballot's balance
      * @return winners A list of candidates with the highest votes count (if createWinnerList function has been used)
      * @return candidates A list of all candidates addresses in a ballot
     */

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

    /** @dev Lets a person vote for a candidate in a ballot
      * @param ballotTitle A title of a ballot where the needed candiidate is
      * @param candidateAddress Candeidate's address
      * Emits personVoted event
     */

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

    /** @dev Returns a number of votes of a candidate
      * @param ballotTitle A title of a ballot where the needed candiidate is
      * @param candidateAddress Candeidate's address
      * @return votesCount A number of votes of a candidate in a given ballot
     */

    function getCandidateVotesCount(string calldata ballotTitle, address candidateAddress) external view returns(uint votesCount){
        Ballot storage ballot = ballots[ballotTitle];
        require(ballot.deadline != 0, "There is no such ballot!");
        require(ballot.candidates[candidateAddress].addr == candidateAddress, "There is no such candidate in this ballot!");
        return ballot.candidates[candidateAddress].votesCount;
    }

    /** @dev Fills a list named winnersList in a ballot struct with candidates with the highest votes count
      * @param ballotTitle A ballot title to find out current winners
      * @return winnersList A list of leading candidates
      * Note: this function is primarily created for the endVoting function to determine the winners.
      * To view info in a more nice-looking way use the getWinnerList function
     */

    function createWinnerList(string calldata ballotTitle) external returns(address[] memory winnersList){

        Ballot storage ballot = ballots[ballotTitle];
        require(ballot.deadline != 0, "There is no such ballot!");
        uint maxVotes = 0;
        address[] storage candidatesAddresses = ballot.candidatesAddresses;
        mapping(address => Candidate) storage candidates = ballot.candidates;

        for (uint index; index < candidatesAddresses.length; index++) {
            address candidateAddress = candidatesAddresses[index];
            if (candidates[candidateAddress].votesCount >= maxVotes) {
                maxVotes = candidates[candidateAddress].votesCount;
            }
        }
        delete ballot.winnersList;
        for (uint index; index < candidatesAddresses.length; index++) {
            address candidateAddress = candidatesAddresses[index];
            if (candidates[candidateAddress].votesCount == maxVotes) {
                ballot.winnersList.push(candidateAddress);
            }
        }
        return ballot.winnersList;
    }

    /** @dev Shows a list of the leading candidates in a ballot 
      * @param ballotTitle A ballot title to get current winners from
      * @return winnersList A list of leading candidates
     */

    function getWinnerList(string calldata ballotTitle) external view returns(address[] memory winnersList){
        Ballot storage ballot = ballots[ballotTitle];
        require(ballot.deadline != 0, "There is no such ballot!");
        return ballot.winnersList;
    }

    /** @dev Finishes a voting process in a ballot and transfers prize money if all requirements are satisfied
      * @param ballotTitle A title of a ballot to finish
      * @return winnersList_ Returns a list of winners
      * Emits votingEnded event
     */


    function endVoting(string calldata ballotTitle) external returns (address[] memory winnersList_){

        Ballot storage ballot = ballots[ballotTitle];
        require(ballot.deadline != 0, "There is no such ballot!");
        require(ballot.state == BallotState.Active, "This ballot is already finished!");
        require(ballot.deadline < block.timestamp, "It is too early to finish this ballot!");

        ballot.state = BallotState.Finished;
        address[] memory winnersList = this.createWinnerList(ballotTitle);
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

    /** @dev Lets the owner withdraw fee eth from a ballot if all requirements are satisfied
      * @param ballotTitle A ballot's title to withdraw fee from
      * Emits feeWithdrawed event
     */


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








