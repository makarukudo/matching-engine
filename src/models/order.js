'use strict';
const _A = Symbol('attributes');

class Order {
  constructor(attributes) {
    this[_A] = attributes;
  }

  get attributes() {
    return this[_A];
  }

  get price() {
    return this.attributes.price;
  }

  get side() {
    return this.attributes.side;
  }

  get type() {
    return this.attributes.type;
  }

  get volume() {
    return this.attributes.volume;
  }

  get locked() {
    return this.attributes.locked;
  }
}

module.exports = Order;
