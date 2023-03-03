const {
    AccountBalanceQuery,
    Hbar,
    PrivateKey,
    AccountCreateTransaction,
    Wallet,
} = require("@hashgraph/sdk");


// New account created with:
//             - accountId: 0.0.3631932
//             - balance: 1500 ℏ
//             - public: 302a300506032b65700321007bcf03e71bfde1348deb7162ebcaed83083bdf890f0716e1a0c88f173b931161
//             - private: 302e020100300506032b657004220420584ec80b148962fc39336cbff04e522c2c92e14e3ef5fa9b974a2cb79ee62e24

// New account created with:
//             - accountId: 0.0.3631934
//             - balance: 1500 ℏ
//             - public: 302a300506032b6570032100c3b513efaa4e617d5dde0ac17bd3059ab9e6d9f0aff4b0aec6e5823318430f44
//             - private: 302e020100300506032b657004220420d221cc5531a9a96cc79e70780f64d847243cf317ad2fc2a12917ff6301e444ef

// New account created with:
//             - accountId: 0.0.3631937
//             - balance: 1500 ℏ
//             - public: 302a300506032b657003210086ba65d1d788c8803ab2f16deec16036d8fce5ac0847a67f1737ac2f07f5cb71
//             - private: 302e020100300506032b65700422042049ed4db2f8ce48858ade3b37081ee8f76ad4287269c73f6264d616ce00a54052

// New account created with:
//             - accountId: 0.0.3631938
//             - balance: 1500 ℏ
//             - public: 302a300506032b657003210067718ca765f5f5faa2bea707a3a25668e57dd730f98fe3d0829af12f3dfd77b9
//             - private: 302e020100300506032b657004220420fd32215464b486b2a00a1f3a25e122c807c0a520217704597d0c3770d24220c4

// New account created with:
//             - accountId: 0.0.3631939
//             - balance: 1500 ℏ
//             - public: 302a300506032b6570032100ce168acf6cea835b0f660fb6a51ae266b7528b9c09ae1106bde4047fa1eca1ae
//             - private: 302e020100300506032b657004220420c0b0feb27ca8e49605baac1a637721fdcad7fbb2d9a68ad2203c4f80c1033355


const generatedAccounts = [
    {
        "accountId": "0.0.3631932",
        "publicKey": "302a300506032b65700321007bcf03e71bfde1348deb7162ebcaed83083bdf890f0716e1a0c88f173b931161",
        "privateKey": "302e020100300506032b657004220420584ec80b148962fc39336cbff04e522c2c92e14e3ef5fa9b974a2cb79ee62e24",
    },
    {
        "accountId": "0.0.3631934",
        "publicKey": "302a300506032b6570032100c3b513efaa4e617d5dde0ac17bd3059ab9e6d9f0aff4b0aec6e5823318430f44",
        "privateKey": "302e020100300506032b657004220420d221cc5531a9a96cc79e70780f64d847243cf317ad2fc2a12917ff6301e444ef",
    },
    {
        "accountId": "0.0.3631937",
        "publicKey": "302a300506032b657003210086ba65d1d788c8803ab2f16deec16036d8fce5ac0847a67f1737ac2f07f5cb71",
        "privateKey": "302e020100300506032b65700422042049ed4db2f8ce48858ade3b37081ee8f76ad4287269c73f6264d616ce00a54052",
    },
    {
        "accountId": "0.0.3631938",
        "publicKey": "302a300506032b657003210067718ca765f5f5faa2bea707a3a25668e57dd730f98fe3d0829af12f3dfd77b9",
        "privateKey": "302e020100300506032b657004220420fd32215464b486b2a00a1f3a25e122c807c0a520217704597d0c3770d24220c4",
    },
    {
        "accountId": "0.0.3631939",
        "publicKey": "302a300506032b6570032100ce168acf6cea835b0f660fb6a51ae266b7528b9c09ae1106bde4047fa1eca1ae",
        "privateKey": "302e020100300506032b657004220420c0b0feb27ca8e49605baac1a637721fdcad7fbb2d9a68ad2203c4f80c1033355",
    }
].map(obj => {
    const wallet = new Wallet(
        obj.accountId,
        obj.privateKey
    )
    return {
        accountId: wallet.accountId,
        publicKey: wallet.publicKey,
        privateKey: PrivateKey.fromString(obj.privateKey),
    }
})


const generateAccounts = async (client, amount) => {
    const accounts = generatedAccounts.length ? generatedAccounts: [];
    if (!accounts.length) {
        for (let index = 0; index < amount; index++) {
            // each account has own privateKey
            const privateKey = PrivateKey.generateED25519();
            const publicKey = privateKey.publicKey;
            // create account
            const createAccountTx = await new AccountCreateTransaction({
                key: publicKey,
                initialBalance: Hbar.from(1500),
            }).execute(client);
            const { accountId } = await createAccountTx.getReceipt(client);
            accounts.push({ privateKey, accountId, publicKey });
        }
    }

    for (let index = 0; index < accounts.length; index++) {
        const account = accounts[index];
        const query = new AccountBalanceQuery({ accountId: account.accountId });
        const accountBalance = await query.execute(client);

        console.log(`New account created with:
            - accountId: ${account.accountId}
            - balance: ${accountBalance.hbars}
            - public: ${account.publicKey}
            - private: ${account.privateKey}\n`);
    }
    
    return accounts;
}


module.exports = { generateAccounts };