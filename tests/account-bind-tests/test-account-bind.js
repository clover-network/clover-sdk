const API = require("@polkadot/api")

async function getBalance(address) {
    const wsProvider = new API.WsProvider('wss://api-ivy.clover.finance');
    const api = await API.ApiPromise.create({
        provider: wsProvider,
        types: {
            Amount: 'i128',
            Keys: 'SessionKeys4',
            AmountOf: 'Amount',
            Balance: 'u128',
            Rate: 'FixedU128',
            Ratio: 'FixedU128',
            EcdsaSignature: '[u8; 65]',
            EvmAddress: 'H160',
        },
    });
    const { parentHash } = await api.rpc.chain.getHeader();
    const {
        data: { free: balance },
    } = await api.query.system.account.at(parentHash, address);
    return balance.toString();
}

getBalance('5DZabq7G2m12g1GUuqs66CCAVcmzdWRkXsGxpi4dgXFEcLEb').then(console.log)