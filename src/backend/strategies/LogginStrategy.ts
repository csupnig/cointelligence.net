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
            ema = MathUtil.EMA(closearray, 21),
            currentTick = tickerbuffer.buffer[0];


        console.log('Price',currentTick.close, 'stochrsi', stochRSI[0],'ema', ema[0], 'BB(h/m/l)');
        console.log('Price', tickerbuffer.buffer[0].close);
    }
}
