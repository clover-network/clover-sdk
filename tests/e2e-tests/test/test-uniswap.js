const expect = require("chai").expect
const step = require("mocha-steps").step
const Web3 = require("web3")
const fs = require('fs');

const TIMEOUT = require("../truffle-config").mocha.timeout
const web3 = new Web3("wss://api.clover.finance")
const GENESIS_ACCOUNT = "0xe6206C7f064c7d77C6d8e3eD8601c9AA435419cE"
// analyst math decrease risk pool citizen hunt unusual little slam fragile arrive
const GENESIS_ACCOUNT_PRIVATE_KEY = "0xa504b64992e478a6846670237a68ad89b6e42e90de0490273e28e74f084c03c8"
const DEPLOY = require("./installation_data.json")

async function deployContract(deployAccount, deployAccountKey, abi, bytecode, arguments) {
  let contract = new web3.eth.Contract(abi)
  let transaction = contract.deploy({data: bytecode, arguments: arguments})
  let gas = await transaction.estimateGas({
    from: deployAccount
  })
  let options = {
    value: "0x00",
    data: transaction.encodeABI(),
    gasPrice: web3.utils.toWei("1", "gwei"),
    gas : gas
  }
  let signedTransaction = await web3.eth.accounts.signTransaction(options, deployAccountKey)
  let receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
  return receipt
}

async function transfer(account, etherValue) {
  const before = await web3.eth.getBalance(account);
  console.log(`before transfer: ${account}, has balance ${web3.utils.fromWei(before, "ether")}`);
  const nonce = await web3.eth.getTransactionCount(GENESIS_ACCOUNT);
  const signedTransaction = await web3.eth.accounts.signTransaction({
    from: GENESIS_ACCOUNT,
    to: account,
    value: web3.utils.toWei(etherValue.toString(), "ether"),
    gasPrice: web3.utils.toWei("1", "gwei"),
    gas: "0x5208",
    nonce: nonce
  }, GENESIS_ACCOUNT_PRIVATE_KEY);
  await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
  const after = await web3.eth.getBalance(account);
  console.log(`after transfer: ${account}, has balance ${web3.utils.fromWei(after, "ether")}`)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function write_data(object) {
  const message = JSON.stringify(object, null, 4)
  return new Promise(function(resolve, reject) {
    fs.writeFile("./tests/e2e-tests/test/installation_data.json", message, (err) => {
      if (err) throw err;
      resolve();
    });
  });
}

async function createAndFinalizeBlock() {
  const currentBlock = await web3.eth.getBlockNumber()
  while(true) {
    try {
      const newBlock = await web3.eth.getBlock(currentBlock + 1)
      if (newBlock) {
        break
      }
    } catch (err) {
      await sleep(1000)
    }
  }
}

describe("Test transfer", () => {
  step("Send alice account eth for deploy uniswap", async function () {
    await transfer(DEPLOY.public_key.alice, 2000)
    await transfer(DEPLOY.public_key.charlie, 2000)
  }).timeout(TIMEOUT)

  step("Deploy uniswap erc 20", async function () {
    const json = require("../build/contracts/uni/Uni.json")
    const bytecode = json.bytecode
    const abi = json.abi
    const deployer = DEPLOY.public_key.charlie
    const receipt = await deployContract(deployer, DEPLOY.private_key.charlie, abi, bytecode, [deployer, deployer, new Date().getTime()])
    DEPLOY.contract_address.uni = receipt.contractAddress
    console.log(`uniswap erc20 token deployed at address: ${receipt.contractAddress}`)
    await write_data(DEPLOY)
  }).timeout(TIMEOUT)

  step("Deploy uniswap v2 factory", async function () {
    const json = require("../build/contracts/UniswapV2Factory.json")
    const bytecode = json.bytecode
    const abi = json.abi
    const deployer = DEPLOY.public_key.alice
    const receipt = await deployContract(deployer, DEPLOY.private_key.alice, abi, bytecode, [deployer])
    DEPLOY.contract_address.uniswap_v2_factory = receipt.contractAddress
    console.log(`uniswap v2 factory deployed at address: ${receipt.contractAddress}`)

    const contract = new web3.eth.Contract(abi, receipt.contractAddress);
    const feeToSetter = await contract.methods.feeToSetter().call()
    expect(feeToSetter).to.equal(deployer)

    await write_data(DEPLOY)
  }).timeout(TIMEOUT)

  step("Deploy weth", async function () {
    const json = require("../build/contracts/WETH.json")
    const bytecode = json.bytecode
    const abi = json.abi
    const deployer = DEPLOY.public_key.alice
    const receipt = await deployContract(deployer, DEPLOY.private_key.alice, abi, bytecode, [])
    DEPLOY.contract_address.weth = receipt.contractAddress
    console.log(`weth deployed at address: ${receipt.contractAddress}`)

    const contract = new web3.eth.Contract(abi, receipt.contractAddress);
    const name = await contract.methods.name().call()
    const symbol = await contract.methods.symbol().call()
    const totalSupply = await contract.methods.totalSupply().call()
    console.log(`weth name: ${name}, symbol: ${symbol}, total supply: ${totalSupply}`)

    await write_data(DEPLOY)
  }).timeout(TIMEOUT)

  step("Deploy uniswap v2 router", async function () {
    const json = require("../build/contracts/UniswapV2Router02.json")
    const bytecode = json.bytecode
    const abi = json.abi
    const deployer = DEPLOY.public_key.alice
    const receipt = await deployContract(deployer, DEPLOY.private_key.alice, abi, bytecode, [DEPLOY.contract_address.uniswap_v2_factory, DEPLOY.contract_address.weth])
    DEPLOY.contract_address.uniswap_v2_router = receipt.contractAddress
    console.log(`uniswap v2 router deployed at address: ${receipt.contractAddress}`)

    const contract = new web3.eth.Contract(abi, receipt.contractAddress)
    const factoryAddr = await contract.methods.factory().call()
    const wethAddr = await contract.methods.WETH().call()
    expect(factoryAddr).to.equal(DEPLOY.contract_address.uniswap_v2_factory)
    expect(wethAddr).to.equal(DEPLOY.contract_address.weth)
    console.log(`router with factory address: ${factoryAddr}, and weth address: ${wethAddr}`)

    await write_data(DEPLOY)
  }).timeout(TIMEOUT)

  step("Deploy multicall", async function () {
    const json = require("../build/contracts/Multicall.json")
    const bytecode = json.bytecode
    const abi = json.abi
    const deployer = DEPLOY.public_key.alice
    const receipt = await deployContract(deployer, DEPLOY.private_key.alice, abi, bytecode, [])
    DEPLOY.contract_address.multicall = receipt.contractAddress
    console.log(`multicall deployed at address: ${receipt.contractAddress}`)

    await write_data(DEPLOY)
  }).timeout(TIMEOUT)

  step("Deploy clv", async function () {
    const json = require("../build/contracts/CLV.json")
    const bytecode = json.bytecode
    const abi = json.abi
    const deployer = DEPLOY.public_key.alice
    const receipt = await deployContract(deployer, DEPLOY.private_key.alice, abi, bytecode, [web3.utils.toWei("50000", "ether")])
    DEPLOY.contract_address.clv = receipt.contractAddress
    console.log(`clv deployed at address: ${receipt.contractAddress}`)

    await write_data(DEPLOY)
  }).timeout(TIMEOUT)
});
