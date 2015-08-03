var math = require('../build/strategies/MathUtil');
var assert = require('assert');
var MathUtil = math.MathUtil;

describe('MathUtil', function(){
    describe('RSI', function(){
       it('should youeld expected results', function(){
          var instruments = [44.34,
                  44.09,
                  44.15,
                  43.61,
                  44.33,
                  44.83,
                  45.10,
                  45.42,
                  45.84,
                  46.08,
                  45.89,
                  46.03,
                  45.61,
                  46.28,
                  46.28,
                  46.00,
                  46.03,
                  46.41,
                  46.22,
                  45.64,
                  46.21,
                  46.25,
                  45.71,
                  46.45,
                  45.78,
                  45.35,
                  44.03,
                  44.18,
                  44.22,
                  44.57,
                  43.42,
                  42.66,
                  43.13].reverse(),
              rsi = MathUtil.RSI(instruments, 14);
            console.log(rsi);
           assert.equal(37.77, rsi[0]);
           assert.equal(33.08, rsi[1]);
           assert.equal(37.30, rsi[2]);
           assert.equal(45.46, rsi[3]);
       });
    });
    describe('STOCHRSI', function(){
       it('should yield expected results', function(){
          var instruments = [
              54.09,
              59.90,
              58.20,
              59.76,
              52.35,
              52.82,
              56.94,
              57.47,
              55.26,
              57.51,
              54.80,
              51.47,
              56.16,
              58.34,
              56.02,
              60.22,
              56.75,
              57.38,
              50.23,
              57.06,
              61.51,
              63.69,
              66.22,
              69.16,
              70.73,
              67.79,
              68.82,
              62.38,
              67.59,
              67.59
              ].reverse(),
              stochrsi = MathUtil.STOCHRSI(instruments,14);
           assert.equal(85, stochrsi);

       });
    });
});