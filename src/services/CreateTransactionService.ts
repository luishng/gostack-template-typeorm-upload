import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const totalTransactions = await transactionsRepository.find({
      relations: ['category'],
    });
    const balance = await transactionsRepository.getBalance(totalTransactions);

    let category_id = '';

    const verifyTypeString =
      type.includes('income') || type.includes('outcome');

    if (!verifyTypeString) {
      throw new AppError('Incorrect type of transaction');
    }
    if (value <= 0) {
      throw new AppError('Value of transaction is incorrect');
    }
    if (!type.includes('income') && balance.total < value) {
      throw new AppError('You dont have money for this transaction');
    }
    if (title.length <= 3) {
      throw new AppError(
        'Title of transaction need to be at least 4 caracters',
      );
    }

    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const categoryOBj = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryOBj) {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);
      category_id = newCategory.id;
    } else {
      category_id = categoryOBj.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
