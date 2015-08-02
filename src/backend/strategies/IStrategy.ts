import tickerbuffer = require('../modules/TickerBuffer');
import portfolio = require('./IPortfolio')

export interface IStrategy {
    handleTick(tickerbuffer : tickerbuffer.TickerBuffer, portfolio : portfolio.IPortfolio) : void;
}