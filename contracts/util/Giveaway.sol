// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

abstract contract Giveaway {
  uint256 private _amount;
  uint256 private _supply = 0;
  
  function _setGiveawayAmount (uint256 amount) internal {
    _amount = amount;
  }

  function _incrementLockedGiveaway (uint256 amount) internal virtual {
    require((amount + _supply) <= _amount, "honour giveaway supply");
    _supply += amount;
  }

  modifier afterGiveaway {
    require(_amount == _supply, "giveaway not claimed");
    _;
  }
}