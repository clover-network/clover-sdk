const path = require('path')
const dbPath = path.resolve(__dirname, './database.sqlite')

export const knex = require('knex') ({
    client: 'sqlite3',
    connection: {
        filename: dbPath,
    },
    useNullAsDefault: true
})

function buildBlocks() {
    return knex.schema.hasTable('blocks').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('blocks', (table)  => {
                table.increments("id").primary()
                table.integer("block_number").unique()
                table.string("miner")
                table.string("hash")
                table.integer("gas_used")
                table.integer("trx_num")
                table.timestamp("create_time")
            }).catch((error) => {
                console.error(`Error creating table: ${error}`)
            })
        }
    })
}

function buildStatus() {
    return knex.schema.hasTable('status').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('status', (table)  => {
                table.increments("id").primary()
                table.integer("current_block_number")
                table.timestamp("create_time").defaultTo(knex.fn.now())
            }).catch((error) => {
                console.error(`Error creating table: ${error}`)
            })
        }
    })
}

export async function buildTables() {
    await buildBlocks()
    await buildStatus()
}

buildTables()
