"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoreState, Category, Product, CartItem, AppConfig, Order, DeliveryMethod, PaymentMethod, DeliveryAddress } from './types'

// Dados iniciais
const initialCategories: Category[] = [
  { id: '1', name: 'Promoções', icon: '🔥', order: 0 },
  { id: '2', name: 'Pizzas', icon: '🍕', order: 1 },
  { id: '3', name: 'Hambúrgueres', icon: '🍔', order: 2 },
  { id: '4', name: 'Bebidas', icon: '🥤', order: 3 },
  { id: '5', name: 'Sobremesas', icon: '🍰', order: 4 },
  { id: '6', name: 'Lanches', icon: '🌭', order: 5 },
]

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco e azeite',
    price: 45.90,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    categoryId: '2',
    available: true,
    rating: 4.8,
    badge: 'Mais pedido'
  },
  {
    id: '2',
    name: 'X-Burger Especial',
    description: 'Hambúrguer artesanal, queijo cheddar, bacon, alface e tomate',
    price: 32.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    categoryId: '3',
    available: true,
    rating: 4.9,
    badge: 'Promoção',
    discount: 15
  },
  {
    id: '3',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante Coca-Cola 2 litros gelado',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop',
    categoryId: '4',
    available: true,
    rating: 4.7
  },
  {
    id: '4',
    name: 'Pizza Calabresa',
    description: 'Molho de tomate, mussarela, calabresa fatiada e cebola',
    price: 42.90,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
    categoryId: '2',
    available: true,
    rating: 4.6
  },
  {
    id: '5',
    name: 'Brownie com Sorvete',
    description: 'Brownie de chocolate quente com sorvete de baunilha',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
    categoryId: '5',
    available: true,
    rating: 4.9,
    badge: 'Mais pedido'
  },
  {
    id: '6',
    name: 'Batata Frita Grande',
    description: 'Porção grande de batata frita crocante com molhos',
    price: 22.90,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    categoryId: '6',
    available: true,
    rating: 4.5
  },
  {
    id: '7',
    name: 'Pizza Portuguesa',
    description: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitonas',
    price: 48.90,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    categoryId: '2',
    available: true,
    rating: 4.7
  },
  {
    id: '8',
    name: 'Suco Natural 500ml',
    description: 'Suco natural de laranja, limão ou morango',
    price: 9.90,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
    categoryId: '4',
    available: true,
    rating: 4.8,
    badge: 'Promoção',
    discount: 10
  }
]

const initialConfig: AppConfig = {
  appName: 'iFood',
  primaryColor: '#EA1D2C',
  theme: 'light',
  whatsappNumber: ''
}

interface AppStore extends StoreState {
  // Config actions
  updateConfig: (config: Partial<AppConfig>) => void
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (categories: Category[]) => void
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  toggleProductAvailability: (id: string) => void
  
  // Cart actions
  addToCart: (productId: string) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  getCartTotal: () => number
  
  // Order actions
  createOrder: (
    deliveryMethod: DeliveryMethod,
    paymentMethod: PaymentMethod,
    deliveryAddress?: DeliveryAddress
  ) => Order
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  updateOrderPayment: (orderId: string, paymentId: string) => void
  getOrder: (orderId: string) => Order | undefined
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      config: initialConfig,
      categories: initialCategories,
      products: initialProducts,
      cart: [],
      orders: [],

      // Config actions
      updateConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config }
        })),

      // Category actions
      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: Date.now().toString() }
          ]
        })),

      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          )
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          products: state.products.filter((p) => p.categoryId !== id)
        })),

      reorderCategories: (categories) =>
        set({ categories }),

      // Product actions
      addProduct: (product) =>
        set((state) => ({
          products: [
            ...state.products,
            { ...product, id: Date.now().toString() }
          ]
        })),

      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...product } : p
          )
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id)
        })),

      toggleProductAvailability: (id) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, available: !p.available } : p
          )
        })),

      // Cart actions
      addToCart: (productId) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.productId === productId)
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            }
          }
          return {
            cart: [...state.cart, { productId, quantity: 1 }]
          }
        }),

      removeFromCart: (productId) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.productId === productId)
          if (existingItem && existingItem.quantity > 1) {
            return {
              cart: state.cart.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              )
            }
          }
          return {
            cart: state.cart.filter((item) => item.productId !== productId)
          }
        }),

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const state = get()
        return state.cart.reduce((total, item) => {
          const product = state.products.find((p) => p.id === item.productId)
          if (product) {
            const price = product.discount
              ? product.price * (1 - product.discount / 100)
              : product.price
            return total + price * item.quantity
          }
          return total
        }, 0)
      },

      // Order actions
      createOrder: (deliveryMethod, paymentMethod, deliveryAddress) => {
        const state = get()
        const order: Order = {
          id: Date.now().toString(),
          items: [...state.cart],
          total: state.getCartTotal(),
          deliveryMethod,
          deliveryAddress,
          paymentMethod,
          status: 'pending_payment',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        set((state) => ({
          orders: [...state.orders, order]
        }))

        return order
      },

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          )
        })),

      updateOrderPayment: (orderId, paymentId) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, paymentId, updatedAt: new Date().toISOString() }
              : order
          )
        })),

      getOrder: (orderId) => {
        const state = get()
        return state.orders.find((order) => order.id === orderId)
      }
    }),
    {
      name: 'food-app-storage'
    }
  )
)
