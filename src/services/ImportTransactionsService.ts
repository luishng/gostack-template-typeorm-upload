import { getCustomRepository, getRepository } from 'typeorm';
import csv from 'csvtojson';

import Transaction from '../models/Transaction';

import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  file: {
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
  };
}
class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {
    const transactionRepository = getRepository(Transaction);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const jsonArray = await csv().fromFile(file.path);

    let category_id = '';

    // eslint-disable-next-line no-restricted-syntax
    for (const transactioncsv of jsonArray) {
      // eslint-disable-next-line no-await-in-loop
      const categoryOBj = await categoriesRepository.findOne({
        where: { title: transactioncsv.category },
      });

      if (!categoryOBj) {
        const newCategory = categoriesRepository.create({
          title: transactioncsv.category,
        });

        await categoriesRepository.save(newCategory);

        category_id = newCategory.id;
      } else {
        category_id = categoryOBj.id;
      }

      const transaction = transactionRepository.create({
        title: transactioncsv.title,
        value: transactioncsv.value,
        type: transactioncsv.type,
        category_id,
      });

      await transactionRepository.save(transaction);
    }

    const transactions = await transactionRepository.find({
      relations: ['category'],
    });

    return transactions;
  }
}

export default ImportTransactionsService;
