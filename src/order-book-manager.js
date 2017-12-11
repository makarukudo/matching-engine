'use strict';
const { ORDER_SIDE } = require('./constants');
const OrderBook = require('./order-book');

const _A = Symbol('asks');
const _B = Symbol('bids');

class OrderBookManager {
  constructor(delegate = null) {
    this[_A] = new OrderBook(ORDER_SIDE.ASK);
    this[_B] = new OrderBook(ORDER_SIDE.BID);

    if (delegate) {
      this.bind(delegate);
    }
  }

  getOrderBooks(side) {
    if (side === ORDER_SIDE.ASK) {
      return [ this[_A], this[_B] ];
    }
    return [ this[_B], this[_A] ];
  }

  bind(delegate = null) {
    this.delegate = delegate || this.delegate;
    if (!this.delegate) return;
    this[_A].on('update', this.delegate.onOrderBookUpdateOrder.bind(this.delegate) || noop);
    this[_A].on('remove', this.delegate.onOrderBookRemoveOrder.bind(this.delegate) || noop);
    this[_B].on('update', this.delegate.onOrderBookUpdateOrder.bind(this.delegate) || noop);
    this[_B].on('remove', this.delegate.onOrderBookRemoveOrder.bind(this.delegate) || noop);
  }
}

module.exports = OrderBookManager;

function noop() {}
