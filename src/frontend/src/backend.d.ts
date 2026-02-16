import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PaginatedTransactions {
    total: bigint;
    page: bigint;
    pageSize: bigint;
    items: Array<Transaction>;
}
export interface Category {
    id: string;
    categoryType: CategoryType;
    icon?: string;
    name: string;
    color: string;
}
export interface PaginatedCategories {
    total: bigint;
    page: bigint;
    pageSize: bigint;
    items: Array<Category>;
}
export interface CashflowInsights {
    averageMonthlyIncome: bigint;
    largestExpenseCategoryCurrentMonth?: string;
    healthIndicator: Variant_Safe_Overspending_Warning;
    averageMonthlyExpense: bigint;
    monthOverMonthIncomeChange: bigint;
    monthOverMonthExpenseChange: bigint;
    endOfMonthBalanceForecast: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: string;
    categoryId: string;
    transactionType: CategoryType;
    date: bigint;
    note: string;
    receiptId?: string;
    amount: bigint;
}
export enum CategoryType {
    expense = "expense",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_Safe_Overspending_Warning {
    Safe = "Safe",
    Overspending = "Overspending",
    Warning = "Warning"
}
export interface backendInterface {
    addCategory(category: Category): Promise<void>;
    addTransaction(transaction: Transaction): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCategory(categoryId: string): Promise<void>;
    deleteReceipt(receiptId: string): Promise<void>;
    deleteTransaction(transactionId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCashflowInsights(): Promise<CashflowInsights>;
    getCategories(page: bigint, pageSize: bigint): Promise<PaginatedCategories>;
    getCategoriesByType(): Promise<Array<Category>>;
    getCategoriesSortedByColor(): Promise<Array<Category>>;
    getCategory(categoryId: string): Promise<Category | null>;
    getReceipt(receiptId: string): Promise<Uint8Array | null>;
    getTransaction(transactionId: string): Promise<Transaction | null>;
    getTransactions(page: bigint, pageSize: bigint): Promise<PaginatedTransactions>;
    getTransactionsByCategory(categoryId: string, page: bigint, pageSize: bigint): Promise<PaginatedTransactions>;
    getTransactionsByType(transactionType: CategoryType, page: bigint, pageSize: bigint): Promise<PaginatedTransactions>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchTransactions(searchTerm: string, page: bigint, pageSize: bigint): Promise<PaginatedTransactions>;
    updateCategory(category: Category): Promise<void>;
    updateTransaction(transaction: Transaction): Promise<void>;
    uploadReceipt(receiptId: string, imageData: Uint8Array): Promise<void>;
}
