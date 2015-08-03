import https = require('https');
import URL = require('url');
import crypto = require('crypto');
import querystring = require('querystring');
import util = require('util');
import Q = require('q');
import constants = require('constants');


    var lastNounceTS = 0;
    var nonceincrement = 0;

    export interface ITrade {
        type : string;
        price : number;
        amount : number;
        tid : number;
        timestamp : number;
    }

    export interface ITradesResponse {
        pair : string;
        trades : Array<ITrade>;
    }

    export interface IDepthResponse {
        pair : string
        asks : Array<IDepthInfo>;
        bids : Array<IDepthInfo>
    }

    export interface IDepthInfo {
        price  : number;
        amount : number;
    }

    export interface ITickerResponse {
        pair : string;
        high : number;
        low : number;
        avg : number;
        vol : number;
        vol_cur:number;
        last:number;
        buy:number;
        sell:number;
        updated:number;
    }

    export interface IPublicInfoResponse {
        pair : string;
        decimal_places:number;
        min_price:number;
        max_price:number;
        min_amount:number;
        hidden:number;
        fee:number;
    }

    export class BTCEPublic {


        private urlGet = 'https://btc-e.com:443/api/3';

        constructor() {
        }


        public trades(pair:string):Q.Promise<ITradesResponse> {
            var url = this.urlGet + '/trades/' + (pair ? pair : 'btc_usd');
            return this.getHTTPS(url).then((data:any)=> {
                if (!data[pair]) {
                    throw "Could not get trades";
                }
                return {
                    trades: data[pair],
                    pair: pair
                };
            });
        }


        public depth(pair:string):Q.Promise<IDepthResponse> {
            var url = this.urlGet + '/depth/' + (pair ? pair : 'btc_usd');
            return this.getHTTPS(url).then((data:any)=> {
                var asks:Array<IDepthInfo> = [];
                var bids:Array<IDepthInfo> = [];
                if (!data[pair] || !data[pair].asks || !data[pair].bids) {
                    throw "Could not get depth";
                }
                data[pair].asks.forEach((item)=> {
                    asks.push({
                        price: item[0],
                        amount: item[1]
                    });
                });
                data[pair].bids.forEach((item)=> {
                    bids.push({
                        price: item[0],
                        amount: item[1]
                    });
                });
                return {
                    asks: asks,
                    bids: bids,
                    pair: pair
                };
            });
        }


        public ticker(pair):Q.Promise<ITickerResponse> {
            var url = this.urlGet + '/ticker/' + (pair ? pair : 'btc_usd');
            return this.getHTTPS(url).then((data:any)=> {
                if (!data[pair]) {
                    throw "Could not get ticker";
                }
                data[pair].pair = pair;
                return data[pair];
            });
        }


        public info(pair:string):Q.Promise<IPublicInfoResponse> {
            var url = this.urlGet + '/info';
            return this.getHTTPS(url).then((data:any)=> {
                if (!data.pairs || !data.pairs[pair]) {
                    throw "Could not get info";
                }
                data.pairs[pair].pair = pair;
                return data.pairs[pair];
            });
        }

        /**
         * getHTTPS: Simple HTTPS GET request
         *
         * @param {String} getUrl
         */
        private getHTTPS(getUrl:string):Q.Promise<any> {
            var deferred = Q.defer();
            var options:https.RequestOptions = {};
            var url = URL.parse(getUrl);
            options.host = url.host;
            options.port = Number(url.port);
            options.auth = url.auth;
            options.path = url.path;
            options.hostname = url.hostname;
            options.method = 'GET';
            var req = https.request(options, (res) => {
                var data = '';
                //res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    data += chunk
                });

                res.on('end', () => {
                    try {
                        var result = JSON.parse(data)
                        if (result.error || result.success == 0) {
                            deferred.reject(result.error || 'Unknown error');
                        } else {
                            deferred.resolve(result);
                        }
                    } catch (e) {
                        deferred.reject("Error while parsing json");
                    }
                });
            });

            req.on('error', (err) => {
                deferred.reject(err);
            });

            req.end();
            return deferred.promise;
        }
    }

    export interface ITradeApiResponse {
        success : number;
        return? : any;
        error? :string;
    }

    export interface IAPIRights {
        info : number;
        trade : number;
        withdraw : number;
    }

    export interface IFundsInfo {
        [index: string]: number;
    }

    export interface IPrivateInfo {
        funds : IFundsInfo;
        rights : IAPIRights;
        transaction_count:number;
        open_orders:number;
        server_time:number;
    }

    export interface ITradeResponse {
        received:number,
        remains:number,
        order_id:number;
        funds : IFundsInfo;
    }

    export interface IOrder {
        pair:string;
        type:string;
        amount:number;
        rate:number;
        timestamp_created:number;
        status:number;
    }

    export interface IOrderList {
        [index: string]: IOrder;
    }

    export interface ICancelOrderInfo {
        order_id : number;
        funds : IFundsInfo;
    }

    export interface ITradeHistoryParameters {
        from?: number;//	trade ID, from which the display starts	numerical	0
        count?:number;//	the number of trades for display	numerical	1000
        from_id?:number;//	trade ID, from which the display starts	numerical	0
        end_id?:number;//	trade ID on which the display ends	numerical	?
        order?:string;//	Sorting	ASC or DESC	DESC
        since?:number;//	the time to start the display	UNIX time	0
        end?:number;//	the time to end the display	UNIX time	?
        pair?:string;//	pair to be displayed	btc_usd (example)	all pairs
    }

    export class BTCEPrivate {

        private urlPost = 'https://btc-e.com:443/tapi';
        private nonce = 0;

        constructor(private key:string, private secret:string) {
            this.nonce = this.generateNonce();
        }

        private getTimestamp(time:any):number {
            if (util.isDate(time)) {
                return Math.round(time.getTime() / 1000)
            }
            if (typeof time == 'string') {
                return this.getTimestamp(new Date(time))
            }
            if (typeof time == 'number') {
                return (time >= 0x100000000) ? Math.round(time / 1000) : time
            }
            return 0
        }

        private generateNonce():number {
            var nonce = 0;
            var now = this.getTimestamp(Date.now());
            if (lastNounceTS == now) {
                nonceincrement++;
            } else {
                lastNounceTS = now;
                nonceincrement = 0;
            }
            nonce = now + nonceincrement;
            return nonce;
        }

        public getInfo():Q.Promise<IPrivateInfo> {
            return this.query('getInfo', null);
        }


        public transHistory(params:ITradeHistoryParameters):Q.Promise<any> {
            return this.query('TransHistory', params);
        }


        public tradeHistory(params:ITradeHistoryParameters):Q.Promise<IOrderList> {
            return this.query('TradeHistory', params)
        }

        public orderInfo(orderId:string):Q.Promise<IOrder> {
            return this.query('OrderInfo', {order_id: orderId}).then((data:any)=> {
                if (!data[orderId]) {
                    throw "Order not found";
                }
                return data[orderId];
            });
        }

        activeOrders(pair:string):Q.Promise<IOrderList> {
            return this.query('ActiveOrders', {pair: pair});
        }

        private trade(params):Q.Promise<ITradeResponse> {
            return this.query('Trade', params);
        }

        public buy(pair:string, rate:number, amount:number):Q.Promise<ITradeResponse> {
            return this.trade({
                pair: pair,
                type: 'buy',
                rate: rate,
                amount: amount
            });
        }

        public sell(pair:string, rate:number, amount:number):Q.Promise<ITradeResponse> {
            return this.trade({
                pair: pair,
                type: 'sell',
                rate: rate,
                amount: amount
            });
        }

        public cancelOrder(orderId):Q.Promise<ICancelOrderInfo> {
            return this.query('CancelOrder', {'order_id': orderId});
        }

        /**
         * query: Executes raw query to the API
         *
         * @param {String} method
         * @param {Object} params
         * @param {Function} callback(err, data)
         */
        private query(method:string, params:Object):Q.Promise<any> {
            var btce = this;
            var deferred = Q.defer();
            var content = {
                'method': method,
                'nonce': ++this.nonce,
            };

            if (!!params && typeof(params) == 'object') {
                Object.keys(params).forEach(function (key) {
                    var value;
                    if (key == 'since' || key == 'end') {
                        value = btce.getTimestamp(params[key]);
                    } else {
                        value = params[key];
                    }
                    content[key] = value;
                })
            }

            var contentstr:string = querystring.stringify(content);

            var sign = crypto.createHmac('sha512', new Buffer(this.secret, 'utf8'))
                .update(new Buffer(contentstr, 'utf8'))
                .digest('hex');

            var options:https.RequestOptions = {};
            var url = URL.parse(this.urlPost);
            options.host = url.host;
            options.port = Number(url.port);
            //options.auth = url.auth;
            options.path = url.path;
            options.hostname = url.hostname;
            //options = <https.RequestOptions> url;
            options.method = 'POST';
            options.headers = {
                'Key': this.key,
                'Sign': sign,
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': contentstr.length,
            };


            var req = https.request(options, function (res) {
                var data = '';
                //res.setEncoding('utf8')
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    try {
                        var result:ITradeApiResponse = JSON.parse(data);
                        if (result.error || result.success == 0) {
                            deferred.reject(result.error || 'Unknown error');
                        } else {
                            deferred.resolve(result.return);
                        }
                    } catch (e) {
                        deferred.reject("Error while parsing json");
                    }
                });
            });

            req.on('error', function (err) {
                deferred.reject(err);
            });
            req.write(contentstr);
            req.end();

            return deferred.promise;
        }


    }