import ticker = require("./Ticker");
import config = require("../config/config");
import tickmodel = require('../models/Tick');
import Q = require('q');
import tickerbuffer = require("./TickerBuffer");
import istrategy = require('../strategies/IStrategy');
import iportfolio = require('../strategies/IPortfolio');

export class StrategyExecutor {

    private buffer : tickerbuffer.TickerBuffer = null;
    private recordTicks : boolean = false;

    constructor(private pair : string, private resolution : number, private strategy : istrategy.IStrategy, private portfolio : iportfolio.IPortfolio) {
        var executor = this;
        this.buffer = new tickerbuffer.TickerBuffer(resolution, config.tickerdatabuffer);
        this.getInitialData().then((ticks : Array<ticker.Tick>) => {
            if (ticks && ticks.length > 0) {
                for(var i = 0; i< ticks.length; i++) {
                    executor.buffer.addTick(ticks[i]);
                }
            }
            console.log('loaded '+ executor.buffer.buffer.length + ' items into buffer');
            executor.recordTicks = true;
        });
    }


    public handleTick(tick : ticker.Tick) : void {
        var executor = this;
        if (executor.recordTicks) {
            executor.buffer.addTick(tick);
            executor.strategy.handleTick(executor.buffer, executor.portfolio);
        }
    }

    private getInitialData() : Q.Promise<Array<tickmodel.ITick>> {
        return tickmodel.TickModel.findByTickerid(this.pair, this.resolution);
    }
}