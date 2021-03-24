const API = require("@polkadot/api")
const Web3 = require("web3")
const web3 = new Web3("https://rpc-2.clover.finance")

const PUB_KEY = "0xe6206C7f064c7d77C6d8e3eD8601c9AA435419cE"
const PRIV_KEY = "0xa504b64992e478a6846670237a68ad89b6e42e90de0490273e28e74f084c03c8"
const CLOVER_SEEDS = "your 12 seed words"

async function run() {
    const wsProvider = new API.WsProvider('wss://api-2.clover.finance');
    const api = await API.ApiPromise.create({
        provider: wsProvider,
        types: {
            Amount: 'i128',
            Keys: 'SessionKeys3',
            AmountOf: 'Amount',
            Balance: 'u128',
            Rate: 'FixedU128',
            Ratio: 'FixedU128',
            EcdsaSignature: '[u8; 65]',
            EvmAddress: 'H160',
        },
    });
    const keyring = new API.Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri(CLOVER_SEEDS);
    let nonce = await api.rpc.system.accountNextIndex(alice.address);
    web3.eth.accounts.wallet.add(PRIV_KEY);
    let signature = await web3.eth.sign(`clover evm:${web3.utils.bytesToHex(alice.publicKey).slice(2)}`, PUB_KEY);

    await api.tx.evmAccounts
        .claimAccount(PUB_KEY, web3.utils.hexToBytes(signature))
        .signAndSend(alice, {
            nonce,
        }, ({ events = [], status }) => {
            if (status.isFinalized) {
                console.log(`${alice.address} has bound with EVM address: ${PUB_KEY}`)
            }
        });
}

run()