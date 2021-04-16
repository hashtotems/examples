// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

abstract contract Tiers {
  struct Tier {
    uint256 index;
    uint256 amount;
    uint256 offset;
    uint256 price;
  }

  uint256 private _currentIndex = 0;
  uint256 private _currentOffset = 0;

  Tier[] private tiers;

  function _addPriceTier (uint256 amount, uint256 price) internal {
    tiers.push(Tier(_currentIndex, amount, _currentOffset, price));
    _currentIndex += 1;
    _currentOffset += amount;
  }

  function _getTierPrice (uint256 offset) private view returns (uint256 price) {
    require(offset < _currentOffset, "no tear provided");
    uint256 tiersLength = tiers.length;

    for (uint256 i = tiersLength; i > 0; i--) {
      Tier storage t = tiers[i - 1];
      if (offset >= t.offset) {
        return t.price;
      }
    }
  }

  function _estimateCost (uint256 currentOffset, uint256 amount) internal view returns (uint256) {
    uint256 estimatedCost = 0;    
    uint256 finalOffset = currentOffset + amount;

    for (uint256 i = currentOffset; i < finalOffset; i++) {
        estimatedCost += _getTierPrice(i);
    }

    return estimatedCost;
  }
}