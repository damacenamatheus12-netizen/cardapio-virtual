"use client"

import { CheckCircle2, Clock, Package, Truck, Store } from "lucide-react"
import { Order, OrderStatus } from "@/lib/types"

interface OrderStatusStepProps {
  order: Order
  primaryColor: string
}

const statusConfig: Record<OrderStatus, { icon: any; label: string; description: string }> = {
  pending: {
    icon: Clock,
    label: "Aguardando pagamento",
    description: "Estamos aguardando a confirmação do pagamento"
  },
  payment_received: {
    icon: CheckCircle2,
    label: "Pagamento confirmado",
    description: "Seu pagamento foi recebido com sucesso"
  },
  preparing: {
    icon: Package,
    label: "Em preparo",
    description: "Estamos preparando seu pedido"
  },
  out_for_delivery: {
    icon: Truck,
    label: "Saiu para entrega",
    description: "Seu pedido está a caminho"
  },
  ready_for_pickup: {
    icon: Store,
    label: "Pronto para retirada",
    description: "Seu pedido está pronto para ser retirado"
  },
  completed: {
    icon: CheckCircle2,
    label: "Concluído",
    description: "Pedido entregue com sucesso"
  },
  cancelled: {
    icon: Clock,
    label: "Cancelado",
    description: "Este pedido foi cancelado"
  }
}

export function OrderStatusStep({ order, primaryColor }: OrderStatusStepProps) {
  const config = statusConfig[order.status]
  const Icon = config.icon

  const paymentMethodLabels = {
    pix: 'PIX',
    card: 'Cartão de Crédito',
    cash: 'Dinheiro'
  }

  const deliveryMethodLabels = {
    delivery: 'Entrega no endereço',
    pickup: 'Retirada no local'
  }

  return (
    <div className="space-y-6">
      {/* Status Atual */}
      <div className="text-center">
        <div 
          className="inline-flex p-6 rounded-full mb-4"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Icon 
            className="w-12 h-12"
            style={{ color: primaryColor }}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {config.label}
        </h2>
        <p className="text-gray-600">
          {config.description}
        </p>
      </div>

      {/* Resumo do Pedido */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-lg text-gray-900">Resumo do Pedido</h3>
        
        {/* Itens */}
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-3">
              <img
                src={item.image}
                alt={item.productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity}x R$ {item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-bold text-gray-900">
                R$ {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span 
            className="text-2xl font-bold"
            style={{ color: primaryColor }}
          >
            R$ {order.total.toFixed(2)}
          </span>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200" />

        {/* Informações de Entrega e Pagamento */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Forma de recebimento:</span>
            <span className="font-semibold text-gray-900">
              {deliveryMethodLabels[order.deliveryMethod]}
            </span>
          </div>
          {order.deliveryAddress && (
            <div className="flex justify-between">
              <span className="text-gray-600">Endereço:</span>
              <span className="font-semibold text-gray-900 text-right">
                {order.deliveryAddress.street}, {order.deliveryAddress.number}
                <br />
                {order.deliveryAddress.neighborhood} - {order.deliveryAddress.city}/{order.deliveryAddress.state}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Forma de pagamento:</span>
            <span className="font-semibold text-gray-900">
              {paymentMethodLabels[order.paymentMethod]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pedido:</span>
            <span className="font-semibold text-gray-900">#{order.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Timeline de Status */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Acompanhamento</h3>
        <div className="space-y-3">
          {['payment_received', 'preparing', order.deliveryMethod === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup', 'completed'].map((status, index) => {
            const stepConfig = statusConfig[status as OrderStatus]
            const StepIcon = stepConfig.icon
            const isCompleted = ['payment_received', 'preparing', 'out_for_delivery', 'ready_for_pickup', 'completed'].indexOf(order.status) >= index
            const isCurrent = order.status === status

            return (
              <div key={status} className="flex items-center gap-3">
                <div 
                  className={`p-2 rounded-full ${isCompleted ? '' : 'bg-gray-200'}`}
                  style={isCompleted ? { backgroundColor: primaryColor } : {}}
                >
                  <StepIcon 
                    className="w-5 h-5"
                    style={{ color: isCompleted ? 'white' : '#9ca3af' }}
                  />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>
                    {stepConfig.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
