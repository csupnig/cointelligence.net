import config = require('../config/config');
import btce = require('../APIs/Btce');
import tickmodel = require('../models/Tick');
import Q = require('q');

export class Tick {
    public open : number=0;
    public close: number=0;
    public high : number=0;
    public low  : number=0;
    public vol  : number=0;
    public date : number=0;
}

export class SaveableTick extends Tick {
    tickerid : string;
}


export class Ticker {

    private api = new btce.BTCEPublic();

    private currentRequest : Q.Promise<Tick>;

    private tickerLastPacket : number = 0;
    private tickerLastPortion : number = 0;

    private currentElement : Tick = new Tick();

    constructor(public pair:string, private tickhandler : (tick : Tick) => void) {

    }

    public startTicker() {
        var ticker = this;
        setInterval(()=> {
            try {
                ticker._tick();
            } catch (err) {
                console.error("Cought exception in ticker cycle for (" + this.pair + ").", err, err.stack);
            }
        }, config.tickerinterval);
    }

    private _tick(): void {
        var ticker = this;
        ticker._getCurrentTick().then((t : Tick) => {
            var tick = t,
                currentElement = ticker.currentElement,
                time = t.date,
                last = tick.close;
            ticker.tickerLastPortion = time;
            if (time > (ticker.tickerLastPacket + config.tickerresolution)) {
                //create new tick
                if (currentElement.close) {
                    ticker._createAndSaveTick(currentElement).catch((err)=>{
                        console.error('Could not save tick ' + ticker.pair, err);
                    });
                    currentElement = ticker.currentElement = new Tick();
                }
                currentElement.vol = tick.vol;
                currentElement.open = last;
                currentElement.close = last;
                currentElement.high = last;
                currentElement.low = last;
                currentElement.date = time;
                ticker.tickerLastPacket = time;
            } else {
                //update tick
                currentElement.close = last;
                currentElement.vol += tick.vol;
                if (last < currentElement.low) {
                    currentElement.low = last;
                }
                if (last > currentElement.high) {
                    currentElement.high = last;
                }
                currentElement.date = time;
            }
            this.tickhandler(currentElement);
        }).catch((err)=>{
            console.error("Problem in ticker " + ticker.pair,err, err.stack);
        });
    }

    private _getCurrentTick(): Q.Promise<Tick> {
        var deferred : Q.Deferred<Tick> = Q.defer<Tick>(),
            ticker = this;
        if (typeof this.currentRequest != 'undefined' && this.currentRequest != null) {
            return this.currentRequest;
        }
        this.currentRequest = deferred.promise;

        if (ticker.tickerLastPacket == 0) {
            ticker.tickerLastPacket = (new Date().getTime() / 1000) - 60; // get last 60 seconds
        }
        var t = new Tick();
        this.api.ticker(this.pair)
            .then((data:btce.ITickerResponse) => {
                t.close = data.last;
                t.high = data.high;
                t.low = data.low;
                t.date = data.updated ? data.updated : (new Date().getTime() / 1000);
                t.open = data.last;
                ticker.api.trades(ticker.pair).then((trades : btce.ITradesResponse)=>{
                    var vol = 0;
                    trades.trades.forEach((item : btce.ITrade) => {
                        var ts = Number(item.timestamp);
                        //console.log(ts, lastTS);
                        if (ts >= ticker.tickerLastPacket && ts < t.date) {
                            vol += Number(item.amount);
                        }
                    });
                    t.vol = vol;
                    ticker.currentRequest=null;
                    deferred.resolve(t);
                }).catch((err)=>{
                    ticker.currentRequest=null;
                    deferred.reject(err);
                })
            }).catch((err)=>{
                ticker.currentRequest=null;
                deferred.reject(err);
            });

        return this.currentRequest;
    }

    private _createAndSaveTick(tick : Tick) : Q.Promise<SaveableTick> {
        var saveable : SaveableTick = <SaveableTick> tick,
            deferred = Q.defer<SaveableTick>();
        saveable.tickerid = this.pair;
        var t = new tickmodel.TickModel(saveable);
        t.save(function(err){
            if (err) {
                deferred.reject(err);
            } else {
                console.log('tick saved');
                deferred.resolve(saveable);
            }
        });
        return deferred.promise;
    }
}