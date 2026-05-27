"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, AccountInfo } from "@/types";
import { defaultProducts } from "@/data/products";

interface ProductStore {
  products: Product[];
  initialized: boolean;

  // Product CRUD
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Account management
  addAccount: (productId: string, account: AccountInfo) => void;
  updateAccount: (productId: string, accountId: string, updates: Partial<AccountInfo>) => void;
  deleteAccount: (productId: string, accountId: string) => void;
  markAccountSold: (productId: string, accountId: string, soldTo: string) => void;

  // Helpers
  getProduct: (id: string) => Product | undefined;
  getAvailableAccounts: (productId: string) => AccountInfo[];
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: defaultProducts,
      initialized: true,

      addProduct: (product: Product) => {
        set({ products: [...get().products, product] });
      },

      updateProduct: (id: string, updates: Partial<Product>) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        });
      },

      deleteProduct: (id: string) => {
        set({ products: get().products.filter((p) => p.id !== id) });
      },

      addAccount: (productId: string, account: AccountInfo) => {
        set({
          products: get().products.map((p) =>
            p.id === productId
              ? { ...p, accounts: [...p.accounts, account], stock: p.stock + 1 }
              : p
          ),
        });
      },

      updateAccount: (productId: string, accountId: string, updates: Partial<AccountInfo>) => {
        set({
          products: get().products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((acc) =>
                    acc.id === accountId ? { ...acc, ...updates } : acc
                  ),
                }
              : p
          ),
        });
      },

      deleteAccount: (productId: string, accountId: string) => {
        const product = get().products.find((p) => p.id === productId);
        const account = product?.accounts.find((a) => a.id === accountId);
        const stockDelta = account?.status === "available" ? -1 : 0;

        set({
          products: get().products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.filter((acc) => acc.id !== accountId),
                  stock: Math.max(0, p.stock + stockDelta),
                }
              : p
          ),
        });
      },

      markAccountSold: (productId: string, accountId: string, soldTo: string) => {
        set({
          products: get().products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((acc) =>
                    acc.id === accountId
                      ? { ...acc, status: "sold" as const, soldTo, soldAt: new Date().toISOString() }
                      : acc
                  ),
                  stock: Math.max(0, p.stock - 1),
                }
              : p
          ),
        });
      },

      getProduct: (id: string) => {
        return get().products.find((p) => p.id === id);
      },

      getAvailableAccounts: (productId: string) => {
        const product = get().products.find((p) => p.id === productId);
        return product?.accounts.filter((a) => a.status === "available") || [];
      },
    }),
    {
      name: "product-storage",
    }
  )
);
