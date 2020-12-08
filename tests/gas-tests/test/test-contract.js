const expect = require("chai").expect
const step = require("mocha-steps").step
const Web3 = require("web3")
const execSync = require("child_process").execSync

const TIMEOUT = require("../truffle-config").mocha.timeout
const ballot = require("../build/contracts/Ballot.json")

const web3Clover = new Web3("http://localhost:8545")
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/bd6d2612b6c8462a99385dc5c89cfd41"));
const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b"
const GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342"

async function estimateGas(web3, abi, bytecode, arguments) {
    let contract = new web3.eth.Contract(abi)
    let gas = await contract.deploy({data: bytecode, arguments: [arguments]}).estimateGas({from: GENESIS_ACCOUNT})
    return gas
}

describe("Test contract", () => {
    /*it('should compile contract successfully', async () => {
        execSync('truffle compile');
    }).timeout(60000)*/
    step("estimate contract gas", async function () {
        const arguments = [web3.utils.fromAscii("first"), web3.utils.fromAscii("second"), web3.utils.fromAscii("third")]
        let cloverGas = await estimateGas(web3Clover, ballot.abi, ballot.bytecode, arguments)
        let gas = await estimateGas(web3, ballot.abi, ballot.bytecode, arguments)
        console.log(`clover gas: ${cloverGas}, eth gas: ${gas}`)
        expect(cloverGas).to.equal(gas);
    }).timeout(TIMEOUT);

    step("Clover create contract should succeed", async () => {

    })
});
