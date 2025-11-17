"use client"

import { CreditCard, Smartphone, Banknote } from "lucide-react"
import { PaymentMethod } from "@/lib/types"

interface PaymentMethodStepProps {
  selectedMethod: PaymentMethod | null
  onSelectMethod: (method: PaymentMethod) => void
  primaryColor: string
}

export function PaymentMethodStep({ 
  selectedMethod, 
  onSelectMethod,
  primaryColor 
}: PaymentMethodStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Como você quer pagar?
      </h2>

      <div className="space-y-3">
        {/* PIX */}
        <button
          onClick={() => onSelectMethod('pix')}
          className={`w-full p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
            selectedMethod === 'pix'
              ? 'border-current shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          style={selectedMethod === 'pix' ? { borderColor: primaryColor } : {}}
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: selectedMethod === 'pix' ? primaryColor : '#f3f4f6' }}
            >
              <Smartphone 
                className="w-6 h-6"
                style={{ color: selectedMethod === 'pix' ? 'white' : '#6b7280' }}
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-lg">PIX</h3>
              <p className="text-sm text-gray-600">
                Pagamento instantâneo via QR Code
              </p>
            </div>
          </div>
        </button>

        {/* Cartão */}
        <button
          onClick={() => onSelectMethod('card')}
          className={`w-full p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
            selectedMethod === 'card'
              ? 'border-current shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          style={selectedMethod === 'card' ? { borderColor: primaryColor } : {}}
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: selectedMethod === 'card' ? primaryColor : '#f3f4f6' }}
            >
              <CreditCard 
                className="w-6 h-6"
                style={{ color: selectedMethod === 'card' ? 'white' : '#6b7280' }}
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-lg">Cartão de Crédito/Débito</h3>
              <p className="text-sm text-gray-600">
                Pagamento à vista no cartão
              </p>
            </div>
          </div>
        </button>

        {/* Dinheiro */}
        <button
          onClick={() => onSelectMethod('cash')}
          className={`w-full p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
            selectedMethod === 'cash'
              ? 'border-current shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          style={selectedMethod === 'cash' ? { borderColor: primaryColor } : {}}
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: selectedMethod === 'cash' ? primaryColor : '#f3f4f6' }}
            >
              <Banknote 
                className="w-6 h-6"
                style={{ color: selectedMethod === 'cash' ? 'white' : '#6b7280' }}
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-lg">Dinheiro</h3>
              <p className="text-sm text-gray-600">
                Pagar na entrega ou retirada
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
