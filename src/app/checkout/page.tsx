"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { useStore } from "@/lib/store"
import { DeliveryMethodStep } from "@/components/checkout/DeliveryMethodStep"
import { DeliveryAddressStep } from "@/components/checkout/DeliveryAddressStep"
import { PaymentMethodStep } from "@/components/checkout/PaymentMethodStep"
import { PixPaymentStep } from "@/components/checkout/PixPaymentStep"
import { CardPaymentStep } from "@/components/checkout/CardPaymentStep"
import { OrderStatusStep } from "@/components/checkout/OrderStatusStep"
import { DeliveryMethod, PaymentMethod, DeliveryAddress, Order } from "@/lib/types"

type CheckoutStep = 'delivery-method' | 'delivery-address' | 'payment-method' | 'payment-process' | 'order-status'

export default function CheckoutPage() {
  const router = useRouter()
  const { config, products, cart, getCartTotal, clearCart } = useStore()
  
  const [step, setStep] = useState<CheckoutStep>('delivery-method')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [pixData, setPixData] = useState<any>(null)

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(item => item.product)

  const cartTotal = getCartTotal()

  // Redirecionar se carrinho vazio
  useEffect(() => {
    if (cart.length === 0 && step !== 'order-status') {
      router.push('/')
    }
  }, [cart, step, router])

  const handleDeliveryMethodSelect = (method: DeliveryMethod) => {
    setDeliveryMethod(method)
    if (method === 'pickup') {
      setStep('payment-method')
    } else {
      setStep('delivery-address')
    }
  }

  const handleAddressContinue = () => {
    setStep('payment-method')
  }

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    setPaymentMethod(method)

    // Criar pedido
    const orderData = {
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price,
        image: item.product.image
      })),
      total: cartTotal,
      deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
      paymentMethod: method
    }

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()
      
      if (data.success) {
        setCurrentOrder(data.order)

        if (method === 'pix') {
          // Criar pagamento PIX
          const pixResponse = await fetch('/api/payments/pix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.order.id,
              amount: cartTotal,
              description: `Pedido ${data.order.id}`
            })
          })

          const pixData = await pixResponse.json()
          
          if (pixData.success) {
            setPixData(pixData)
            setStep('payment-process')
          }
        } else if (method === 'card') {
          setStep('payment-process')
        } else if (method === 'cash') {
          // Pagamento em dinheiro - ir direto para status
          clearCart()
          setStep('order-status')
        }
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      alert('Erro ao processar pedido. Tente novamente.')
    }
  }

  const handleCardPayment = async (cardData: any) => {
    if (!currentOrder) return

    try {
      const response = await fetch('/api/payments/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: currentOrder.id,
          amount: cartTotal,
          cardData
        })
      })

      const data = await response.json()
      
      if (data.success && data.status === 'approved') {
        // Atualizar status do pedido
        await fetch(`/api/orders/${currentOrder.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'payment_received' })
        })

        setCurrentOrder({ ...currentOrder, status: 'payment_received' })
        clearCart()
        setStep('order-status')
      } else {
        alert('Pagamento recusado. Verifique os dados do cartão.')
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      throw error
    }
  }

  const handlePixPaymentConfirmed = async () => {
    if (!currentOrder) return

    // Atualizar status do pedido
    await fetch(`/api/orders/${currentOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'payment_received' })
    })

    setCurrentOrder({ ...currentOrder, status: 'payment_received' })
    clearCart()
    setStep('order-status')
  }

  const handleBack = () => {
    if (step === 'delivery-address') {
      setStep('delivery-method')
    } else if (step === 'payment-method') {
      if (deliveryMethod === 'delivery') {
        setStep('delivery-address')
      } else {
        setStep('delivery-method')
      }
    } else if (step === 'payment-process') {
      setStep('payment-method')
    }
  }

  if (cart.length === 0 && step !== 'order-status') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {step !== 'order-status' && (
              <button
                onClick={step === 'delivery-method' ? () => router.push('/') : handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h1 className="text-xl font-bold" style={{ color: config.primaryColor }}>
              {step === 'order-status' ? 'Status do Pedido' : 'Finalizar Pedido'}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {step === 'delivery-method' && (
            <DeliveryMethodStep
              selectedMethod={deliveryMethod}
              onSelectMethod={handleDeliveryMethodSelect}
              primaryColor={config.primaryColor}
            />
          )}

          {step === 'delivery-address' && (
            <DeliveryAddressStep
              address={deliveryAddress}
              onAddressChange={setDeliveryAddress}
              onContinue={handleAddressContinue}
              primaryColor={config.primaryColor}
            />
          )}

          {step === 'payment-method' && (
            <>
              <PaymentMethodStep
                selectedMethod={paymentMethod}
                onSelectMethod={handlePaymentMethodSelect}
                primaryColor={config.primaryColor}
              />

              {/* Resumo do Pedido */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Resumo do Pedido</h3>
                <div className="space-y-3">
                  {cartItems.map(({ productId, quantity, product }) => {
                    const finalPrice = product.discount
                      ? product.price * (1 - product.discount / 100)
                      : product.price

                    return (
                      <div key={productId} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {quantity}x {product.name}
                        </span>
                        <span className="font-semibold text-gray-900">
                          R$ {(finalPrice * quantity).toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <span className="font-bold text-lg text-gray-900">Total</span>
                    <span 
                      className="font-bold text-2xl"
                      style={{ color: config.primaryColor }}
                    >
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'payment-process' && paymentMethod === 'pix' && pixData && (
            <PixPaymentStep
              orderId={currentOrder!.id}
              qrCode={pixData.qrCode}
              qrCodeBase64={pixData.qrCodeBase64}
              copyPaste={pixData.copyPaste}
              onPaymentConfirmed={handlePixPaymentConfirmed}
              primaryColor={config.primaryColor}
            />
          )}

          {step === 'payment-process' && paymentMethod === 'card' && (
            <CardPaymentStep
              onPaymentSubmit={handleCardPayment}
              primaryColor={config.primaryColor}
            />
          )}

          {step === 'order-status' && currentOrder && (
            <OrderStatusStep
              order={currentOrder}
              primaryColor={config.primaryColor}
            />
          )}
        </div>

        {/* Botão voltar ao início (apenas na tela de status) */}
        {step === 'order-status' && (
          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: config.primaryColor }}
          >
            Voltar ao Início
          </button>
        )}
      </main>
    </div>
  )
}
