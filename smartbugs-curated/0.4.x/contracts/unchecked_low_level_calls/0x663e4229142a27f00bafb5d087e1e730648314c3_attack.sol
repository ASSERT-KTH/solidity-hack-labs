pragma solidity ^0.4.24;

import "../dataset/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol";
contract PandaCaller {
    PandaCore public pandaCore;

    function PandaCaller(address _pandaCore) public {
        pandaCore = PandaCore(_pandaCore);
    }

    function call(uint256 _matronId, uint256[2] _childGenes, uint256[2] _factors) public {
        uint babyId = pandaCore.giveBirth(_matronId, _childGenes, _factors);
    }

    function withdraw() public {
        pandaCore.withdrawBalance();
    }

    function() external payable {
        revert("I always revert!");
    }
}

contract GeneScience {
    /// @dev simply a boolean to indicate this is the contract we expect to be
    function isGeneScience() public pure returns (bool) {
        return true;
    }

    /// @dev given genes of kitten 1 & 2, return a genetic combination - may have a random factor
    /// @param genes1 genes of mom
    /// @param genes2 genes of sire
    /// @return the genes that are supposed to be passed down the child
    function mixGenes(uint256[2] genes1, uint256[2] genes2,uint256 g1,uint256 g2, uint256 targetBlock) public returns (uint256[2]) {
        uint256[2] memory gene;
        gene[0] = (genes1[0] & g1) | (genes2[0] & g2);
        gene[1] = (genes1[1] & g1) | (genes2[1] & g2);
        return gene;
    }

    function getPureFromGene(uint256[2] gene) public view returns(uint256) {
        return 1;
    }

    /// @dev get sex from genes 0: female 1: male
    function getSex(uint256[2] gene) public view returns(uint256) {
        return gene[0]%2;
    }

    /// @dev get wizz type from gene
    function getWizzType(uint256[2] gene) public view returns(uint256) {
        return 1;
    }

    function clearWizzType(uint256[2] _gene) public returns(uint256[2]) {
        return _gene;
    }
}

contract MyERC721 {

    /// @notice Name and symbol of the non fungible token, as defined in ERC721.
    string public constant name = "NFT";
    string public constant symbol = "NFT";

    bytes4 constant InterfaceSignature_ERC165 =
        bytes4(keccak256('supportsInterface(bytes4)'));

    bytes4 constant InterfaceSignature_ERC721 =
        bytes4(keccak256('name()')) ^
        bytes4(keccak256('symbol()')) ^
        bytes4(keccak256('totalSupply()')) ^
        bytes4(keccak256('balanceOf(address)')) ^
        bytes4(keccak256('ownerOf(uint256)')) ^
        bytes4(keccak256('approve(address,uint256)')) ^
        bytes4(keccak256('transfer(address,uint256)')) ^
        bytes4(keccak256('transferFrom(address,address,uint256)')) ^
        bytes4(keccak256('tokensOfOwner(address)')) ^
        bytes4(keccak256('tokenMetadata(uint256,string)'));

    /// @notice Introspection interface as per ERC-165 (https://github.com/ethereum/EIPs/issues/165).
    ///  Returns true for any standardized interfaces implemented by this contract. We implement
    ///  ERC-165 (obviously!) and ERC-721.
    function supportsInterface(bytes4 _interfaceID) external view returns (bool)
    {
        // DEBUG ONLY
        //require((InterfaceSignature_ERC165 == 0x01ffc9a7) && (InterfaceSignature_ERC721 == 0x9a20483d));

        return ((_interfaceID == InterfaceSignature_ERC165) || (_interfaceID == InterfaceSignature_ERC721));
    }

    function() external payable {
        revert("I always revert!");
    }

}