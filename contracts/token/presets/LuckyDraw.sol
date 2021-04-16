// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "../NFT.sol";

abstract contract LuckyDraw is NFT {
  
  bool private _hasDrawn = false;
  uint256 private _bank = 0;
  uint256 private _percent = 0;

  constructor (
    string memory name,
    string memory symbol,
    string memory baseTokenURI
  ) NFT(name, symbol, baseTokenURI) {}

  /**
   * First lest set the percentage of funds we want to lock for a giveaway
   */

  function _setLuckyDrawPercentage (uint percent) internal {
    _percent = percent;
  }

  function purchase (uint256 amount) public virtual payable override whenNotPaused returns (uint256 cost) {
    uint256 totalCost = super.purchase(amount);
    _bank += totalCost / 100 * _percent;
    return totalCost;
  }

  function withdraw () public payable virtual override onlyOwner {
    uint256 contractBalance = address(this).balance;
    
    uint256 amount = _hasDrawn 
      ? contractBalance 
      : (contractBalance - _bank);
            
    require(amount > 0, "nothing to withdraw");
    require(payable(owner()).send(amount), ".");
  }

  function canDraw () internal view virtual returns (bool);
  function drawWinner() internal view virtual returns (address);

  function draw () public payable {
    require(canDraw(), "cant draw atm");
    require(!_hasDrawn, "already drawn");
    
    _hasDrawn = true;
    require(payable(drawWinner()).send(_bank), "cant deposit to winner");
  }
}