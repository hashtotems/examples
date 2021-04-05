// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// import "hardhat/console.sol";

contract CryptoBubblesArt is IERC721Metadata, ERC721PresetMinterPauserAutoId {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;
    mapping(uint256 => string) private _tokenURIs;

    uint256 public constant MAX_SUPPLY = 9945; // + 55 allocated for the giveaway
    uint256 public constant MAX_AMOUNT = 20;

    uint256[6] public offsets = [
        uint256(0), // 2948
        uint256(2948), // 2498
        uint256(5446), // 1998
        uint256(7444), // 1498
        uint256(8942), // 998
        uint256(9940) // 5
    ];

    uint256[6] public amounts = [
        uint256(2948),
        uint256(2498),
        uint256(1998),
        uint256(1498),
        uint256(998),
        uint256(5)
    ];

    uint256[6] public prices = [
        uint256(0.05 ether),
        uint256(0.07 ether),
        uint256(0.2 ether),
        uint256(0.5 ether),
        uint256(1 ether),
        uint256(5 ether)
    ];

    uint256 public size = 6;

    constructor()
        ERC721PresetMinterPauserAutoId(
            "CryptoBubblesArt",
            "CBA",
            "ipfs://QmNviSTqyXu3H6ZucUiKnP94G3NAnqLREjJtn4Rv8gw1ms/"
        )
    {
        pause();
    }

    function getBubbles(uint256 amount) public payable whenNotPaused {
        uint256 currentSupply = totalSupply();

        require(currentSupply < MAX_SUPPLY, "finished");
        require(amount > 0 && amount <= MAX_AMOUNT, "fixed amount");
        require(currentSupply.add(amount) <= MAX_SUPPLY, "not enought bubbles");

        uint256 estimatedPrice = estimatePrice(amount);
        require(msg.value == estimatedPrice, "not exact amount");

        for (uint256 i = 0; i < amount; i++) {
            _mint(msg.sender, _tokenIds.current());
            _tokenIds.increment();
        }
    }

    function estimatePrice(uint256 amount) public view returns (uint256) {
        return _estimatePrice(amount);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, IERC721Metadata)
        returns (string memory)
    {
        require(_exists(tokenId), "URI query for nonexistent token");
        return concat(_baseURI(), tokenId.toString(), ".gif");
    }

    function concat(
        string memory prefix,
        string memory id,
        string memory suffix
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(prefix, id, suffix));
    }

    function withdraw() public payable {
        require(hasRole(MINTER_ROLE, _msgSender()), "must be minter");
        require(payable(msg.sender).send(address(this).balance), ".");
    }

    /*
     * Internal
     */

    function _getTierPrice(uint256 idx) internal view returns (uint256 price) {
        for (uint256 i = size - 1; i >= 0; i--) {
            if (idx >= offsets[i]) {
                return prices[i];
            }
        }
        return prices[0];
    }

    function _estimatePrice(uint256 amount) internal view returns (uint256) {
        uint256 estimatedPrice = 0;
        uint256 left = totalSupply();
        uint256 right = left + amount;

        for (uint256 i = left; i < right; i++) {
            estimatedPrice += _getTierPrice(i);
        }

        return estimatedPrice;
    }
}
