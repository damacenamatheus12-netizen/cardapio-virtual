"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock, ChefHat, Truck, Package, Home } from "lucide-react"
import type { Order, Product } from "@/lib/types"

interface OrderStatusProps {
  order: Order
  products: Product[]
  primaryColor: string
  onClose: () => void
}

export function OrderStatus({ order, products, primaryColor, onClose }: OrderStatusProps) {
  const [currentStatus, setCurrentStatus] = useState(order.status)

  useEffect(() => {
    setCurrentStatus(order.status)
  }, [order.status])

  const getStatusInfo = () => {
    switch (currentStatus) {
      case "pending_payment":
        return {
          icon: Clock,
          title: "Aguardando pagamento",
          description: "Complete o pagamento para confirmar seu pedido",
          color: "#F59E0B"
        }
      case "payment_confirmed":
        return {
          icon: CheckCircle,
          title: "Pagamento confirmado",
          description: "Seu pedido foi confirmado e será preparado em breve",
          color: "#10B981"
        }
      case "preparing":
        return {
          icon: ChefHat,
          title: "Em preparo",
          description: "Estamos preparando seu pedido com carinho",
          color: "#3B82F6"
        }
      case "ready":
        return {
          icon: Package,
          title: "Pedido pronto",
          description: order.deliveryMethod === "pickup" 
            ? "Seu pedido está pronto para retirada"
            : "Seu pedido está pronto e será enviado em breve",
          color: "#8B5CF6"
        }
      case "out_for_delivery":
        return {
          icon: Truck,
          title: "Saiu para entrega",
          description: "Seu pedido está a caminho",
          color: "#EC4899"
        }
      case "delivered":
      case "completed":
        return {
          icon: Home,
          title: "Entregue",
          description: "Seu pedido foi entregue. Bom apetite!",
          color: "#10B981"
        }
      default:
        return {
          icon: Clock,
          title: "Processando",
          description: "Aguarde...",
          color: "#6B7280"
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  const orderItems = order.items.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(item => item.product)

  const getPaymentMethodLabel = () => {
    switch (order.paymentMethod) {
      case "pix":
        return "PIX"
      case "card":
        return "Cartão de Crédito"
      case "cash":
        return order.deliveryMethod === "delivery" ? "Dinheiro (na entrega)" : "Dinheiro (no local)"
      default:
        return order.paymentMethod
    }
  }

  const getDeliveryMethodLabel = () => {
    return order.deliveryMethod === "delivery" ? "Entrega" : "Retirada no local"
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
            Status do Pedido
          </h1>
          <p className="text-sm text-gray-600">Pedido #{order.id}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${statusInfo.color}20` }}
            >
              <StatusIcon className="w-10 h-10" style={{ color: statusInfo.color }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: statusInfo.color }}>
              {statusInfo.title}
            </h2>
            <p className="text-gray-600">{statusInfo.description}</p>
          </div>

          {/* Progress Steps */}
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  backgroundColor: primaryColor,
                  width: currentStatus === "pending_payment" ? "0%" :
                         currentStatus === "payment_confirmed" ? "25%" :
                         currentStatus === "preparing" ? "50%" :
                         currentStatus === "ready" ? "75%" :
                         "100%"
                }}
              />
            </div>
            
            <div className="relative flex justify-between">
              {["payment_confirmed", "preparing", "ready", order.deliveryMethod === "delivery" ? "out_for_delivery" : "completed"].map((status, index) => {
                const isActive = 
                  status === "payment_confirmed" && ["payment_confirmed", "preparing", "ready", "out_for_delivery", "delivered", "completed"].includes(currentStatus) ||
                  status === "preparing" && ["preparing", "ready", "out_for_delivery", "delivered", "completed"].includes(currentStatus) ||
                  status === "ready" && ["ready", "out_for_delivery", "delivered", "completed"].includes(currentStatus) ||
                  status === "out_for_delivery" && ["out_for_delivery", "delivered", "completed"].includes(currentStatus) ||
                  status === "completed" && ["completed"].includes(currentStatus)

                return (
                  <div key={status} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive ? "text-white" : "bg-gray-200 text-gray-400"
                      }`}
                      style={isActive ? { backgroundColor: primaryColor } : {}}
                    >
                      {isActive ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <p className="text-xs mt-2 text-center max-w-[80px]">
                      {status === "payment_confirmed" ? "Confirmado" :
                       status === "preparing" ? "Preparando" :
                       status === "ready" ? "Pronto" :
                       status === "out_for_delivery" ? "Entregando" :
                       "Concluído"}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Resumo do Pedido</h3>
          
          <div className="space-y-3 mb-4">
            {orderItems.map(({ productId, quantity, product }) => {
              const finalPrice = product.discount
                ? product.price * (1 - product.discount / 100)
                : product.price

              return (
                <div key={productId} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{quantity}x {product.name}</p>
                      <p className="text-sm text-gray-600">R$ {finalPrice.toFixed(2)} cada</p>
                    </div>
                  </div>
                  <p className="font-bold">R$ {(finalPrice * quantity).toFixed(2)}</p>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Forma de pagamento:</span>
              <span className="font-medium">{getPaymentMethodLabel()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Método de recebimento:</span>
              <span className="font-medium">{getDeliveryMethodLabel()}</span>
            </div>
            {order.deliveryAddress && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Endereço:</span>
                <span className="font-medium text-right">
                  {order.deliveryAddress.street}, {order.deliveryAddress.number}
                  {order.deliveryAddress.complement && ` - ${order.deliveryAddress.complement}`}
                  <br />
                  {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city} - {order.deliveryAddress.state}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span style={{ color: primaryColor }}>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-full text-white font-bold text-lg hover:opacity-90 transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  )
}
