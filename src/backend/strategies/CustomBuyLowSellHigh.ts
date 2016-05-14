import istrategy = require('./IStrategy');
import buff = require('../modules/TickerBuffer');
import iportfolio = require('./IPortfolio');
import math = require('./MathUtil');

var MathUtil = math.MathUtil;


export class CustomBuyLowSellHigh implements istrategy.IStrategy {

    private mintrade = 0.2;//10;
    private minpriceincrease = 0.6;//in %
    private keepfiat = 33;
    private minactiondistance = 0.015;
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
        var RSI = MathUtil.RSI(instruments, 14);
        var STOCHRSI = MathUtil.STOCHRSI(instruments,14)[0];

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

        console.log(new Date().getTime(),'buy', buy, tospend > (this.mintrade * curPrice) && Math.abs(that.lastaction - curPrice) > minactiondist, 'price', curPrice.toFixed(2),'EMA21', EMA21[0].toFixed(2),'STOCHRSI',STOCHRSI.toFixed(2), 'FIAT', portfolio.fiat.toFixed(2), 'ASSET', portfolio.asset.toFixed(2),'TOTAL', (portfolio.fiat + (portfolio.asset *(1 - fee) * curPrice)).toFixed(2), portfolio.initial.toFixed(2), "buys", that.buys.length);

        //check if current price is higher than one of the bought items
        for (var i = 0; i < that.buys.length; i++) {
            var item = that.buys[i];
            var amount = item.amount * (1 - fee);
            if ((item.rate * (1 - (that.stoploss / 100))) > curPrice && !item.busy && !item.deleted) {
                item.busy = true;
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
                        portfolio.buy(a, actualPrice).then((actAmount : number) => {
                            if (actAmount > 0) {
                                that.lastaction = actualPrice;
                                opts.amount = actAmount;
                                console.log('bought', opts);
                                console.log("Will sell this portion @ price > " + (actualPrice * percincrease), "info");
                                that.buys.push(opts);
                            }
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
                if (perc > percincrease && !item.busy && !item.deleted) {
                    item.busy = true;
                    portfolio.getPossiblePrice(amount, iportfolio.METHOD.SELL).then((price:number)=>{
                        var actualPrice = price;
                        var actualPercInc = actualPrice / item.rate;
                        if (actualPercInc > percincrease) {
                            console.log('selling ' +item.rate + " -> " + actualPrice + ". inc: " + actualPercInc, actualPrice);
                            portfolio.sell(amount, actualPrice).then((actAmount : number)=>{
                                console.log('sold', actualPrice, that.buys);
                                //that.buys.push(opts);
                                //that.buys.splice(i, 1);
                                item.amount -= actAmount;
                                if (item.amount <= 0) {
                                    item.deleted = true;
                                } else {
                                    item.busy = false;
                                }
                                that.lastaction = actualPrice;
                            }).catch(()=>{
                                console.log('error while trying to sell');
                                item.busy = false;
                            });
                        } else {
                            item.busy = false;
                        }
                    }).catch(()=>{
                        item.busy = false;
                    });
                }
            }
        }
    }
}