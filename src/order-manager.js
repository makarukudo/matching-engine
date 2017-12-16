'use strict';
const { ORDER_TYPE, ORDER_SIDE } = require('./constants');

class OrderManager {
  static trade(order, tradeOrder, tradeBook) {
    switch (order.type) {
      case ORDER_TYPE.LIMIT:
        return limitTrade(order, tradeOrder);
      case ORDER_TYPE.MARKET:
        return marketTrade(order, tradeOrder, tradeBook);
      default:
        throwNotSupportedOrderType();
    }
  }

  static fill(order, { volume, cost }) {
    if (volume > order.volume) {
      throw new Error('Balance Not Enough');
    }
    order.volume -= volume;
    // fill market order
    if (order.type === ORDER_TYPE.MARKET) {
      const _cost = order.side === ORDER_SIDE.ASK ? volume : cost;
      if (_cost > order.locked) {
        throw new Error('Exceed SumLimit');
      }
      order.locked -= _cost;
    }
  }

  static isFullFilled(order) {
    if (order.type === ORDER_TYPE.LIMIT) {
      return order.volume <= 0;
    }
    return (order.volume <= 0) || (order.locked <= 0);
  }
}

function limitTrade(order, tradeOrder) {
  let price; let volume;
  switch (tradeOrder.type) {
    case ORDER_TYPE.LIMIT:
      if (!isPriceCrossed(order, tradeOrder)) {
        return null;
      }
      price = tradeOrder.price;
      volume = Math.min(order.volume, tradeOrder.volume);
      break;
    case ORDER_TYPE.MARKET:
      price = order.price;
      volume = Math.min(
        order.volume,
        tradeOrder.volume,
        volumeLimitOfMarketOrder(tradeOrder, price)
      );
      break;
    default:
      throwNotSupportedOrderType();
  }
  const cost = price * volume;
  return { price, volume, cost };
}

function isPriceCrossed(order, price) {
  if (order.side === ORDER_SIDE.ASK) {
    return price >= order.price;
  }
  return price <= order.price;
}

function marketTrade(order, tradeOrder, tradeBook) {
  let price;
  let volume;
  if (tradeOrder.type === ORDER_TYPE.LIMIT) {
    price = tradeOrder.price;
    volume = Math.min(
      order.volume,
      tradeOrder.volume,
      volumeLimitOfMarketOrder(order, price)
    );
  } else if (tradeBook.bestLimitPrice) {
    price = tradeBook.bestLimitPrice;
    volume = Math.min(
      order.volume,
      volumeLimitOfMarketOrder(order, price),
      tradeOrder.volume,
      volumeLimitOfMarketOrder(tradeOrder, price)
    );
  }
  const cost = price * volume;
  return { price, volume, cost };
}

function volumeLimitOfMarketOrder(order, price) {
  return order.type === ORDER_TYPE.ASK
    ? order.locked
    : (order.locked / price);
}

function throwNotSupportedOrderType() {
  throw new Error('not supported order type');
}

module.exports = OrderManager;
