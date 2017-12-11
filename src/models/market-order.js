'use strict';
const Order = require('./order');
const { ORDER_TYPE, ORDER_SIDE } = require('../constants');

class MarketOrder extends Order {
  constructor({ id, side, price, volume, locked }) {
    const type = ORDER_TYPE.MARKET;
    super({ id, side, type, price, volume, locked });
  }

  tradeWith(tradeOrder, tradeBook) {
    let price;
    let volume;
    if (tradeOrder.type === ORDER_TYPE.LIMIT) {
      price = tradeOrder.price;
      volume = Math.min(
        this.volume,
        tradeOrder.volume,
        this.volumeLimit(price)
      );
    } else if (tradeBook.bestLimitPrice) {
      price = tradeBook.bestLimitPrice;
      volume = Math.min(
        this.volume,
        this.volumeLimit(price),
        tradeOrder.volume,
        tradeOrder.volumeLimit(price)
      );
    }
    const cost = price * volume;
    return { price, volume, cost };
  }

  fill({ volume, cost }) {
    if (volume > this.volume) {
      throw new Error('Balance Not Enough');
    }
    this.attributes.volume -= volume;
    const _cost = this.side === ORDER_SIDE.ASK ? volume : cost;
    if (_cost > this.locked) {
      throw new Error('Exceed SumLimit');
    }
    this.attributes.locked -= _cost;
  }

  volumeLimit(price) {
    return this.type === ORDER_TYPE.ASK
      ? this.locked
      : (this.locked / price);
  }

  isFilled() {
    return (this.volume <= 0) || (this.locked <= 0);
  }
}

module.exports = MarketOrder;
