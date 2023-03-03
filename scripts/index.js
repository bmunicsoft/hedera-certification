const {
    Client,
    AccountBalanceQuery
} = require("@hashgraph/sdk");
const { generateAccounts } = require('./generateAccounts');
const { runFungibleTokenTask } = require('./fungibleToken');
const { makeMultisigTx } = require('./multisig');
const { runConsensusTask } = require('./consensus');
const { makeScheduledTask } = require('./scheduledTx');

const myDefaultAccountId = "0.0.3631835";
const myDefaultPrivateKey = "302e020100300506032b657004220420e94f4fde4743d1eae4e7ca1e4c620ff5615b19e10107670c1d8642fae39eab78";

const client = Client.forTestnet();
client.setOperator(myDefaultAccountId, myDefaultPrivateKey);

(async () => {
    // Check main balance
    const query = new AccountBalanceQuery({ accountId: myDefaultAccountId });
    // Sign with the client operator account private key and submit to a Hedera network
    const accountBalance = await query.execute(client);
    if (accountBalance) {
        console.log(`The account balance for account ${myDefaultAccountId} is ${accountBalance.hbars} HBar\n`);
    }
    
    // Task #1
    const accounts = await generateAccounts(client, 5); //TODO: Change to 5 before send task

    // Task #2
    // await runFungibleTokenTask(client, accounts);

    // Task #3
    TODO: smart contract

    // Task #4
    // await makeScheduledTask(client, accounts);

    // Task #5
    // await makeMultisigTx(client, accounts);

    // Task #6
    // await runConsensusTask(client, accounts);

    process.exit(0)
})();