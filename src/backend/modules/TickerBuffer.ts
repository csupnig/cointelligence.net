import ticker = require('./Ticker');

export class TickerBuffer {
    public buffer : Array<ticker.Tick> = [];
    private tickerLastPacket : number = 0;

    constructor(private resolution : number, private buffersize : number){
        this.buffer.unshift(new ticker.Tick());
    }

    public addTick(tick : ticker.Tick) : void {
        var time = tick.date,
            last = tick.close,
            current = this.buffer[0];
        if (time > (this.tickerLastPacket + this.resolution)) {
            //create new tick
            if (current.close) {
                current = new ticker.Tick();
                this.buffer.unshift(current);
                if (this.buffer.length > this.buffersize) {
                    this.buffer.pop();
                }
            }
            current.vol = tick.vol;
            current.open = last;
            current.close = last;
            current.high = last;
            current.low = last;
            current.date = time;
            this.tickerLastPacket = time;
        } else {
            //update tick
            current.close = last;
            current.vol += tick.vol;
            if (last < current.low) {
                current.low = last;
            }
            if (last > current.high) {
                current.high = last;
            }
        }
    }
}