# HACK-LABS

Contains actual smart contract attacker contracts for major benchmarks, starting with smartbugs-curated.


### Smartbugs-Curated Dataset
Total contracts: 143

Details per category (following the [DASP taxonomy](https://dasp.co/)): 

Vulnerability | total contracts | exploits
|-----|------|---|
Reentrancy |31 |26
Access Control | 18 | 16
Arithmetic | 15 | 12
Unchecked Low Level Calls | 52 | 20 
Denial Of Service | 6 | 4
Bad Randomness |8 | 5
Front Running | 4| 3
Time Manipulation | 5 | 3
Short Addresses | 1 | 0
Others | 3| 2
Total | 143 | 91

Details:

- 1 duplicate contract:
  - 0x627fa62ccbb1c1b04ffaecd72a53e37fc0e17839.sol on reentrancy and unchecked_low_level
  - Not exploitable for reentrancy
