var Web3 = require('web3')
const artifact = require('../build/contracts/UniswapV2Pair.json')
const initCodeHash = Web3.utils.keccak256(artifact.bytecode)
console.log(initCodeHash)
