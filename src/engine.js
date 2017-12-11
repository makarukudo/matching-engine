'use strict';
const { EventEmitter } = require('events');
const OrderBookManager = require('./order-book-manager');
const { ORDER_TYPE } = require('./constants');

class Engine extends EventEmitter {
  constructor(market, delegate = null) {
    super();
    this.market = market;
    this.manager = new OrderBookManager(delegate || this);
  }

  submit(order) {
    const [ orderBook, tradeBook ] = this.manager.getOrderBooks(order.side);
    this.match(order, tradeBook);
    this.addOrCancel(order, orderBook);
  }

  cancel(order) {
    const [ orderBook ] = this.manager.getOrderBooks(order.side);
    const removedOrder = orderBook.remove(order);
    if (removedOrder) {
      this.emit('cancel', { order: removedOrder });
    }
  }

  addOrCancel(order, orderBook) {
    if (order.isFilled) return;
    if (order.type === ORDER_TYPE.LIMIT) {
      orderBook.insert(order);
    } else {
      this.emit('cancel', { order });
    }
  }

  match(order, tradeBook) {
    if (order.isFilled) return;

    const tradeOrder = tradeBook.topOrder;
    if (!tradeOrder) return;

    const trade = order.tradeWith(tradeOrder, tradeBook);
    if (trade) {
      tradeBook.fillTopWithTrade(trade);
      order.fill(trade);

      this.emit('matched', [ order.attributes, tradeOrder.attributes, trade ]);
      this.match(order, tradeBook);
    }
  }

  // delegate
  onOrderBookUpdateOrder(e) {
    // console.log('onOrderBookUpdateOrder');
    this.emit('orderbook:update', e);
  }
  onOrderBookRemoveOrder(e) {
    // console.log('onOrderBookRemoveOrder');
    this.emit('orderbook:remove', e);
  }
}

module.exports = Engine;
