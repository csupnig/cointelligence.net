import tickerbuffer = require('../modules/TickerBuffer');
import portfolio = require('./IPortfolio');
import Q = require('q');

export enum METHOD {
    BUY,
    SELL
}

export interface IPortfolio {
    fiat : number;
    asset: number;
    fee : number;
    buy(amount : number, price : number) : Q.Promise<boolean>;
    sell(amount : number, price : number) : Q.Promise<boolean>;
    getPossiblePrice(amount : number, method : METHOD) : Q.Promise<number>;
}