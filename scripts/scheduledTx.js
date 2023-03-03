
const {
    AccountBalanceQuery,
    Hbar,
    TransferTransaction,
    ScheduleCreateTransaction,
    Timestamp,
    ScheduleId,
    AccountId,
    ScheduleInfoQuery,
    ScheduleDeleteTransaction,
    ScheduleSignTransaction,
} = require("@hashgraph/sdk");

const printBalance = async (client, account, account_name) => {
    const query = new AccountBalanceQuery({ accountId: account.accountId });
    // Sign with the client operator account private key and submit to a Hedera network
    const accountBalance = await query.execute(client);
    if (accountBalance) {
        console.log(`Balance for account ${account_name} ${account.accountId} is ${accountBalance.hbars} HBar`);
    }
}

const makeScheduledTask = async (client, accounts) => {
    const [account_1, account_2, otherAccount] = accounts;
    await printBalance(client, account_2, "account before creation 2");

    client.setOperator(account_2.accountId, account_2.privateKey);

    //Create a transaction to schedule
    const transaction = new TransferTransaction()
        .addHbarTransfer(account_1.accountId, Hbar.from(-2))
        .addHbarTransfer(account_2.accountId, Hbar.from(2));
    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setScheduleMemo("Scheduled TX!")
        .setAdminKey(account_2.privateKey) // to have possibility delete
        .execute(client);

    //Request the receipt of the transaction
    const receipt = await scheduleTransaction.getReceipt(client);

    //Get the schedule ID
    const scheduleId = receipt.scheduleId;

    await printBalance(client, account_2, "account 2 after creation");

    // DELETE Transaction
    //Create the transaction and sign with the admin key
    const deleteTransaction = await new ScheduleDeleteTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(account_2.privateKey);

    //Sign with the operator key and submit to a Hedera network
    const txDeleteResponse = await deleteTransaction.execute(client);

    //Get the transaction receipt
    const deleteReceipt = await txDeleteResponse.getReceipt(client);
    console.log('Deletion Scheduled:', deleteReceipt.status)

    const query = new ScheduleInfoQuery().setScheduleId(scheduleId);

    //Sign with the client operator private key and submit the query request to a node in a Hedera network
    const info = await query.execute(client);
    console.log("The scheduledId you queried for is: ", new ScheduleId(info.scheduleId).toString());
    console.log("The memo for it is: ", info.scheduleMemo);
    console.log("It got created by: ", new AccountId(info.creatorAccountId).toString());
    console.log("It got payed by: ", new AccountId(info.payerAccountId).toString());
    console.log("The expiration time of the scheduled tx is: ", new Timestamp(info.expirationTime).toDate());
    if(new Timestamp(info.executed).toDate().getTime() === new Date("1970-01-01T00:00:00.000Z").getTime()) {
        console.log("The transaction has not been executed yet.");
    } else {
        console.log("The time of execution of the scheduled tx is: ", new Timestamp(info.executed).toDate());
    }

    // Try to sign deleted TX
    try {
        //Create the transaction
        const transaction = await new ScheduleSignTransaction()
            .setScheduleId(scheduleId)
            .freezeWith(client)
            .sign(account_1.privateKey);

        //Sign with the client operator key to pay for the transaction and submit to a Hedera network
        const txResponse = await transaction.execute(client);

        //Get the receipt of the transaction
        const receipt = await txResponse.getReceipt(client);
    } catch (error) {
        console.error(`Trying to sign deleted scheduled tx ${error.message}`);
    }
}


module.exports = { makeScheduledTask };