'use strict';
const _G = Symbol('orders');

class OrderGroup {
  constructor(price) {
    this.price = price;
    this[_G] = [];
  }

  get isEmpty() {
    return this[_G].length === 0;
  }

  get topOrder() {
    return this[_G][0];
  }

  insert(order) {
    this[_G].push(order);
  }

  remove(order) {
    const index = this[_G].findIndex(item => item.id === order.id);
    this[_G].splice(index, 1);
  }

  find(order) {
    return this[_G].find(item => item.id === order.id);
  }
}

module.exports = OrderGroup;
