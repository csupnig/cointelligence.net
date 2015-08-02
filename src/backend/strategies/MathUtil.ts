/* global module */
import ticker = require('../modules/Ticker');

export interface IAroonResult {
	up : number;
	down : number;
}

export interface IMACDResult {
	macd: Array<number>;
	signal: Array<number>;
	histogram: Array<number>;
}

export class MathUtil {

	public static arrayMax (array : Array<number>) : number {
		return Math.max.apply(Math, array.filter(function (n) {
			return !isNaN(n);
		}));
	}

	public static arrayMin (array : Array<number>) : number {
		return Math.min.apply(Math, array.filter(function (n) {
			return !isNaN(n);
		}));
	}

	public static diff  (x : number, y : number) {
		return ((x - y) / ((x + y) / 2)) * 100;
	}

	public static getInstrumentArray (candleArray : Array<ticker.Tick>, instrument:string) {
		var arr = [], i;
		for (i = 0; i < candleArray.length; i++) {
			arr.push(candleArray[i][instrument]);
		}
		return arr;
	}

	public static average(a : Array<number>) {
		var r = {mean: 0, variance: 0, deviation: 0}, t = a.length, m, l, s;
		for (m, s = 0, l = t; l--; s += a[l]) {
		}
		for (m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2)) {
		}
		return r.deviation = Math.sqrt(r.variance = s / t), r;
	}

	public static BBANDS (array : Array<number>, period : number) {
		var SMA = this.SMA(array, period);
		//TODO finish implementation
		return SMA;
	}


	public static AROON (higharray : Array<number>, lowarray : Array<number>, period : number) : IAroonResult{
		var harr = higharray.slice(0, period),
			larr = lowarray.slice(0, period),
			hh = this.arrayMin(harr),
			hday = harr.indexOf(hh),
			ll = this.arrayMin(larr),
			lday = larr.indexOf(ll);

		return {
			up: ((period - hday) / period) * 100,
			down: ((period - lday) / period) * 100
		};

	}

	public static MFI (higharray : Array<number>, lowarray : Array<number>, closearray : Array<number>, volumearray : Array<number>, period : number) : number {

		var harr = higharray.slice(0, period).reverse(),
			larr = lowarray.slice(0, period).reverse(),
			clarr = closearray.slice(0, period).reverse(),
			vlarr = volumearray.slice(0, period).reverse(),

			lasttp = 0,
			first = true,

			posmf = 0,
			negmf = 0,
			i, tp;

		for (i = 0; i < closearray.length; i++) {
			if (first) {
				lasttp = (harr[i] + larr[i] + clarr[i]) / 3;
				first = false;
			} else {
				tp = (harr[i] + larr[i] + clarr[i]) / 3;
				if (tp > lasttp) {
					posmf += (tp * vlarr[0]);
				} else if (tp < lasttp) {
					negmf += (tp * vlarr[0]);
				}
				lasttp = tp;
			}
		}

		return ( 100 - (100 / (1 + (posmf / negmf))));
	}

	public static RSI (array : Array<number>, rsiperiod : number) : Array<number> {
		var arr = array.slice().reverse(),
			rsi = [], i, j, upVal, downVal, upCount, downCount, val;
		for (i = 0; i < array.length; i++) {
			if ((i - rsiperiod) < 0) {
				rsi.push(NaN);
			} else {
				upVal = 0;
				downVal = 0;
				upCount = 0;
				downCount = 0;
				for (j = i - rsiperiod; j < i; j++) {
					val = arr[j] - arr[j + 1];
					if (val < 0) {
						//ups
						upVal += Math.abs(val);
						upCount++;
					} else if (val > 0) {
						//downs
						downVal += val;
						downCount++;
					}
				}
				rsi.push(100 - (100 / (1 + ((upVal / upCount) / (downVal / downCount)))));
			}
		}
		rsi.reverse();
		return rsi;
	}

	public static STOCHRSI(closearray : Array<number>, rsiperiod : number) : number {
		var rsi = MathUtil.RSI(closearray,rsiperiod),
			rsimin = MathUtil.arrayMin(rsi),
			rsimax = MathUtil.arrayMax(rsi);

		if (rsimax - rsimin == 0) {
			return 100;
		}

		return 100 * (rsi[0] - rsimin) / (rsimax - rsimin);
	}

	public static SMA (originalArray : Array<number>, smaLength : number) : Array<number>{
		var array = originalArray.slice().reverse(),
			sma = [], i;
		for (i = 0; i < smaLength - 1; i++) {
			sma[i] = NaN;
		}
		sma[smaLength - 1] = array.slice(0, smaLength).reduce(function (a, b) {
				return a + b;
			}) / smaLength;
		for (i = smaLength; i < array.length; i++) {
			sma[i] = sma[i - 1] + (array[i] - array[i - smaLength]) / smaLength;
		}
		sma.reverse(); // reverse back for main consumption
		return sma;
	}

	public static EMA (originalArray : Array<number>, emaLength : number) : Array<number>{
		var array = originalArray.slice().reverse(),
			iPos = 0, i, k, ema;
		// trim initial NaN values
		for (iPos = 0; iPos < array.length && isNaN(array[iPos]); iPos++) {
		}
		array = array.slice(iPos); // trim initial NaN values from array
		ema = [];
		k = 2 / (emaLength + 1);
		for (i = 0; i < emaLength - 1; i++) {
			ema[i] = NaN;
		}
		ema[emaLength - 1] = array.slice(0, emaLength).reduce(function (a, b) {
				return a + b;
			}) / emaLength;
		for (i = emaLength; i < array.length; i++) {
			ema[i] = array[i] * k + ema[i - 1] * (1 - k);
		}
		ema.reverse(); // reverse back for main consumption
		for (i = 0; i < iPos; i++) {
			ema.push(NaN);
		}
		return ema;
	}

	public static MACD (array : Array<number>, i12 : number, i26 : number, i9 : number)  : IMACDResult{

		var ema12 = this.EMA(array, i12),
			ema26 = this.EMA(array, i26),
			macd = [], i, signal, histogram;
		for (i = 0; i < ema12.length; i++) {
			macd.push(ema12[i] - ema26[i]);
		}
		signal = this.EMA(macd, i9);
		histogram = [];
		for (i = 0; i < macd.length; i++) {
			histogram.push(macd[i] - signal[i]);
		}
		return {
			macd: macd,
			signal: signal,
			histogram: histogram
		};
	}
}