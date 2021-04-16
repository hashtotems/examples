// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "hardhat/console.sol";

contract NFT is ERC721, ERC721Enumerable, ERC721Pausable, Ownable {
    string private _baseTokenURI;
    uint256 private _maxAmount;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
    }

    function purchase(uint256 amount) public virtual payable whenNotPaused returns (uint256 cost) {
        uint256 estimatedPrice = estimatePrice(amount);
        
        require(msg.value == estimatedPrice, "not exact amount");

        for (uint256 i = 0; i < amount; i++) {
            _safeMint(msg.sender, totalSupply());
        }

        return estimatedPrice;
    }

    function estimatePrice(uint256 amount) public view virtual returns (uint256 price) {
        assert(false);
        return 0 * amount;
    }


    /**
     * @notice Returns a list of all tokenIds assigned to an address.
     * Taken from https://ethereum.stackexchange.com/questions/54959/list-erc721-tokens-owned-by-a-user-on-a-web-page
     * @param user get tokens of a given user
     */
    
    function tokensOfOwner(address user) external view returns(uint256[] memory ownerTokens) {
        uint256 tokenCount = balanceOf(user);
        

        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory output = new uint256[](tokenCount);
            for (uint256 index = 0; index < tokenCount; index++) {
                output[index] = tokenOfOwnerByIndex(user, index);
            }
            return output;
        }
    }

    function withdraw() public payable virtual onlyOwner {
        require(payable(msg.sender).send(address(this).balance), ".");
    }

    /**
     * @dev Compat with ERC721, ERC721Metadata, ERC721Enumerable
     *      See {IERC165-supportsInterface}.
     */

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC721Enumerable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function pause () public onlyOwner whenNotPaused {
        _pause();
    }

    function unpause () public onlyOwner whenPaused {
        _unpause();
    }

    /**
     * @dev insept _baseTokenURI into ERC721
     */
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev 
     */

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Pausable, ERC721Enumerable, ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
