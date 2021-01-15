const API = require("@polkadot/api");
const cloverTypes =  require("../common/clover-types");
const cloverRpc =  require("../common/clover-rpc");
const _ = require('lodash');
const Web3 = require("web3")
const web3 = new Web3("http://localhost:9944")

const PUB_KEY = "0xe6206C7f064c7d77C6d8e3eD8601c9AA435419cE"
const PRIV_KEY = "0xa504b64992e478a6846670237a68ad89b6e42e90de0490273e28e74f084c03c8"
async function run() {
    const wsProvider = new API.WsProvider('ws://localhost:9944');
    const api = await API.ApiPromise.create({
        provider: wsProvider,
        types: cloverTypes,
        rpc: cloverRpc
    });
    const keyring = new API.Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');
    let nonce = await api.rpc.system.accountNextIndex(alice.address);
    web3.eth.accounts.wallet.add(PRIV_KEY);
    let signature = await web3.eth.sign(`clover evm:${web3.utils.bytesToHex(alice.publicKey).slice(2)}`, PUB_KEY);

    await api.tx.evmAccounts
        .claimAccount(PUB_KEY, web3.utils.hexToBytes(signature))
        .signAndSend(alice, {
            nonce,
        }, ({ events = [], status }) => {
            if (status.isInBlock) {

            } else if (status.isFinalized) {

            }
        });
}

run()