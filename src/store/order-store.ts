"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order } from "@/types";
import { sampleOrders } from "@/data/orders";

interface OrderStore {
  orders: Order[];

  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  deleteOrder: (orderId: string) => void;
  getOrder: (orderId: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: sampleOrders,

      addOrder: (order: Order) => {
        set({ orders: [order, ...get().orders] });
      },

      updateOrderStatus: (orderId: string, status: Order["status"]) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        });
      },

      deleteOrder: (orderId: string) => {
        set({ orders: get().orders.filter((o) => o.id !== orderId) });
      },

      getOrder: (orderId: string) => {
        return get().orders.find((o) => o.id === orderId);
      },
    }),
    {
      name: "order-storage",
    }
  )
);
