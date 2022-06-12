# :raising_hand_man: Voting Hardhat Project

This smart contract project is a test for CryptonStudio training course. It comes with a Solidity contract, deploy, test and task scripts. The task was to create a smart contract that will allow to conduct 3 day long ballots where any blockchain participant can vote by paing 0.01 eth.

# :hammer_and_wrench: Project Description
In addition to what is written above: 
  - ballots can be created only by the owner of the contract. 
  - At least 2 unique candidates must be included to a ballot, it is allowed to add the same candidates into different ballots. Any person can vote once for a candidate in a ballot paying the fee of 0.01 eth. 
  - The duration of all ballots is 3 days, after that period any person can finish a voting process to figure out winners. 
  - In a case of equal numbers of votes for candidates they share the prize eth, 10% of it stays at the contract. The latter can be withdrawed by the owner of the contract.

# :triangular_ruler: Tests

Unit tests for this contract can by:
```shell
npx hardhat test
```
To see a coverage percentage you can use:
```shell
npx hardhat coverage
```

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
npx hardhat console                       
npx hardhat coverage
npx hardhat create-ballot
npx hardhat create-winner-list
npx hardhat end-voting 
npx hardhat gas-reporter:merge       
npx hardhat get-ballot-info
npx hardhat get-candidate-votes-count
npx hardhat get-winner-list
npx hardhat verify
npx hardhat vote
npx hardhat withdraw-fee
```
