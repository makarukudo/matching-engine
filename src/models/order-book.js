/* eslint-disable semi */
'use strict';
const { EventEmitter } = require('events');
const OrderTree = require('../lib/order-tree');
const OrderGroup = require('./order-group');
const { ORDER_TYPE, ORDER_SIDE } = require('../constants');
const _M = Symbol('markets');
const _L = Symbol('limits');

class OrderBook extends EventEmitter {
  constructor(side) {
    super();

    this.side = side;
    this[_M] = new OrderTree();
    this[_L] = new OrderTree();
  }

  get size() {
    return this[_L].size + this[_M].size;
  }

  get bestLimitPrice() {
    return this.topOrder.price;
  }

  get topOrder() {
    return this[_M].size ? this.marketTopOrder : this.limitTopOrder;
  }

  get marketTopOrder() {
    if (this.side === ORDER_SIDE.ASK) {
      return this[_M].min();
    }
    return this[_M].max();
  }

  get limitTopOrder() {
    const group = this.side === ORDER_SIDE.ASK
      ? this[_L].min()
      : this[_L].max();
    if (!group) {
      return null;
    }
    return group.topOrder;
  }

  fillTopWithTrade(trade) {
    // console.log('fillTopWithTrade');
    const order = this.topOrder;
    order.fill(trade);
    if (order.isFilled) {
      // console.log('fillTopWithTrade:filled');
      this.remove(order);
    } else {
      // console.log('fillTopWithTrade:update');
      this.emit('update', { order: order.attributes });
    }
  }

  remove(order) {
    let removedOrder = false;
    switch (order.type) {
      case ORDER_TYPE.LIMIT:
        removedOrder = this.removeLimitOrder(order);
        break;
      case ORDER_TYPE.MARKET:
        removedOrder = this.removeMarketOrder(order);
        break;
      default:
        throw new Error('Unknown order type');
    }
    this.emit('remove', { order: removedOrder.attributes });
    return removedOrder;
  }

  removeLimitOrder(order) {
    const group = this[_L].find(order);
    if (!group) return;
    const removedOrder = group.find(order);
    if (!removedOrder) return;
    group.remove(order);
    if (group.isEmpty) {
      this[_L].remove(group);
    }
    return removedOrder;
  }

  removeMarketOrder(order) {
    const removedOrder = this[_M].find(order);
    if (!removedOrder) return;
    this[_M].remove(order);
    return removedOrder;
  }

  find(order) {
    if (order.type === ORDER_TYPE.LIMIT) {
      return this[_L].find(order).find(order);
    }
    return this[_M].find(order);
  }

  insert(order) {
    if (order.type === ORDER_TYPE.LIMIT) {
      const tree = this[_L];
      let group = tree.find(order);
      if (!group) {
        group = new OrderGroup(order.price);
        tree.insert(group);
      }
      group.insert(order);
    } else {
      this[_M].insert(order);
    }
  }
}

module.exports = OrderBook;
