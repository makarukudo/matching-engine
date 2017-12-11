'use strict';
const Order = require('./order');
const { ORDER_TYPE, ORDER_SIDE } = require('../constants');

const _C = Symbol('crossed');

class LimitOrder extends Order {
  constructor({ id, side, price, volume }) {
    const type = ORDER_TYPE.LIMIT;
    super({ id, side, type, price, volume });
  }

  tradeWith(tradeOrder) {
    let price;
    let volume;
    if (tradeOrder.type === ORDER_TYPE.LIMIT) { // limit order
      if (!this[_C](tradeOrder.price)) {
        return null;
      }
      price = tradeOrder.price;
      volume = Math.min(this.volume, tradeOrder.volume);
    } else { // market order
      price = this.price;
      volume = Math.min(
        this.volume,
        tradeOrder.volume,
        tradeOrder.volumeLimit(price)
      );
    }
    const cost = price * volume;
    return { price, volume, cost };
  }

  fill({ volume }) {
    if (volume > this.volume) {
      throw new Error('Balance Not Enough');
    }
    this.attributes.volume -= volume;
  }

  [_C](price) {
    if (this.side === ORDER_SIDE.ASK) {
      return price >= this.price;
    }
    return price <= this.price;
  }

  get isFilled() {
    return this.volume <= 0;
  }
}

module.exports = LimitOrder;
