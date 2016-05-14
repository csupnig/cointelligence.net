import mongoose = require('mongoose');
import Q = require('q');
import config = require('../config/config');
import ticker = require('../modules/Ticker');

// Document schema for ticker
var TickSchema = new mongoose.Schema({
    tickerid: { type: String, required: true },
    vol: { type : Number},
    open: { type : Number},
    close: { type : Number},
    high: { type : Number},
    low: { type : Number},
    date: { type : Number} // timestamp
});

export interface ITick extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    tickerid : string;
    open : number;
    close: number;
    high : number;
    low  : number;
    vol  : number;
    date : number;
}

export interface ITickModel extends mongoose.Model<ITick> {
    findByTickerid(tickerid : string, resolution : number) : Q.Promise<Array<ITick>>;
    saveAndCreate(tick : ticker.Tick, pair : string) : Q.Promise<ticker.SaveableTick>;
}


TickSchema.static('findByTickerid', (tickerid : string, resolution : number) : Q.Promise<Array<ITick>> => {
        var deferred = Q.defer<Array<ITick>>();
        if (resolution > (60)) {
            var now = new Date().getTime() / 1000;
            var since = now - (config.tickerdatabuffer * resolution);
            TickModel.find({"tickerid":tickerid}).where('date').gt(since).sort('+date').exec((err,ticks) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(ticks);
                }
            });
        } else {
            TickModel.find({"tickerid":tickerid}).sort('+date').limit(config.tickerdatabuffer).exec((err,ticks) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(ticks);
                }
            });
        }
        return deferred.promise;
});

TickSchema.static('saveAndCreate', (tick : ticker.Tick, pair : string) : Q.Promise<ticker.SaveableTick> => {
        var saveable : ticker.SaveableTick = <ticker.SaveableTick> tick,
            deferred = Q.defer<ticker.SaveableTick>();
        saveable.tickerid = pair;
        var t = new TickModel(saveable);
        t.save(function(err){
            if (err) {
                deferred.reject(err);
            } else {
                console.log('tick saved');
                deferred.resolve(saveable);
            }
        });
        return deferred.promise;
    });

export var TickModel = <ITickModel>mongoose.model('tickers', TickSchema);
