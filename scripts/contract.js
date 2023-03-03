
const {
    ContractCreateFlow,
    ContractExecuteTransaction,
    ContractDeleteTransaction,
    ContractFunctionParameters,
} = require("@hashgraph/sdk");
const { hethers } = require('@hashgraph/hethers');
const { bytecode } = require("../artifacts/contracts/certificationC3.sol/CertificationC1.json");



const runContractTask = async (client, accounts) => {
    const [deployer] = accounts;
    client.setOperator(deployer.accountId, deployer.privateKey);

    const contractCreate = new ContractCreateFlow()
        .setGas(200000).setAdminKey(deployer.publicKey).setBytecode(bytecode);
    const signature = await contractCreate.sign(deployer.privateKey);
    const txResponse = await signature.execute(client);
    const { contractId } = await txResponse.getReceipt(client);
    console.log(`Contract deployed with id: ${contractId}`);

    const params = new ContractFunctionParameters().addUint16(5).addUint16(6);
    const contractQueryFunction1 = await new ContractExecuteTransaction()
        .setGas(100000)
        .setContractId(contractId)
        .setFunction('function1', params);

    const callResult = await (await contractQueryFunction1.execute(client)).getRecord(client);
    // console.log(`Tx id: ${callResult.transactionId}`);

    const decoder = new hethers.utils.AbiCoder();
    const decodedResultFunction1 = decoder.decode(['uint16'], callResult.contractFunctionResult.bytes);
    console.log(`Result: ${decodedResultFunction1[0]}`);

    //Create the transaction
    const transaction = await new ContractDeleteTransaction()
        .setContractId(contractId)
        .setTransferAccountId(deployer.accountId) // send remain funds
        .freezeWith(client);

    //Sign with the admin key on the contract
    const signTx = await transaction.sign(deployer.privateKey)

    //Sign the transaction with the client operator's private key and submit to a Hedera network
    const txDeleteResponse = await signTx.execute(client);

    //Get the receipt of the transaction
    const receipt = await txDeleteResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log("The transaction consensus status is " + transactionStatus);
}


module.exports = { runContractTask };


