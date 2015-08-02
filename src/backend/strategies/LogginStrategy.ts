import istrategy = require('./IStrategy');
import buff = require('../modules/TickerBuffer');
import iportfolio = require('./IPortfolio');
import math = require('./MathUtil');

var MathUtil = math.MathUtil;

export class LogginStrategy implements istrategy.IStrategy{

    handleTick(tickerbuffer : buff.TickerBuffer, portfolio : iportfolio.IPortfolio) : void {
        var closearray = MathUtil.getInstrumentArray(tickerbuffer.buffer, 'close'),
            stochRSI = MathUtil.STOCHRSI(closearray, 14),
            rsi = MathUtil.RSI(closearray, 14),
            ema = MathUtil.EMA(closearray, 7),
            currentTick = tickerbuffer.buffer[0];
        console.log("C: "+currentTick.close + "; SRSI: "+stochRSI + "; EMA(7): "+ema[0]+";  Fiat: "+portfolio.fiat+"; Asset: "+portfolio.asset + "; BLEN: "+ tickerbuffer.buffer.length);
        portfolio.getPossiblePrice(10, iportfolio.METHOD.BUY).then((price:number)=>{
            console.log('possible price', price);

        }).catch((err)=>{
            console.error('possible price failed', err);
        });
    }
}