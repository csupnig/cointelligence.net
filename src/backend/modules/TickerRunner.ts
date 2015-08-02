import ticker = require("./Ticker");
import btce = require("../APIs/Btce");
import config = require("../config/config");
import tickmodel = require('../models/Tick');
import Q = require('q');
import tickerbuffer = require("./TickerBuffer");
import iportfolio = require("../strategies/IPortfolio");
import istrategy = require("../strategies/IStrategy");

export class TickerRunner {

    private buffer : tickerbuffer.TickerBuffer = null;
    private ticker : ticker.Ticker = null;

    constructor(private pair : string, private resolution : number, private portfolio : iportfolio.IPortfolio, private strategy : istrategy.IStrategy) {
        var runner = this;
        runner.ticker = new ticker.Ticker(pair, (tick : ticker.Tick) => {
            runner.handleTick(tick);
        });

        this.buffer = new tickerbuffer.TickerBuffer(resolution, config.tickerdatabuffer);
        this.getInitialData().then((ticks : Array<ticker.Tick>) => {
            if (ticks && ticks.length > 0) {
                for(var i = 0; i< ticks.length; i++) {
                    runner.buffer.addTick(ticks[i]);
                }
            }
            runner.ticker.startTicker();
        });
    }


    public handleTick(tick : ticker.Tick) : void {
        var runner = this;
        runner.buffer.addTick(tick);
        try {
            this.strategy.handleTick(runner.buffer, runner.portfolio);
        }catch(err){
            console.error("Error in handling tick in strategy.", err, err.stack, err.lineNumber);
        }
    }

    private getInitialData() : Q.Promise<Array<tickmodel.ITick>> {
        return tickmodel.TickModel.findByTickerid(this.pair, this.resolution);
    }
}