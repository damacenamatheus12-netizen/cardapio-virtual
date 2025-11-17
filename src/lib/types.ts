// Types para o sistema de pedidos

export type DeliveryMethod = 'delivery' | 'pickup'
export type PaymentMethod = 'pix' | 'card' | 'cash'
export type OrderStatus = 'pending' | 'payment_received' | 'preparing' | 'out_for_delivery' | 'ready_for_pickup' | 'completed' | 'cancelled'

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
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    image: string
  }>
  total: number
  deliveryMethod: DeliveryMethod
  deliveryAddress?: DeliveryAddress
  paymentMethod: PaymentMethod
  status: OrderStatus
  createdAt: string
  updatedAt: string
  mercadoPagoPaymentId?: string
  pixQrCode?: string
  pixQrCodeBase64?: string
  pixCopyPaste?: string
}

export interface MercadoPagoPaymentResponse {
  id: string
  status: string
  status_detail: string
  transaction_amount: number
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
      ticket_url?: string
    }
  }
}
