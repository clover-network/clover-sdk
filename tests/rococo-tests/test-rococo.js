const API = require("@polkadot/api");
const crypto = require("@polkadot/util-crypto");
const _ = require('lodash');

async function run() {
    const wsProvider = new API.WsProvider('wss://rococo-rpc.polkadot.io');
    const api = await API.ApiPromise.create({
        provider: wsProvider
    });
    await crypto.cryptoWaitReady();

    const {
        data: { free: balance },
    } = await api.query.system.account('5CyNzgo7Paw8ymPioEJcfqnAoGgkftVspyFWjtCQuArcLSFw');
    console.log(balance.toString())

    /**const leases = await api.query.slots.leases.entries()
    _.forEach(leases,lease => {
        console.log(`leas info is: ${lease.toString()}`)
    })**/

    // lease period is 14400,  14400 * 6 = 86400 = 1 day. in future, should be 6 month
    const leasePeriod = api.consts.slots.leasePeriod
    console.log(leasePeriod.toString())

    const funds = await api.query.crowdloan.funds.entries()
    _.forEach(funds,fundInfo => {
        console.log(`fund info is: ${fundInfo.toString()}`)
    })

    const auctionCounter = await api.query.auctions.auctionCounter()
    console.log(`currently, there are total ${auctionCounter.toString()} auctions`)
    const auctionInfo = await api.query.auctions.auctionInfo()
    console.log(`currently, the auctions are: ${auctionInfo.toString()}`)

    /**const paras = await api.query.registrar.paras.entries()
    _.forEach(paras,paraInfo => {
        console.log(`para info is: ${paraInfo.toString()}`)
    })**/
}

run()