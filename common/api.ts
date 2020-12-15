import Web3 from "web3"
import { WsProvider, ApiPromise } from "@polkadot/api"
import { cloverTypes } from "./clover-types"

const WEB3_RPC = "http://localhost:8545"
const POLKADOT_WS = "ws://localhost:9944"

export enum ApiProvider {
    Web3,
    Polkadot
}

let providers = {
    web3: null,
    polkadot: null
}

export async function getApi(provider: ApiProvider): Promise<any> {
    switch (provider) {
        case ApiProvider.Web3: {
            if (!providers.web3) {
                providers.web3 = new Web3(WEB3_RPC)
            }
            return Promise.resolve(providers.web3)
        }
        case ApiProvider.Polkadot: {
            if (!providers.polkadot) {
                const wsProvider = new WsProvider(POLKADOT_WS);
                providers.polkadot = ApiPromise.create({
                    provider: wsProvider,
                    types: cloverTypes
                });
            }
            return providers.polkadot
        }
    }
}

