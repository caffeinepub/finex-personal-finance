import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Category, Transaction, UserProfile, CashflowInsights, CategoryType } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategoriesByType();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Category) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCategory(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Category) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCategory(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useGetTransactions(page: number = 0, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['transactions', page, pageSize],
    queryFn: async () => {
      if (!actor) return { items: [], total: BigInt(0), page: BigInt(0), pageSize: BigInt(0) };
      return actor.getTransactions(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchTransactions(searchTerm: string, page: number = 0, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['transactions', 'search', searchTerm, page, pageSize],
    queryFn: async () => {
      if (!actor) return { items: [], total: BigInt(0), page: BigInt(0), pageSize: BigInt(0) };
      return actor.searchTransactions(searchTerm, BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useGetTransactionsByType(transactionType: CategoryType, page: number = 0, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['transactions', 'type', transactionType, page, pageSize],
    queryFn: async () => {
      if (!actor) return { items: [], total: BigInt(0), page: BigInt(0), pageSize: BigInt(0) };
      return actor.getTransactionsByType(transactionType, BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTransactionsByCategory(categoryId: string, page: number = 0, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['transactions', 'category', categoryId, page, pageSize],
    queryFn: async () => {
      if (!actor) return { items: [], total: BigInt(0), page: BigInt(0), pageSize: BigInt(0) };
      return actor.getTransactionsByCategory(categoryId, BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching && categoryId.length > 0,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cashflowInsights'] });
      queryClient.invalidateQueries({ queryKey: ['calendarTotals'] });
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cashflowInsights'] });
      queryClient.invalidateQueries({ queryKey: ['calendarTotals'] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTransaction(transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cashflowInsights'] });
      queryClient.invalidateQueries({ queryKey: ['calendarTotals'] });
    },
  });
}

export function useUploadReceipt() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ receiptId, imageData }: { receiptId: string; imageData: Uint8Array }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadReceipt(receiptId, imageData);
    },
  });
}

export function useGetReceipt(receiptId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Uint8Array | null>({
    queryKey: ['receipt', receiptId],
    queryFn: async () => {
      if (!actor || !receiptId) return null;
      return actor.getReceipt(receiptId);
    },
    enabled: !!actor && !isFetching && !!receiptId,
  });
}

export function useGetCashflowInsights() {
  const { actor, isFetching } = useActor();

  return useQuery<CashflowInsights>({
    queryKey: ['cashflowInsights'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCashflowInsights();
    },
    enabled: !!actor && !isFetching,
  });
}
