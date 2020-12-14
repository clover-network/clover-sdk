const expect = require("chai").expect
const step = require("mocha-steps").step
const Web3 = require("web3")
const BigNumber = require('bignumber.js');

const TIMEOUT = require("../truffle-config").mocha.timeout
const web3 = new Web3("http://localhost:8545")
const GENESIS_ACCOUNT = "0xe6206C7f064c7d77C6d8e3eD8601c9AA435419cE"
const GENESIS_ACCOUNT_PRIVATE_KEY = "0xa504b64992e478a6846670237a68ad89b6e42e90de0490273e28e74f084c03c8"
const TEST_ACCOUNT = "0x2193517101eB10EF22F2FA67eF452F66c51839d3"

async function transfer(account, etherValue) {
  const before = await web3.eth.getBalance(account);
  console.log(`before receive: ${account}, has balance ${before}`)
  const signedTransaction = await web3.eth.accounts.signTransaction({
    from: GENESIS_ACCOUNT,
    to: account,
    value: web3.utils.toWei(etherValue.toString(), "ether"),
    gasPrice: web3.utils.toWei("1", "gwei"),
    gas: "0x5208",
  }, GENESIS_ACCOUNT_PRIVATE_KEY);
  await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
  const after = await web3.eth.getBalance(account);
  console.log(`after receive: ${account}, has balance ${after}`)
}

describe("Test transfer", () => {
  step("Balance should be correct after transaction", async function () {
    const before = await web3.eth.getBalance(GENESIS_ACCOUNT);
    console.log(`before send: ${GENESIS_ACCOUNT}, has balance ${before}`)
    await transfer(TEST_ACCOUNT, 200)
    const after = await web3.eth.getBalance(GENESIS_ACCOUNT);
    console.log(`after send: ${GENESIS_ACCOUNT}, has balance ${after}`)
    const afterBN = new BigNumber(after).plus(new BigNumber("21000000000000")).plus(web3.utils.toWei("200", "ether"));
    expect(afterBN.toString()).to.equal(new BigNumber(before).toString());
  }).timeout(TIMEOUT)
});
