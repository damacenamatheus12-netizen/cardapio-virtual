"use client"

import { useState } from "react"
import { CreditCard, Banknote, QrCode, ArrowLeft, Copy, Check } from "lucide-react"
import type { PaymentMethod } from "@/lib/types"

interface PaymentMethodStepProps {
  orderId: string
  total: number
  onBack: () => void
  onPaymentComplete: (method: PaymentMethod, paymentId?: string) => void
  primaryColor: string
}

export function PaymentMethodStep({ 
  orderId, 
  total, 
  onBack, 
  onPaymentComplete, 
  primaryColor 
}: PaymentMethodStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null)
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  })
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  const handlePixPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/mercadopago/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount: total })
      })

      const data = await response.json()

      if (data.success) {
        setPixData({
          qrCode: data.qrCode,
          qrCodeBase64: data.qrCodeBase64
        })
        
        // Iniciar polling para verificar pagamento
        startPaymentPolling(data.paymentId)
      } else {
        alert("Erro ao gerar PIX: " + data.error)
      }
    } catch (error) {
      alert("Erro ao processar pagamento PIX")
    } finally {
      setLoading(false)
    }
  }

  const handleCardPayment = async () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      alert("Preencha todos os dados do cartão")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/mercadopago/create-card-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: total,
          cardData
        })
      })

      const data = await response.json()

      if (data.success) {
        onPaymentComplete("card", data.paymentId)
      } else {
        alert("Erro ao processar pagamento: " + data.error)
      }
    } catch (error) {
      alert("Erro ao processar pagamento com cartão")
    } finally {
      setLoading(false)
    }
  }

  const handleCashPayment = () => {
    onPaymentComplete("cash")
  }

  const startPaymentPolling = (paymentId: string) => {
    setProcessingPayment(true)
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/mercadopago/check-payment?paymentId=${paymentId}`)
        const data = await response.json()

        if (data.status === "approved") {
          clearInterval(interval)
          onPaymentComplete("pix", paymentId)
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error)
      }
    }, 3000) // Verifica a cada 3 segundos

    // Para o polling após 10 minutos
    setTimeout(() => clearInterval(interval), 600000)
  }

  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Forma de pagamento</h2>
          <p className="text-gray-600">Escolha como deseja pagar</p>
        </div>
      </div>

      {/* Payment Method Selection */}
      {!selectedMethod && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedMethod("pix")}
            className="p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg"
          >
            <QrCode className="w-12 h-12 mb-3 mx-auto text-gray-400" />
            <h3 className="font-bold text-lg mb-1">PIX</h3>
            <p className="text-sm text-gray-600">Pagamento instantâneo</p>
          </button>

          <button
            onClick={() => setSelectedMethod("card")}
            className="p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg"
          >
            <CreditCard className="w-12 h-12 mb-3 mx-auto text-gray-400" />
            <h3 className="font-bold text-lg mb-1">Cartão</h3>
            <p className="text-sm text-gray-600">À vista</p>
          </button>

          <button
            onClick={() => setSelectedMethod("cash")}
            className="p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg"
          >
            <Banknote className="w-12 h-12 mb-3 mx-auto text-gray-400" />
            <h3 className="font-bold text-lg mb-1">Dinheiro</h3>
            <p className="text-sm text-gray-600">Na entrega/retirada</p>
          </button>
        </div>
      )}

      {/* PIX Payment */}
      {selectedMethod === "pix" && !pixData && (
        <div className="bg-gray-50 p-6 rounded-2xl text-center">
          <QrCode className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor }} />
          <h3 className="font-bold text-xl mb-2">Pagamento via PIX</h3>
          <p className="text-gray-600 mb-4">
            Valor total: <span className="font-bold text-2xl" style={{ color: primaryColor }}>
              R$ {total.toFixed(2)}
            </span>
          </p>
          <button
            onClick={handlePixPayment}
            disabled={loading}
            className="w-full py-4 rounded-full text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? "Gerando QR Code..." : "Gerar QR Code PIX"}
          </button>
        </div>
      )}

      {/* PIX QR Code Display */}
      {selectedMethod === "pix" && pixData && (
        <div className="bg-gray-50 p-6 rounded-2xl">
          <div className="text-center mb-6">
            <h3 className="font-bold text-xl mb-2">Escaneie o QR Code</h3>
            <p className="text-gray-600">Use o app do seu banco para pagar</p>
          </div>

          {/* QR Code */}
          <div className="bg-white p-6 rounded-xl mb-6 flex justify-center">
            <img 
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-64 h-64"
            />
          </div>

          {/* PIX Copy and Paste */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 text-center">
              Ou copie o código PIX:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pixData.qrCode}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={copyPixCode}
                className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          {processingPayment && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-current mb-2" style={{ borderTopColor: primaryColor }} />
              <p className="text-sm text-gray-600">Aguardando confirmação do pagamento...</p>
            </div>
          )}
        </div>
      )}

      {/* Card Payment */}
      {selectedMethod === "card" && (
        <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
            <h3 className="font-bold text-lg">Dados do cartão</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número do cartão
            </label>
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": primaryColor } as any}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome no cartão
            </label>
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              placeholder="Nome como está no cartão"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": primaryColor } as any}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validade
              </label>
              <input
                type="text"
                value={cardData.expiry}
                onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                placeholder="MM/AA"
                maxLength={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cardData.cvv}
                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
            </div>
          </div>

          <div className="pt-4">
            <p className="text-gray-600 mb-4 text-center">
              Valor total: <span className="font-bold text-2xl" style={{ color: primaryColor }}>
                R$ {total.toFixed(2)}
              </span>
            </p>
            <button
              onClick={handleCardPayment}
              disabled={loading}
              className="w-full py-4 rounded-full text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? "Processando..." : "Pagar com Cartão"}
            </button>
          </div>
        </div>
      )}

      {/* Cash Payment */}
      {selectedMethod === "cash" && (
        <div className="bg-gray-50 p-6 rounded-2xl text-center">
          <Banknote className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor }} />
          <h3 className="font-bold text-xl mb-2">Pagamento em Dinheiro</h3>
          <p className="text-gray-600 mb-4">
            Você pagará na entrega ou retirada do pedido
          </p>
          <p className="text-gray-600 mb-6">
            Valor total: <span className="font-bold text-2xl" style={{ color: primaryColor }}>
              R$ {total.toFixed(2)}
            </span>
          </p>
          <button
            onClick={handleCashPayment}
            className="w-full py-4 rounded-full text-white font-bold text-lg hover:opacity-90 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            Confirmar Pedido
          </button>
        </div>
      )}
    </div>
  )
}
