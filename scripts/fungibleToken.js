
const {
    AccountBalanceQuery,
    Hbar,
    PrivateKey,
    TokenCreateTransaction,
    TokenType,
    TransferTransaction,
    TokenAssociateTransaction,
} = require("@hashgraph/sdk");

const runFungibleTokenTask = async (client, accounts) => {
    const [account_1, account_2] = accounts;

    client.setOperator(account_1.accountId, account_1.privateKey);

    const tokenCreationTx = new TokenCreateTransaction()
        .setTokenName("Simple Fungible Token")
        .setTokenSymbol("SFT")
        .setTokenType(TokenType.FungibleCommon)
        .setTreasuryAccountId(account_1.accountId)
        .setInitialSupply(1000)
        .setSupplyKey(account_1.publicKey)
        .freezeWith(client);

    //Sign the transaction with the client, who is set as admin and treasury account
    const signTx = await tokenCreationTx.sign(account_1.privateKey);
    //Submit to a Hedera network
    const txResponse = await signTx.execute(client);
    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);
    //Get the token ID from the receipt
    const tokenId = receipt.tokenId;
    console.log("The new token ID is " + tokenId);
    
    // Check balance
    const query = new AccountBalanceQuery({ accountId: account_1.accountId });
    // Sign with the client operator account private key and submit to a Hedera network
    const accountBalance = await query.execute(client);
    if (accountBalance) {
        const tokenBalance = JSON.parse(JSON.stringify(accountBalance)).tokens.find(obj => obj.tokenId === tokenId.toString()).balance;
        console.log(`Balance before account 1 ${account_1.accountId} is ${accountBalance.hbars} HBar, tokens: ${tokenBalance}\n`);
    }
    
    // to display token in another account
    try {
        let associateOtherWalletTx = await new TokenAssociateTransaction()
            .setAccountId(account_2.accountId)
            .setTokenIds([tokenId])
            .freezeWith(client)
            .sign(account_2.privateKey);
        let associateOtherWalletTxSubmit = await associateOtherWalletTx.execute(client);
        let associateOtherWalletRx = await associateOtherWalletTxSubmit.getReceipt(client);
        console.log(`- Token association with the users account: ${associateOtherWalletRx.status} \n`);   
    } catch (error) {
        console.log(`Seems token already associated`);   
    }
    
    //Atomic swap between a Hedera Token Service token and hbar
    const atomicSwap = await new TransferTransaction()
        .addHbarTransfer(account_2.accountId, new Hbar(-10))
        .addHbarTransfer(account_1.accountId, new Hbar(10))
        .addTokenTransfer(tokenId, account_1.accountId, -150)
        .addTokenTransfer(tokenId, account_2.accountId, 150)
        .freezeWith(client);

    //Sign the transaction with accountId1 and accountId2 private keys, submit the transaction to a Hedera network
    const txSwapResponse = await (await (await atomicSwap.sign(account_2.privateKey)).sign(account_1.privateKey)).execute(client);
    const swapReceipt = await txSwapResponse.getReceipt(client);
    console.log(`Status of swap: ${swapReceipt.status}`);

    // Check balance
    const queryBalance1After = new AccountBalanceQuery({ accountId: account_1.accountId });
    // Sign with the client operator account private key and submit to a Hedera network
    const accountBalance1After = await queryBalance1After.execute(client);
    if (accountBalance1After) {
        const tokenBalance = JSON.parse(JSON.stringify(accountBalance1After)).tokens.find(obj => obj.tokenId === tokenId.toString()).balance;
        console.log(`Balance after account 1 ${account_1.accountId} is ${accountBalance1After.hbars} HBar, tokens: ${tokenBalance}\n`);
    }

    const queryBalance2After = new AccountBalanceQuery({ accountId: account_2.accountId });
    // Sign with the client operator account private key and submit to a Hedera network
    const accountBalance2After = await queryBalance2After.execute(client);
    if (accountBalance2After) {
        const tokenBalance = JSON.parse(JSON.stringify(accountBalance2After)).tokens.find(obj => obj.tokenId === tokenId.toString()).balance;
        console.log(`Balance after account 2 ${account_2.accountId} is ${accountBalance2After.hbars} HBar, tokens: ${tokenBalance}\n`);
    }
}


module.exports = { runFungibleTokenTask };