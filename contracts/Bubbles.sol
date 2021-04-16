// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "./token/presets/LuckyDraw.sol";
import "./util/Tiers.sol";
import "./util/Giveaway.sol";
import "./util/Random.sol";

import "hardhat/console.sol";

contract Bubbles is LuckyDraw, Giveaway, Tiers, Random {
    uint256 private constant MAX_SUPPLY = 10000;
    uint256 private constant MAX_AMOUNT = 20;

    constructor() LuckyDraw(
        "CryptoBubblesArt", 
        "BUBBLE",
        "ipfs://QmNviSTqyXu3H6ZucUiKnP94G3NAnqLREjJtn4Rv8gw1ms/"
    ) {
        _addPriceTier(  55, 0.00 ether); // Giveaway
        _addPriceTier(2948, 0.05 ether);
        _addPriceTier(2498, 0.07 ether);
        _addPriceTier(1998, 0.20 ether);
        _addPriceTier(1498, 0.50 ether);
        _addPriceTier( 998, 1.00 ether);
        _addPriceTier(   5, 5.00 ether);
        
        _setLuckyDrawPercentage(1); // 1%
        _setGiveawayAmount(55);
        
        // TODO: implement giveaway separately, 
        // prevent it to be the locking factor for the contract

        // console.log(Random.random(10000));
        
        _pause();
    }

    function lockGiveaway (uint256 amount) public onlyOwner virtual {
        _incrementLockedGiveaway(amount);

        for (uint256 i = 0; i < amount; i++) {
            _safeMint(owner(), totalSupply());
        }
    }

    function purchase (uint256 amount) public virtual payable override 
        whenNotPaused 
        afterGiveaway returns (uint256) {
        return super.purchase(amount);
    }

    function canDraw () internal virtual view override returns (bool) {
        return totalSupply() == MAX_SUPPLY;
    }

    function drawWinner () internal virtual view override returns (address) {
        return ownerOf(Random.random(totalSupply()));
    }
    
    function estimatePrice(uint256 amount) public override view virtual
        returns (uint256) {
        uint256 currentSupply = totalSupply();
        require(currentSupply < MAX_SUPPLY, "finished");
        require((currentSupply + amount) <= MAX_SUPPLY, "not enought supply");
        require(amount > 0 && amount <= MAX_AMOUNT, "fixed amount");
        
        return _estimateCost(totalSupply(), amount);
    }
}
