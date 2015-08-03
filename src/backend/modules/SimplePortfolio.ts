import iportfolio = require('../strategies/IPortfolio');
import Q = require('q');
import btce = require('../APIs/Btce');

export class SimplePortfolio implements iportfolio.IPortfolio {

    private api = new btce.BTCEPublic();

    constructor(public pair : string, public fiat : number, public asset : number, public fee : number){

    }

    buy(amount : number, price : number) : Q.Promise<boolean> {
        var deferred = Q.defer<boolean>();
        console.log('portfolio', this, this.fiat, amount, price);
        if ( (this.fiat - amount * price) >= 0) {
            this.asset += (amount - amount * this.fee);
            this.fiat -= amount * price;
            deferred.resolve(true);
        } else {
            deferred.reject(false);
        }

        return deferred.promise;
    }
    sell(amount : number, price : number) : Q.Promise<boolean> {
        var deferred = Q.defer<boolean>();
        console.log('portfolio', this, this.fiat, amount, price);
        if (amount > this.asset) {
            amount = this.asset;
        }
        if ( (this.asset - amount) >= 0) {
            this.asset -= amount;
            this.fiat += (amount - amount * this.fee) * price;
            deferred.resolve(true);
        } else {
            deferred.reject(false);
        }
        return deferred.promise;
    }

    getPossiblePrice(amount : number, method : iportfolio.METHOD) : Q.Promise<number> {
        var deferred = Q.defer<number>()
        this.api.depth(this.pair).then((depth : btce.IDepthResponse) => {
            var info : Array<btce.IDepthInfo>,
                price : number = 0,
                filled : number = 0,
                i : number = 0;
            if (method == iportfolio.METHOD.BUY) {
                info = depth.bids;
            } else {
                info = depth.asks;
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