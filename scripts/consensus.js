
const {
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

const createProtectTopic = async (client, authorizedAccount) => {
    //Create a new topic
    let txResponse = await new TopicCreateTransaction({ submitKey: authorizedAccount.privateKey })
        .execute(client);
    //Get the receipt of the transaction
    let receipt = await txResponse.getReceipt(client);
    //Grab the new topic ID from the receipt
    let topicId = receipt.topicId;
    return topicId;
}

const subscribeToTopic = async (client, topicId) => {
    new TopicMessageQuery()
        .setTopicId(topicId)
        .setStartTime(0)
        .subscribe(
            client,
            (message) => console.log(`New message arrived: ${Buffer.from(message.contents, "utf8").toString()}`)
        );
}

const submitNewMessageToTopic = async (client, topicId, message) => {
    // Send one message
    let sendResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message,
    }).execute(client);

    try {
        //Get the receipt of the transaction
        const getReceipt = await sendResponse.getReceipt(client);

        //Get the status of the transaction
        const transactionStatus = getReceipt.status;
        console.log("Sending message transaction status: " + transactionStatus);   
    } catch (error) {
        console.error(`Error during submitting message: ${error.message}`);
    }
}

const runConsensusTask = async (client, accounts) => {
    const [authorizedAccount, notAuthorizedAccount] = accounts;

    // set authorized operator
    client.setOperator(authorizedAccount.accountId, authorizedAccount.privateKey);

    const topicId = await createProtectTopic(client, authorizedAccount);
    // Wait 5 seconds between consensus topic creation and subscription
    await new Promise((resolve) => setTimeout(resolve, 5000));
    //Log the topic ID
    console.log(`Your topic ID is: ${topicId}`);
    // Subscribe to topic
    subscribeToTopic(client, topicId);
    // Send new message to topic
    await submitNewMessageToTopic(client, topicId, new Date().toISOString());
    // wait until message arrived
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // set NOT authorized operator
    client.setOperator(notAuthorizedAccount.accountId, notAuthorizedAccount.privateKey);
    // Try to send new message to topic
    await submitNewMessageToTopic(client, topicId, new Date().toISOString());
    // try to wait until message arrived
    await new Promise((resolve) => setTimeout(resolve, 5000));
}


module.exports = { runConsensusTask };