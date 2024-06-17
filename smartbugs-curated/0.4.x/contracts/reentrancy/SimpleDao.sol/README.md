## This is a step by step to recreate an attack for SimpleDao.sol

What do you need:
- Access to a web browser
- Be able to access to: https://remix.ethereum.org/

Summary:
- Compile
- Deploy
- Recreate Scenario
- ATTACK!!!


### Compile
First step is to compile both contracts on Remix.

 TODO[ADD a more STEP BY STEP of this process]

 
 TODO [ADD a troubleshotting for compiling]


### Deploy
Second step is to deploy both contracts on Remix. 
WARNING: You must follow this order.

1. Go to Deploy and Run Transaction
2. Open SimpleDao.sol . 
3. Select Deploy
4. Now SimpleDao.sol has an addres, copy it.
5. Open attack.sol. 
6. Go to Deploy, add SimpleDao.sol address on the parameter next to deploy.
7. Select Deploy

### Recreate Scenario
I know you are excited now, but before pressing that tempting attack you need to recreate the scenario... what? Right now SimpleDao.sol has 0 ETH. If there is nothing to still we can not reproduce the attack.

To add money on SimpleDao.sol do the following.

1. Go to Deploy and Run Transaction
2. There you should see Account above your deployed contracts. Copy the address.
3. Go to your deployed SimpleDao.sol 
4. Go to donate and use the addres you just copy.
5. Above you must add a value to donate. 100 wei should be enough
6. Click on donate
7. Double check that contract SimpleDao.sol has 0.0000000000000001 ETH

Now you are ready to

### ATTACK!
All set up, all that is left is:
1. Go to your deploy contract attack.sol .
2. On the value parameter above add the amount you want to obtain.
3. Click on attack.

TADA!



