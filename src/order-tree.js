'use strict';
const { RBTree } = require('bintrees');

class OrderTree extends RBTree {
  constructor() {
    super((a, b) => {
      if (a.price > b.price) return 1;
      if (a.price < b.price) return -1;
      return 0;
    });
  }
}

module.exports = OrderTree;
