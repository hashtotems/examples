// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

abstract contract Random {
  function random(uint256 cap) public view returns (uint) {
      return uint(
          keccak256(
              abi.encodePacked(
                  block.difficulty, 
                  block.timestamp
              )
          )
      ) % cap;
  }
}