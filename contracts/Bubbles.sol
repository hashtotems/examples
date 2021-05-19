// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "./token/NFT.sol";

// import "hardhat/console.sol";

contract Bubbles is NFT {
    uint256 private constant MAX_SUPPLY = 5555;
    uint256 private constant MAX_AMOUNT = 20;
    uint256 private constant PRICE = 0.1 ether;
    bytes32 private _finalBaseTokenURIHash;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address root,
        bytes32 finalBaseTokenURIHash
    ) NFT(name, symbol, baseURI) {
        _finalBaseTokenURIHash = finalBaseTokenURIHash;
        transferOwnership(root);
        _pause();
    }

    function purchase(uint256 amount)
        external
        payable
        virtual
        whenNotPaused
        whenSelling
    {
        require(amount > 0, "not enough");
        require(amount < 21, "too much");

        require(msg.value == amount * PRICE, "not exact amount");
        require(totalSupply() + amount < MAX_SUPPLY, "not enough supply");

        for (uint256 i = 0; i < amount; i++) {
            _safeMint(msg.sender, totalSupply());
        }
    }

    function reserve(uint256 amount) external onlyOwner {
        require(amount > 0, "not enough");
        require(amount < 21, "too much");

        for (uint256 i = 0; i < amount; i++) {
            _safeMint(msg.sender, totalSupply());
        }
    }

    /**
     * @dev update token uri on sale end
     * we only set base token uri if it passes provenance
     * eg. keccak256(abi.encodePacked("ipfs://cid1/"))
     * should match originally prepared
     */

    function setBaseTokenURI(string memory baseTokenURI)
        public
        virtual
        override
        onlyOwner
    {
        require(
            keccak256(abi.encodePacked(baseTokenURI)) == _finalBaseTokenURIHash,
            ".."
        );
        super.setBaseTokenURI(baseTokenURI);
    }
}
