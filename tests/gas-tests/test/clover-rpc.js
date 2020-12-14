const cloverRpc = {
  incentive: {
    getAllPools: {
      description: 'get all pools',
      params: [],
      type: 'Vec<(CurrencyTypeEnum, CurrencyTypeEnum, String, String)>',
    },
  },
  clover: {
    getCurrencies: {
      description: 'get currencies',
      params: [],
      type: 'Vec<(CurrencyInfo)>',
    },
    getBalance: {
      description: 'get balance',
      params: [
        {
          name: 'account',
          type: 'String',
        },
        {
          name: 'currencyId',
          type: 'CurrencyTypeEnum',
          isOptional: true,
        },
      ],
      type: 'Vec<(CurrencyTypeEnum, String)>',
    },
    getLiquidity: {
      description: 'get liquidity',
      params: [
        {
          name: 'account',
          type: 'String',
          isOptional: true,
        },
      ],
      type: 'Vec<(CurrencyTypeEnum, CurrencyTypeEnum, String, String, String, String, String)>',
    },
    currencyPair: {
      description: 'currency pairs',
      params: [],
      type: 'Vec<(CurrencyTypeEnum, CurrencyTypeEnum)>',
    },
    targetAmountAvailable: {
      description: 'target amount available',
      params: [
        {
          name: 'tokenType',
          type: 'CurrencyTypeEnum',
        },
        {
          name: 'targetTokenType',
          type: 'CurrencyTypeEnum',
        },
        {
          name: 'amount',
          type: 'Balance',
        },
      ],
      type: 'SwapResultInfo',
    },
    supplyAmountNeeded: {
      description: 'supply amount needed',
      params: [
        {
          name: 'tokenType',
          type: 'CurrencyTypeEnum',
        },
        {
          name: 'targetTokenType',
          type: 'CurrencyTypeEnum',
        },
        {
          name: 'amount',
          type: 'Balance',
        },
      ],
      type: 'SwapResultInfo',
    },
    toAddLiquidity: {
      description: 'to add liquidity',
      params: [
        {
          name: 'fromTokenType',
          type: 'CurrencyTypeEnum',
        },
        {
          name: 'toTokenType',
          type: 'CurrencyTypeEnum',
        },
        {
          name: 'amountFrom',
          type: 'Balance',
        },
        {
          name: 'amountTo',
          type: 'Balance',
        },
      ],
      type: 'Vec<String>',
    },

    getAccountStakingInfo: {
      description: 'deposited token',
      params: [
        {
          name: 'account',
          type: 'String',
        },
        {
          name: 'currency_first',
          type: 'CurrencyTypeEnum',
        },
        {
          name: 'currency_second',
          type: 'CurrencyTypeEnum',
        },
      ],
      type: 'Vec<String>',
    },
  },
};

module.exports = cloverRpc;
