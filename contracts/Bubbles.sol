// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "./token/NFT.sol";
// import "./util/Tiers.sol";
// import "./util/Giveaway.sol";

// import "hardhat/console.sol";

contract Bubbles is NFT {
    uint256 private constant MAX_SUPPLY = 9945; // 55 tokens in giveaway?
    uint256 private constant MAX_AMOUNT = 20;

    constructor()
        NFT(
            "CryptoBubblesArt",
            "BUBBLE",
            "ipfs://QmNviSTqyXu3H6ZucUiKnP94G3NAnqLREjJtn4Rv8gw1ms/"
        )
    {
        _pause();
    }

    function __estimatePrice(
        uint256 amount,
        uint256 currentSupply,
        uint256 maxSupply,
        uint256 maxAmount
    ) public pure returns (uint256) {
        require(currentSupply < maxSupply, "finished");
        require((currentSupply + amount) <= maxSupply, "not enough supply");
        require(amount > 0 && amount <= maxAmount, "fixed amount");

        uint256 left = currentSupply;
        uint256 right = currentSupply + amount;
        uint256 price = 0;

        uint256 tierLimit = 2948;
        uint256 tierPrice = 0.05 ether;

        if (left < tierLimit) {
            price +=
                ((right < tierLimit ? right : tierLimit) - left) *
                tierPrice;
            left = tierLimit;
        }

        if (left > right) return price;

        tierLimit += 2498;
        tierPrice = 0.07 ether;

        if (left < tierLimit) {
            price +=
                ((right < tierLimit ? right : tierLimit) - left) *
                tierPrice;
            left = tierLimit;
        }

        if (left > right) return price;

        tierLimit += 1998;
        tierPrice = 0.20 ether;

        if (left < tierLimit) {
            price +=
                ((right < tierLimit ? right : tierLimit) - left) *
                tierPrice;
            left = tierLimit;
        }

        if (left > right) return price;

        tierLimit += 1498;
        tierPrice = 0.50 ether;

        if (left < tierLimit) {
            price +=
                ((right < tierLimit ? right : tierLimit) - left) *
                tierPrice;
            left = tierLimit;
        }

        if (left > right) return price;

        tierLimit += 998;
        tierPrice = 1.00 ether;

        if (left < tierLimit) {
            price +=
                ((right < tierLimit ? right : tierLimit) - left) *
                tierPrice;
            left = tierLimit;
        }

        if (left > right) return price;

        tierLimit += 5;
        tierPrice = 5.00 ether;

        if (left < tierLimit) {
            price +=
                ((right < tierLimit ? right : tierLimit) - left) *
                tierPrice;
        }

        return price;
    }

    function estimatePrice(uint256 amount)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return __estimatePrice(amount, totalSupply(), MAX_SUPPLY, MAX_AMOUNT);
    }
}
