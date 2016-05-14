import iportfolio = require('../strategies/IPortfolio');
import Q = require('q');
import btce = require('../APIs/Btce');

export class BTCEPortfolio implements iportfolio.IPortfolio {

    private api = new btce.BTCEPublic();
    private privateApi : btce.BTCEPrivate = undefined;

    public asset : number = 0;
    public fiat : number = 0;
    public fee : number = 0;
    public initial : number = 0;

    private fiatkey : string = "";
    private assetkey : string = "";

    private decimalPlaces : number = 6;

    constructor(public pair : string, public key:string, public secret : string){
        this.privateApi = new btce.BTCEPrivate(key, secret);
        var keyarr = this.pair.split("_");
        this.fiatkey = keyarr[1];
        this.assetkey = keyarr[0];
    }

    init() : Q.Promise<boolean> {
        var deferred = Q.defer<boolean>(),
            that = this;
        console.log('init');
        this.privateApi.getInfo().then((info : btce.IPrivateInfo)=>{
            console.log('got info', info);
            that.fiat = info.funds[that.fiatkey];
            that.asset = info.funds[that.assetkey];
            that.initial = that.fiat;
            that.api.info(that.pair).then((publicinfo : btce.IPublicInfoResponse)=>{
                console.log('got public info', publicinfo);
                that.fee = publicinfo.fee / 100;
                that.decimalPlaces = publicinfo.decimal_places;
                deferred.resolve(true);
            }).catch((err)=>{
                deferred.reject(err);
            });
        }).catch((err)=>{
            deferred.reject(err);
        });
        return deferred.promise;
    }

    private round(num : number) : number {
        return +num.toFixed(this.decimalPlaces);
    }

    buy(amount : number, price : number) : Q.Promise<number> {
        return this.trade(amount, price, iportfolio.METHOD.BUY);
    }


    sell(amount : number, price : number) : Q.Promise<number> {
        if (amount > this.asset) {
            amount = this.asset;
        }
        return this.trade(amount, price, iportfolio.METHOD.SELL);
    }

    private trade(amount : number, price : number, method : iportfolio.METHOD) : Q.Promise<number> {
        var deferred = Q.defer<number>(),
            that = this,
            trade : Q.Promise<btce.ITradeResponse>;
        if (method == iportfolio.METHOD.BUY) {
            if ( this.fiat >= ( amount * price )) {
                trade = this.privateApi.buy(this.pair, this.round(price), this.round(amount));
            }
        } else {
            if (this.asset >= amount) {
                trade = this.privateApi.sell(this.pair, this.round(price), this.round(amount));
            }
        }
        if (typeof trade != 'undefined') {
            trade.then((info:btce.ITradeResponse)=> {
                if (typeof info.order_id != 'undefined' && info.order_id != 0) {
                    //we received an order id that was not fully filled
                    //we give it 30 seconds and revoke the order
                    setTimeout(()=> {
                        that.privateApi.cancelOrder(info.order_id).then((cancelinfo:btce.ICancelOrderInfo)=> {
                            var diff = that.asset - cancelinfo.funds[that.assetkey];
                            that.fiat = cancelinfo.funds[that.fiatkey];
                            that.asset = cancelinfo.funds[that.assetkey];
                            deferred.resolve(Math.abs(diff));
                        }).catch((err)=> {
                            var diff = that.asset - info.funds[that.assetkey];
                            console.error('COULD NOT CANCEL ORDER', info.order_id, err);
                            //WE MIGHT HAVE TO LIVE WITH A FAULTY ORDER AND ASSUME IT IS GOING TO BE FILLED
                            that.fiat = info.funds[that.fiatkey];
                            that.asset = info.funds[that.assetkey];
                            deferred.resolve(Math.abs(diff));
                        });
                    }, 1000);
                } else {
                    that.fiat = info.funds[that.fiatkey];
                    that.asset = info.funds[that.assetkey];
                    deferred.resolve(amount);
                }
            }).catch((err)=> {
                console.error('Error on trade',err);
                deferred.reject(0);
            });
        } else {
            console.error('insufficient funds');
            deferred.reject(0);
        }
        return deferred.promise;
    }

    getPossiblePrice(amount : number, method : iportfolio.METHOD) : Q.Promise<number> {
        var deferred = Q.defer<number>();
        this.api.depth(this.pair).then((depth : btce.IDepthResponse) => {
            var info : Array<btce.IDepthInfo>,
                price : number = 0,
                filled : number = 0,
                i : number = 0;
            if (method == iportfolio.METHOD.BUY) {
                info = depth.asks;
            } else {
                info = depth.bids;
            }
            for (i = 0; i < info.length; i++) {
                price = info[i].price;
                filled += info[i].amount;
                if (filled >= amount) {
                    break;
                }
            }
            if (filled > 0) {
                deferred.resolve(price);
            } else {
                deferred.reject(price);
            }
        }).catch((err)=>{
            console.error('Problem in getting possible price',err);
            deferred.reject(0);
        });
        return deferred.promise;
    }

}