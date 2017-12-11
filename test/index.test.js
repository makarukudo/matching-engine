'use strict';
const Engine = require('../src/engine');
const { LimitOrder, MarketOrder } = require('../src/models');
const { ORDER_SIDE } = require('../src/constants');

const engine = new Engine('btc-mana');
engine.on('matched', e => {
  console.log('matched', JSON.stringify(e));
});
engine.on('orderbook:update', e => {
  console.log('update', JSON.stringify(e));
});
engine.on('orderbook:remove', e => {
  console.log('remove', JSON.stringify(e));
});

// prepare
(() => {
  const [ asks, bids ] = engine.manager.getOrderBooks(ORDER_SIDE.BID);
  for (let i = 0; i < 100; i++) {
    insert(asks, ORDER_SIDE.ASK);
    insert(bids, ORDER_SIDE.BID);
  }
  function insert(book, side) {
    const price = Math.random() * 100;
    const volume = Math.random() * 1000;
    const order = new LimitOrder({ id: Math.random().toString(32).substr(2, 8), side, volume, price });
    book.insert(order);
  }
})();
let i = 1;
setInterval(() => {
  const id = Math.random().toString(32).substr(2, 8);
  const side = Math.random() > 0.5 ? ORDER_SIDE.ASK : ORDER_SIDE.BID;
  const price = Math.random() * 100;
  const volume = Math.random() * 1000;
  const order = new LimitOrder({ id, side, volume, price });
  engine.submit(order);

  const [ asks, bids ] = engine.manager.getOrderBooks(side);
  console.log(id, asks.size, bids.size, i++);
}, 200);
