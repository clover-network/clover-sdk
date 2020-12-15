const API = require("@polkadot/api");
const cloverTypes =  require("./clover-types");
const cloverRpc =  require("./clover-rpc");
const crypto = require("@polkadot/util-crypto");
const _ = require('lodash');
let finished = 0;
let start = new Date().getTime();

function getTestAccounts(keyring, num) {
  const accounts = _.chain(Array(num)).fill(1).map((v, idx) => {
    return keyring.addFromUri(`//test/${idx}`, { name: `test ${idx}` });
  }).value();
  return accounts
}

async function run(numTx) {
  const wsProvider = new API.WsProvider('ws://localhost:9944');
  const api = await API.ApiPromise.create({
    provider: wsProvider,
    types: cloverTypes,
    rpc: cloverRpc
  });
  await crypto.cryptoWaitReady();
  const keyring = new API.Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');

  const { parentHash } = await api.rpc.chain.getHeader();
  let nonce = await api.rpc.system.accountNextIndex(alice.address);
  const balance = await api.query.system.account.at(parentHash, alice.address);
  console.log(`Alice's balance at ${parentHash.toHex()} was ${balance.data.free}`);
  let accounts = getTestAccounts(keyring, 1);
  finished = 0;
  start = new Date().getTime();
  const tx = [...Array(numTx).keys()].map(i => sendTx(api, alice, accounts[0].address, "1000000000000", _.parseInt(nonce) + i));
  return Promise.all(tx);
}

function sendTx(api, from, to, amount, nonce) {
  return new Promise(async (resolve, reject) => {
    const unsub = await api.tx.balances
      .transfer(to, amount)
      .signAndSend(from, {
        nonce,
      }, ({ events = [], status }) => {
        if (status.isInBlock) {
          finished++;
          const tps = finished * 1000 / (new Date().getTime() - start);
          console.log(`tps: ${tps}`);
          unsub();
        } else if (status.isFinalized) {
        }
      });
  });
}

run(10000).then(() => {
  console.log("done");
  process.exit(0);
});
