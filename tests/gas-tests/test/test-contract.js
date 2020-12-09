const expect = require("chai").expect
const step = require("mocha-steps").step
const Web3 = require("web3")
const execSync = require("child_process").execSync

const TIMEOUT = require("../truffle-config").mocha.timeout
const cache = require("../build/contracts/Cache.json")
const ballot = require("../build/contracts/Ballot.json")

const web3Clover = new Web3("http://localhost:8545")
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/bd6d2612b6c8462a99385dc5c89cfd41"));
const GENESIS_ACCOUNT = "0xe6206C7f064c7d77C6d8e3eD8601c9AA435419cE"
const GENESIS_ACCOUNT_PRIVATE_KEY = "0xa504b64992e478a6846670237a68ad89b6e42e90de0490273e28e74f084c03c8"

async function estimateGas(web3, abi, bytecode, arguments) {
    let contract = new web3.eth.Contract(abi)
    let gas = await contract.deploy({data: bytecode, arguments: arguments}).estimateGas({
        from: GENESIS_ACCOUNT
    })
    return gas
}

async function deployContract(web3, abi, bytecode, arguments) {
    let contract = new web3.eth.Contract(abi)
    let transaction = contract.deploy({data: bytecode, arguments: arguments})
    let gas = await transaction.estimateGas({
        from: GENESIS_ACCOUNT
    })
    let options = {
        value: "0x00",
        data: transaction.encodeABI(),
        gas : gas
    }
    let signedTransaction = await web3.eth.accounts.signTransaction(options, GENESIS_ACCOUNT_PRIVATE_KEY)
    let result = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
    return result
}

describe("Test contract", () => {
    /*it('should compile contract successfully', async () => {
        execSync('truffle compile');
    }).timeout(TIMEOUT)*/
    step("Estimate contract gas should be same", async function () {
        const arguments = [3]
        let cloverGas = await estimateGas(web3Clover, ballot.abi, ballot.bytecode, arguments)
        let gas = await estimateGas(web3, ballot.abi, ballot.bytecode, arguments)
        console.log(`clover gas: ${cloverGas}, eth gas: ${gas}`)
        expect(cloverGas).to.equal(gas);
    }).timeout(TIMEOUT)

    it.skip("Deploy contract (uint constructor) should succeed", async () => {
        const arguments = [3]
        let cloverContract = await deployContract(web3Clover, ballot.abi, ballot.bytecode, arguments)
        let contract = await deployContract(web3, ballot.abi, ballot.bytecode, arguments)
        console.log('clover contract deployed successfully: ', cloverContract)
        expect(cloverContract.gasUsed).to.equal(contract.gasUsed);
    }).timeout(TIMEOUT)

    it.skip("Deploy contract (empty constructor) should succeed", async () => {
        const arguments = []
        let cloverContract = await deployContract(web3Clover, cache.abi, cache.bytecode, arguments)
        let contract = await deployContract(web3, cache.abi, cache.bytecode, arguments)
        console.log('clover contract deployed successfully: ', cloverContract)
        expect(cloverContract.gasUsed).to.equal(contract.gasUsed);
    }).timeout(TIMEOUT)
});
