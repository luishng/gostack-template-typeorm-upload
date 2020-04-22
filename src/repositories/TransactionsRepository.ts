import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {
    let income = 0;
    let outcome = 0;
    let total = 0;

    transactions.forEach(transaction => {
      switch (transaction.type) {
        case 'income': {
          income += transaction.value;
          break;
        }
        case 'outcome': {
          outcome += transaction.value;
          break;
        }
        default: {
          break;
        }
      }
    });

    total = income - outcome;

    const balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
