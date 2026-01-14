export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO String
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export interface FinancialState {
  transactions: Transaction[];
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export const CATEGORIES = {
  income: ['Sales Revenue', 'Wholesale', 'Pre-order', 'Other'],
  expense: ['Inventory (Fabric)', 'Supplies (Ink/Dye)', 'Logistics', 'Marketing', 'Rent/Utilities', 'Salary', 'Other']
};