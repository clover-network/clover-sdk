const API = require("@polkadot/api");
const cloverTypes =  require("./clover-types");
const cloverRpc =  require("./clover-rpc");
const crypto = require("@polkadot/util-crypto");

async function run() {
  const wsProvider = new API.WsProvider('ws://localhost:9944');
  const api = await API.ApiPromise.create({
    provider: wsProvider,
    types: cloverTypes,
    rpc: cloverRpc
  });
  await crypto.cryptoWaitReady();

  const number = 10;
  const keyring = new API.Keyring({ type: 'sr25519' });

  [...Array(number).keys()].map(i => {
    const account = keyring.addFromUri(`//test/${i}`, { name: `test ${i}` });
    console.log(account);
    return account;
  })
}

run().then(() => {
  console.log("done");
})
