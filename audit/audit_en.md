# CryptoBubbles Smart Contracts Audit
## Introduction
### General Provisions
The CryptoBubbles teams requested a security audit for the NFT-token sale smart contract. The code was located in the following github repository: https://github.com/hashtotems/examples
### Scope of the Audit
The scope of the audit are smart contracts https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol and https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol .
Audited commit is 2b70a8067dd2f91c499437f8711a625350f539f1.
## Security Assessment Principles
### Classification of Issues
* CRITICAL: Bugs leading to Ether or token theft, fund access locking or any other loss of Ether/tokens to be transferred to any party (for example, dividends). 

* MAJOR: Bugs that can trigger a contract failure. Further recovery is possible only by manual modification of the contract state or replacement. 

* WARNINGS: Bugs that can break the intended contract logic or expose it to DoS attacks. 

* COMMENTS: Other issues and recommendations reported to/ acknowledged by the team.

### Security Assessment Methodology
Two auditors independently verified the code.

Stages of the audit were as follows:
* “Blind” manual check of the code and its model 
* Checking the code compliance to customer requirements 
* Automated security analysis using public analyzers
* Manual checklist system inspection
* Discussion of independent audit results
* Report preparation

## Detected Issues
### CRITICAL
None found.
### MAJOR
None found.
### WARNING
None found.
### COMMENT
1. [NFT.sol:64](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L64)

Function users must be warned not get information about token id's belonging to a user by calling the function on-chain. Although loop has an upper bound of 9945, which is the maximum supply and, thus, the maximum balance of a user, getting the information on-chain for users with **> 100** tokens could be expensive. Really huge balances for some users can cause gas consumption over the limit. So, if the function is intended to be used on the front-end, we recommend using `method(args).call()` which executes smart contract method in the EVM without sending a transaction and altering contract state. For more information look [here](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#contract-call).

2. [NFT.sol:39](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L39)

This check could affect user experience in the following way:
- assume having `totalSupply` equal to 2940, so there are only 10 tokens left in the first tier;
- customers **A** and **B** call `purchase(10)`.
- before they send their transactions, the estimated price for both of them will be  **0.05 * 8 + 0.07 * 2 = 0.54** ether. 
- if customer's **A** transaction was mined first, he will pay the estimated amount of **0.54** ether. But then customer's **B** transaction will reverted due to the stated `msg.value` check, because the first transaction increased `totalSupply` to 2950, thus in the second transaction customers tries to buy only the second tier tokens with ids from 2950 to 2960, which would cost **0.07 * 10 = 0.7** ether, however **B** intended to buy a mix of the first and the second tiers.

There are two things that could be done in order to deal with such situation: 1) acknowledge customers that their transaction could fail, because of the order of competitive transaction being mined when desired `amount` crosses tier or 2) allow customers to send ether **not less** than estimated and send them back the change. The second solutions seems to fix the behaviour, however it affects user experience, because users won't be sure about amount of ether, that will be spent.

3. [Bubbles.sol:103](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L103)

Because of the check performed [here](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L31) price calculation could be simplified to just `price += right - left`.

4. [NFT: 13](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L13)

Unused state variable should be removed.

5. [Bubbles.sol:48](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L48)
[Bubbles.sol:60](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L60)
[Bubbles.sol:72](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L72)
[Bubbles.sol:84](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L84)
[Bubbles.sol:96](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L96)

The check in these lines could be less strict like `>=`. If we buy the last token in the tier, a strict check `>` leads to executing price estimation logic for the next tier, which is redundant. For example, if we buy token id 2497, the return will be only in [Bubbles.sol:60](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L60), but could be in [Bubbles.sol:48](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L48).

6. [Bubbles.sol:113](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L113)

Seems not to be necessarily to make the function `virtual`.

7. [Bubbles.sol:29](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L29)

The function was intended to be `internal`, wasn't it? Otherwise having 2 functions which estimate price is a kind of duplication.

8. [NFT.sol:23](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L23)
[NFT.sol:48](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L48)

Just a desing recommendation: instead of having a reverting `virtual` price estimation function, which will be overriden in `Bubbles.sol`, we recommend moving price estimation and purchase to `Bubbles.sol`, which will consequently allow to get rid off [NFT.sol:48](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L48).

9. [NFT.sol:11](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L11)

`ERC721` is is already in the inheritance graph, because  `ERC721Pausable` и `ERC721Enumarable` are derived from it. So `ERC721` can be wiped off from the `NFT` contract declaration.
This will consquently lead to wiping off `ERC721` in the `override` directive [here](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L129).

10. [NFT.sol:99-102](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L99-L102)

Checks for these interfaces are redundant, because they are already checked in base contracts. The function body could be simplified to just `super.supportsInterface(interfaceId)`.

11. [NFT.sol:83](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L83)

We recommend using [sendValue](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/165e6f19489786c9c6abfcc9bdc8f2815d807935/contracts/utils/Address.sol#L53) for sending ether to `owner`, if `owner` is planned to be a smart contract.

12. [Bubbles.sol:2](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L2)
[NFT.sol:2](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L2)

It will be better to strictly define compiler version like `pragma solidity 0.8.3`. This is necessarily to be sure during contact compilation and deployment about compiler version despite development environment.

13. [NFT.sol:24](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L24)
[NFT.sol:82](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L82)
[NFT.sol:105](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L105)
[NFT.sol:109](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/token/NFT.sol#L109)

It's better to use `external` instead of `public`, because functions are not inteded to be called locally.

14. [Bubbles.sol:117](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L117)

`MAX_SUPPLY` and `MAX_AMOUNT` are constants, so it's not needed to provide them in a function call to `__estimatePrice`. They can be directly used in the function body.

15. [Bubbles.sol:24](https://github.com/hashtotems/examples/blob/2b70a8067dd2f91c499437f8711a625350f539f1/contracts/Bubbles.sol#L24)

Function name has 2 underscores, which seems to be a typo, if it was inteded to be an internal one.

## CONCLUSION
We haven’t identified any high risk vulnerabilities in the audited smart contracts. We suggested some corrections and optimization solutions. As of commit [TODO], no issues were identified in the smart contract code.

## Authors
Audit was provided by independed auditors:
- Magomed Aliev (https://github.com/30mb1)
- Sabaun Taraki (https://github.com/SabaunT)

