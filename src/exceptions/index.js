'use strict';

class StantardError extends Error {
  constructor(msg) {
    super(msg);
  }
}
class BalanceNotEnough extends StantardError {
  constructor() {
    super('Balance Not Enough');
  }
}
class ExceedSumLimit extends StantardError {
  constructor() {
    super('Exceed SumLimit');
  }
}
class OrderTypeNotSupported extends StantardError {
  constructor() {
    super('Not supported order type');
  }
}

module.exports = { BalanceNotEnough, ExceedSumLimit, OrderTypeNotSupported };
