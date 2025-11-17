"use client"

import { useState, useEffect } from "react"
import { Copy, CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

interface PixPaymentStepProps {
  orderId: string
  qrCode: string
  qrCodeBase64: string
  copyPaste: string
  onPaymentConfirmed: () => void
  primaryColor: string
}

export function PixPaymentStep({ 
  orderId,
  qrCode,
  qrCodeBase64,
  copyPaste,
  onPaymentConfirmed,
  primaryColor 
}: PixPaymentStepProps) {
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Verificar status do pagamento a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      setChecking(true)
      try {
        const response = await fetch(`/api/orders/${orderId}/status`)
        const data = await response.json()
        
        if (data.status === 'payment_received' || data.status === 'approved') {
          onPaymentConfirmed()
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error)
      } finally {
        setChecking(false)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [orderId, onPaymentConfirmed])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pague com PIX
        </h2>
        <p className="text-gray-600">
          Escaneie o QR Code ou copie o código abaixo
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          {qrCodeBase64 ? (
            <img 
              src={qrCodeBase64}
              alt="QR Code PIX"
              className="w-64 h-64"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Código Copia e Cola */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Código PIX Copia e Cola
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={copyPaste}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
          />
          <button
            onClick={handleCopy}
            className="px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            style={{ backgroundColor: copied ? '#10b981' : primaryColor, color: 'white' }}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status */}
      <div 
        className="p-4 rounded-lg flex items-center gap-3"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <Loader2 
          className="w-5 h-5 animate-spin"
          style={{ color: primaryColor }}
        />
        <div className="flex-1">
          <p className="font-semibold" style={{ color: primaryColor }}>
            Aguardando pagamento...
          </p>
          <p className="text-sm text-gray-600">
            Confirmaremos automaticamente quando o pagamento for detectado
          </p>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <h3 className="font-semibold text-gray-900">Como pagar:</h3>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Escolha pagar com PIX</li>
          <li>Escaneie o QR Code ou cole o código</li>
          <li>Confirme o pagamento</li>
        </ol>
      </div>
    </div>
  )
}
