# :raising_hand_man: Voting Hardhat Project

This smart contract project is a test for CryptonStudio training course. It comes with a Solidity contract, deploy, test and task scripts. The task was to create a smart contract that will allow to conduct 3 day long ballots where any blockchain participant can vote by paing 0.01 eth.

# :hammer_and_wrench: Project Description
In addition to what is written above: 
  - Ballots can be created only by the owner of the contract. 
  - At least 2 unique candidates must be included to a ballot, it is allowed to add the same candidates into different ballots. Any person can vote once for a candidate in a ballot paying the fee of 0.01 eth. 
  - The duration of all ballots is 3 days, after that period any person can finish a voting process to figure out winners. 
  - In a case of equal numbers of votes for candidates they share the prize eth, 10% of it stays at the contract. The latter can be withdrawed by the owner of the contract.

# :triangular_ruler: Tests

Unit tests for this contract can be run by:
```shell
npx hardhat test
```
To see a coverage percentage you can use:
```shell
npx hardhat coverage
```
# :toolbox: How to deploy

The default network is *localhost*. In order to deploy the smart contract to it run the first command in one terminal and the other in a separate terminal:
```shell
npx hardhat node
npx hardhat run scripts/deploy.js
```
The other option is *Rinkeby* testnet. In this case you need to add these variables to your .env file:
```shell
PRIVATE_KEY=0x<YOUR_PRIVE_KEY>
WEB3_INFURA_PROJECT_ID=<WEB3_INFURA_PROJECT_ID>
```
After adding them you can deploy the contract by this command:
```shell
npx hardhat run scripts/deploy.js --network rinkeby
```
In console you will be able to see the address where the contract has been deployed to.



# :page_with_curl: Full list of commands

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
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
