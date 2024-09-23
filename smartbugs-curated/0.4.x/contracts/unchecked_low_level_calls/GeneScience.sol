pragma solidity ^0.4.24;

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