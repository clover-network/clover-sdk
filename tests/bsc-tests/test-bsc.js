const { BncClient } = require("@binance-chain/javascript-sdk");
const Web3 = require("web3")
// mainnet
// const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
// testnet
const web3 = new Web3('https://bsc-dataseed.binance.org/');

async function run(account) {
    try {
        //const client = new BncClient("")
        //client.initChain()
        console.log(account);
        const before = await web3.eth.getBalance(account);
        console.log(`before transfer: ${account}, has balance ${web3.utils.fromWei(before, "ether")}`);
    } catch (e) {
        console.log(e)
    }
}

run("0xf39F2Fda4b0c942A85b03760D9C0dB51b7963492")
