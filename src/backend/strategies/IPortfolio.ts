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
    initial:number;
    init() : Q.Promise<boolean>;
    buy(amount : number, price : number) : Q.Promise<number>;
    sell(amount : number, price : number) : Q.Promise<number>;
    getPossiblePrice(amount : number, method : METHOD) : Q.Promise<number>;
}