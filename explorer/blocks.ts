import { ApiProvider, getApi } from "../common/api"
import Web3 from "web3"
import { knex } from "../db/db"
import { sleep } from "../common/utils"

async function run() {
    const web3: Web3 = await getApi(ApiProvider.Web3)
    while (true) {
        const queryBlock = await knex("status").max("current_block_number as number")
        const maxBlock = queryBlock[0].number === null ? -1 : queryBlock[0].number
        const chainBlock = await web3.eth.getBlockNumber()
        if (maxBlock >= chainBlock) {
            await sleep(3000)
            continue
        }
        let block = await web3.eth.getBlock(maxBlock + 1)
        if (block.transactions.length > 0) {
            await knex.insert({
                block_number: block.number,
                miner: block.miner,
                hash: block.hash,
                gas_used: block.gasUsed,
                trx_num: block.transactions.length,
                create_time: block.timestamp
            }).into("blocks")
        }
        if (maxBlock === -1) {
            await knex.insert({current_block_number: 0}).into("status")
        } else {
            await knex.table('status')
                .where({current_block_number: maxBlock})
                .update({current_block_number: maxBlock + 1});
        }
    }
}

run()
