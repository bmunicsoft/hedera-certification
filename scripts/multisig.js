
const {
    Hbar,
    TransferTransaction,
    KeyList,
    AccountCreateTransaction,
    ScheduleCreateTransaction,
    ScheduleSignTransaction,
    ScheduleInfoQuery,
    TransactionId,
    AccountId,
    AccountBalanceQuery,
} = require("@hashgraph/sdk");


const printBalance = async (client, account, account_name) => {
    const query = new AccountBalanceQuery({ accountId: account.accountId });
    // Sign with the client operator account private key and submit to a Hedera network
    const accountBalance = await query.execute(client);
    if (accountBalance) {
        console.log(`Balance for account ${account_name} ${account.accountId} is ${accountBalance.hbars} HBar`);
    }
}


const runSuccessFlow = async (client, accounts) => {
    const [account_1, account_2, account_3, account_4] = accounts;
    await printBalance(client, account_4, 'account 4 before');

    const thresholdKey = new KeyList([
        account_1.publicKey,
        account_2.publicKey,
        account_3.publicKey,
    ] , 2);

    const createAccountTx = await new AccountCreateTransaction({
        key: thresholdKey,
        initialBalance: Hbar.from(20),
    }).execute(client);
    const accountMultisig = await createAccountTx.getReceipt(client);
    await printBalance(client, accountMultisig, 'multisig before');
    const { accountId: senderMultisigKey } = accountMultisig;

    //Create a transaction to schedule
    const transaction = await new TransferTransaction()
        .addHbarTransfer(senderMultisigKey, Hbar.from(-10))
        .addHbarTransfer(account_4.accountId, Hbar.from(10))
        .setNodeAccountIds([new AccountId(3)])
        .freezeWith(client);

    //Signer one signs the transaction with their private key
    const signature1 = account_1.privateKey.signTransaction(transaction);
    const signature2 = account_2.privateKey.signTransaction(transaction);

    //Collate all signatures with the transaction
    const signedTransaction = transaction
        .addSignature(account_1.publicKey, signature1)
        .addSignature(account_2.publicKey, signature2);
    //Submit the transaction to a Hedera network
    const submitTx = await signedTransaction.execute(client);

    //Get the transaction ID
    const txId = submitTx.transactionId.toString();

    //Print the transaction ID to the console
    console.log("The transaction ID " +txId);

    // try to wait until message arrived
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await printBalance(client, account_4, 'account 4 after');
    await printBalance(client, accountMultisig, 'multisig after');
}

const funNotEnoughSignaturesFlow = async (client, accounts) => {
    const [account_1, account_2, account_3, account_4] = accounts;
    await printBalance(client, account_4, 'account 4 before');

    const thresholdKey = new KeyList([
        account_1.publicKey,
        account_2.publicKey,
        account_3.publicKey,
    ] , 2);

    const createAccountTx = await new AccountCreateTransaction({
        key: thresholdKey,
        initialBalance: Hbar.from(20),
    }).execute(client);
    const accountMultisig = await createAccountTx.getReceipt(client);
    await printBalance(client, accountMultisig, 'multisig before');
    const { accountId: senderMultisigKey } = accountMultisig;

    //Create a transaction to schedule
    const transaction = await new TransferTransaction()
        .addHbarTransfer(senderMultisigKey, Hbar.from(-10))
        .addHbarTransfer(account_4.accountId, Hbar.from(10))
        .setNodeAccountIds([new AccountId(3)])
        .freezeWith(client);

    //Signer one signs the transaction with their private key
    const signature1 = account_1.privateKey.signTransaction(transaction);

    //Collate all signatures with the transaction
    const signedTransaction = transaction
        .addSignature(account_1.publicKey, signature1)

    //Submit the transaction to a Hedera network
    const submitTx = await signedTransaction.execute(client);

    //Get the transaction ID
    const txId = submitTx.transactionId.toString();

    //Print the transaction ID to the console
    console.log("The transaction ID " +txId);

    // try to wait until message arrived
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await printBalance(client, account_4, 'account 4 after');
    await printBalance(client, accountMultisig, 'multisig after');
}


const makeMultisigTx = async (client, accounts) => {
    // balance of account 4 will not change after this flow
    console.log('- Fail path -')
    await funNotEnoughSignaturesFlow(client, accounts);
    
    // balance of account 4 will change after this flow
    console.log('- Happy path -')
    await runSuccessFlow(client, accounts);
}


module.exports = { makeMultisigTx };