import ticker = require("./Ticker");
import config = require("../config/config");
import {TickModel} from "../models/Tick";
import Q = require('q');
import tickerbuffer = require("./TickerBuffer");

export class TickerRunner {

    private ticker : ticker.Ticker = null;

    private handlers : Array<(tick : ticker.Tick)=>void> = [];

    constructor(private pair : string, private resolution : number, private saveticks : boolean) {
        var runner = this;
        runner.ticker = new ticker.Ticker(pair, (tick : ticker.Tick) => {
            runner.handleTick(tick);
        }, (tick : ticker.Tick)=>{
            if (saveticks) {
                TickModel.saveAndCreate(tick, pair).catch((err)=> {
                    console.error('Could not save tick ' + pair, tick, err);
                });
            }
        });
        runner.ticker.startTicker();
    }


    public handleTick(tick : ticker.Tick) : void {
        this.handlers.forEach((handler : (t : ticker.Tick)=>void)=>{
            try {
                handler(tick);
            }catch(err){
                console.trace("Error in handling tick.", err, err.stack);
            }
        });
    }

    public registerHandler(handler : (t : ticker.Tick)=>void) : void {
        this.handlers.push(handler);
    }
}
