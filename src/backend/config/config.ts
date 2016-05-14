var config = {   fetchupdatesfrommarkets: true,
            adminemail: 'christopher@supnig.com',
            db: 'mongodb://localhost/cointelligence2',
            facebook: {
                clientID: "277291162395670",
                clientSecret: "f42eb8c82b962f02d3b67ea0e5e09200",
                callbackURL: "http://www.cointelligence.net/auth/facebook/callback"
            },

            google: {
                clientID: "{{PLACEHOLDER}}",
                clientSecret: "{{PLACEHOLDER}}",
                callbackURL: "{{PLACEHOLDER}}"
            },
            tickerresolution : 60,//to what resolution ticker items will be combined
            tickerdatabuffer : 1000, //how many items will be stored in memory
            tickerinterval: 1000, //how often the ticker checks for new data
            tickers: [
                {
                    title: "BTC-e BTC/USD",
                    assetpair: "btc_usd",
                    tickerresolution: 60,//to what resolution ticker items will be combined
                    tickerdatabuffer: 1000, //how many items will be stored in memory
                    tickerimplementation: "btce",
                    fiat: "USD",
                    asset: "BTC",
                    fee: 0.2,
                    mintrade: 0.01
                },
                {
                    title: "BTC-e BTC/EUR",
                    assetpair: "btc_eur",
                    tickerresolution: 60,//to what resolution ticker items will be combined
                    tickerdatabuffer: 1000, //how many items will be stored in memory
                    tickerimplementation: "btce",
                    fiat: "EUR",
                    asset: "BTC",
                    fee: 0.2,
                    mintrade: 0.01
                },
                {
                    title: "BTC-e LTC/USD",
                    assetpair: "ltc_usd",
                    tickerresolution: 60,//to what resolution ticker items will be combined
                    tickerdatabuffer: 1000, //how many items will be stored in memory
                    tickerimplementation: "btce",
                    fiat: "USD",
                    asset: "LTC",
                    fee: 0.2,
                    mintrade: 0.1
                },
                {
                    title: "BTC-e LTC/EUR",
                    assetpair: "ltc_eur",
                    tickerresolution: 60,//to what resolution ticker items will be combined
                    tickerdatabuffer: 1000, //how many items will be stored in memory
                    tickerimplementation: "btce",
                    fiat: "EUR",
                    asset: "LTC",
                    fee: 0.2,
                    mintrade: 0.1
                },
                {
                    title: "BTC-e PPC/USD",
                    assetpair: "ppc_usd",
                    tickerresolution: 60,//to what resolution ticker items will be combined
                    tickerdatabuffer: 1000, //how many items will be stored in memory
                    tickerimplementation: "btce",
                    fiat: "USD",
                    asset: "PPC",
                    fee: 0.2,
                    mintrade: 0.1
                },
                {
                    title: "BTC-e NMC/USD",
                    assetpair: "nmc_usd",
                    tickerresolution: 60,//to what resolution ticker items will be combined
                    tickerdatabuffer: 1000, //how many items will be stored in memory
                    tickerimplementation: "btce",
                    fiat: "USD",
                    asset: "NMC",
                    fee: 0.2,
                    mintrade: 0.1
                },
                {
                    title: "BTC-e LTC/BTC",
                    assetpair: "ltc_btc",
                    tickerresolution: 60,//to what resolution ticker items will be combined
                    tickerdatabuffer: 1000, //how many items will be stored in memory
                    tickerimplementation: "btce",
                    fiat: "BTC",
                    asset: "LTC",
                    fee: 0.2,
                    mintrade: 0.01
                }

            ]
        };

export = config;