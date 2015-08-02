import istrategy = require('./IStrategy');
import buff = require('../modules/TickerBuffer');
import iportfolio = require('./IPortfolio');
import math = require('./MathUtil');

var MathUtil = math.MathUtil;


export class CustomBuyLowSellHigh implements istrategy.IStrategy {

    private mintrade = 10;
    private minpriceincrease = 1.05;
    private keepfiat = 33;
    private minactiondistance = 0.025;
    private buys = [];
    private lastaction = 0;
    private stoploss = 3; // in percent

    constructor() {
    }


    handleTick(tickerbuffer : buff.TickerBuffer, portfolio : iportfolio.IPortfolio) : void {
        var that = this;


        var percincrease = 1 + (this.minpriceincrease / 100);
        var instruments = MathUtil.getInstrumentArray(tickerbuffer.buffer, 'close');

        //var a = that.mintrade + (that.mintrade * (portfolio.tradefee / 100));
        var fee = portfolio.fee / 100;
        var add = Math.round(Math.pow(10,6) * this.mintrade * (fee / (1 - fee))) / Math.pow(10,6);
        var a = this.mintrade + add;
        var EMA21 = MathUtil.EMA(instruments, 21);
        var EMA10 = MathUtil.EMA(instruments, 10);
        var STOCHRSI = MathUtil.STOCHRSI(instruments,14);

        var minactiondist = this.minactiondistance;
        if (EMA21[0] > EMA10[0]) {
            // if we are on the way down, we increase the minaction distance to 2 x min action distance
            minactiondist = minactiondist * 2;
        }

        var curPrice = instruments[0];

        //Check if we are in a buy phase
        var buy = (curPrice < EMA21[0]) && STOCHRSI > 20;
        //Check if we have funds to spend
        var x = ((portfolio.fiat * this.keepfiat)/ 100);
        var tospend = portfolio.fiat - x;

        //debug
        //if (that.buys.length == 0 && Math.floor((portfolio.asset / that.mintrade)) > that.buys.length) {
        //    console.log("missing buy " + portfolio.asset + " > " + that.buys.length, that.buys);
        //}

        console.log('price', curPrice,'EMA21', EMA21[0],'STOCHRSI',STOCHRSI, 'FIAT', portfolio.fiat, 'ASSET', portfolio.asset,'TOTAL', portfolio.fiat + (portfolio.asset *(1 - fee) * curPrice), "buys", that.buys.length);

        //check if current price is higher than one of the bought items
        for (var i = 0; i < that.buys.length; i++) {
            var item = that.buys[i];
            var amount = item.amount * (1 - fee);
            if ((item.rate * (1 - (that.stoploss / 100))) > curPrice && !item.busy && !item.deleted) {
                that.buys[i].busy = true;
                console.log('stoplossing', item.rate, item.amount, curPrice);
                portfolio.getPossiblePrice(amount, iportfolio.METHOD.SELL).then((price:number)=> {
                    portfolio.sell(amount, price).then(()=>{
                        item.deleted=true;
                        console.log('stoplossed', item.rate, item.amount, curPrice);
                    });
                });
            }
        }

        if (buy) {
            //we always spend only mintrade per tick
            if (tospend > (this.mintrade * curPrice) && Math.abs(that.lastaction - curPrice) > minactiondist) {
                portfolio.getPossiblePrice(a, iportfolio.METHOD.BUY).then((price:number)=>{
                    var actualPrice = price;
                    console.log('actual buy price', actualPrice);
                    if (actualPrice < EMA21[0] && tospend > (actualPrice * a) && Math.abs(that.lastaction - actualPrice) > minactiondist) {
                        var opts = {amount:a, rate:actualPrice};
                        console.log('buying @ ' + actualPrice + ", lastaction = " + that.lastaction + ", minsellprice = " + (actualPrice * percincrease), opts);
                        that.lastaction = actualPrice;
                        portfolio.buy(a, actualPrice).then(() => {
                            console.log('bought', opts);
                            console.log("Will sell this portion @ price > " + (actualPrice * percincrease),"info");
                            that.buys.push(opts);
                        }).catch((err) => {
                            console.error("Buy not possible", err);
                        });
                    }
                }).catch((err)=>{
                    console.error('possible price failed', err);
                });
            }
        } else  {
            //check for items to delete
            var z = that.buys.length;
            while (z--) {
                if (that.buys[z].deleted) {
                    that.buys.splice(z, 1);
                }
            }

            //check if current price is higher than one of the bought items
            for (var i = 0; i < that.buys.length; i++) {
                var item = that.buys[i];
                var perc = curPrice / item.rate;
                var amount = item.amount * (1 - fee);
                if (perc > percincrease && !that.buys[i].busy && !that.buys[i].deleted) {
                    that.buys[i].busy = true;
                    portfolio.getPossiblePrice(amount, iportfolio.METHOD.SELL).then((price:number)=>{
                        var actualPrice = price;
                        var actualPercInc = actualPrice / item.rate;
                        if (actualPercInc > percincrease) {
                            console.log('selling ' +item.rate + " -> " + actualPrice + ". inc: " + actualPercInc, actualPrice);
                            portfolio.sell(amount, actualPrice).then(()=>{
                                console.log('sold', actualPrice, that.buys);
                                //that.buys.push(opts);
                                //that.buys.splice(i, 1);
                                that.buys[i].deleted = true;
                                that.lastaction = actualPrice;
                                console.log('removed', actualPrice, that.buys, i);
                            }).catch(()=>{
                                console.log('error while trying to sell');
                                that.buys[i].busy = false;
                            });
                        } else {
                            that.buys[i].busy = false;
                        }
                    });
                    break;
                }
            }
        }
    }
}