# Setup server

1. Install truffle and node
2. Install dependencies by running:
> npm install
3. Open a new Ganache project and link truffle-config.js
4. Run
> truffle compile
> truffle migrate

Ganache will be updated

# Setup frontend

1. Go to the frontend codebase by running:
> cd .\auction-page\
2. Install dependencies by running:
> npm install
3. Update DutchAuction.js ContractAddress and TokenAddress with the correct address from Ganache
4. Start the frontend by running:
> npm start

# Add users to metamask

1. In Ganache's Accounts tab, click the key icon of the first user, who is the deployer of the contracts. Copy the private key.
2. Return to the browser where the frontend is running and add import this account into metamask.
3. Repeat Step 1 and 2 to input more users.

