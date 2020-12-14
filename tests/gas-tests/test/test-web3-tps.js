const Web3 = require("web3")
const web3 = new Web3("http://localhost:8545")
const GENESIS_ACCOUNT = "0xe6206C7f064c7d77C6d8e3eD8601c9AA435419cE"
const GENESIS_ACCOUNT_PRIVATE_KEY = "0xa504b64992e478a6846670237a68ad89b6e42e90de0490273e28e74f084c03c8"
const TEST_ACCOUNT = "0x2193517101eB10EF22F2FA67eF452F66c51839d3"
let sent = 0;
let finished = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function transfer(to, etherValue, nonce, from, fromKey) {
  try {
    sent++;
    const signedTransaction = await web3.eth.accounts.signTransaction({
      from: from,
      to: to,
      value: web3.utils.toWei(etherValue.toString(), "ether"),
      gasPrice: web3.utils.toWei("1", "gwei"),
      gas: "0x5208",
      nonce: nonce
    }, fromKey);
    await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    finished++;
    console.log(`finished ${finished}`);
    return nonce;
  } catch (e) {
    sent--;
    console.log(`Transaction with ${nonce} failed`, e.toString());
    await sleep(1000);
    if (!e.toString().includes("TemporarilyBanned") && !e.toString().includes("AlreadyImported")) {
      transfer(to, etherValue, nonce, from, fromKey);
    }
  }
}

async function doTransfer() {
  const queue = [];
  let nonce = 0;
  const sender = web3.eth.accounts.create();
  const count = await web3.eth.getTransactionCount(GENESIS_ACCOUNT);
  await transfer(sender.address, 10, count, GENESIS_ACCOUNT, GENESIS_ACCOUNT_PRIVATE_KEY);
  const start = new Date().getTime();
  while (nonce < 5000) {
    if (sent - finished > 120) {
      await sleep(1000);
      const tps = finished * 1000 / (new Date().getTime() - start);
      console.log(`tps: ${tps}`)
    } else {
      queue.push(transfer(TEST_ACCOUNT, 0.001, nonce, sender.address, sender.privateKey));
      nonce++;
    }
  }
  return Promise.all(queue);
}

doTransfer().then(() => {
  console.log("done");
})
