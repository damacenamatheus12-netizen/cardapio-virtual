// Tipos do sistema

export interface Category {
  id: string
  name: string
  icon?: string
  order: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  available: boolean
  rating?: number
  badge?: string
  discount?: number
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface AppConfig {
  appName: string
  logo?: string
  primaryColor: string
  theme: 'light' | 'dark' | 'custom'
  whatsappNumber?: string
  mercadoPagoAccessToken?: string
  mercadoPagoPublicKey?: string
}

export interface StoreState {
  config: AppConfig
  categories: Category[]
  products: Product[]
  cart: CartItem[]
  orders: Order[]
}

// Tipos para o sistema de pedidos

export type DeliveryMethod = 'delivery' | 'pickup'
export type PaymentMethod = 'pix' | 'card' | 'cash'
export type OrderStatus = 
  | 'pending_payment' 
  | 'payment_confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'completed'

export interface DeliveryAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  deliveryMethod: DeliveryMethod
  deliveryAddress?: DeliveryAddress
  paymentMethod: PaymentMethod
  paymentId?: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface MercadoPagoPayment {
  id: string
  status: string
  qr_code?: string
  qr_code_base64?: string
  ticket_url?: string
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
      ticket_url?: string
    }
  }
}
