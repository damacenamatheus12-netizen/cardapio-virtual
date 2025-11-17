"use client"

import { Truck, Store } from "lucide-react"
import { DeliveryMethod } from "@/lib/types"

interface DeliveryMethodStepProps {
  selectedMethod: DeliveryMethod | null
  onSelectMethod: (method: DeliveryMethod) => void
  primaryColor: string
}

export function DeliveryMethodStep({ 
  selectedMethod, 
  onSelectMethod,
  primaryColor 
}: DeliveryMethodStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Como você quer receber seu pedido?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Entrega */}
        <button
          onClick={() => onSelectMethod('delivery')}
          className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
            selectedMethod === 'delivery'
              ? 'border-current shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          style={selectedMethod === 'delivery' ? { borderColor: primaryColor } : {}}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div 
              className="p-4 rounded-full"
              style={{ backgroundColor: selectedMethod === 'delivery' ? primaryColor : '#f3f4f6' }}
            >
              <Truck 
                className="w-8 h-8"
                style={{ color: selectedMethod === 'delivery' ? 'white' : '#6b7280' }}
              />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Entrega no endereço</h3>
              <p className="text-sm text-gray-600">
                Receba seu pedido onde você estiver
              </p>
            </div>
          </div>
        </button>

        {/* Retirada */}
        <button
          onClick={() => onSelectMethod('pickup')}
          className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
            selectedMethod === 'pickup'
              ? 'border-current shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          style={selectedMethod === 'pickup' ? { borderColor: primaryColor } : {}}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div 
              className="p-4 rounded-full"
              style={{ backgroundColor: selectedMethod === 'pickup' ? primaryColor : '#f3f4f6' }}
            >
              <Store 
                className="w-8 h-8"
                style={{ color: selectedMethod === 'pickup' ? 'white' : '#6b7280' }}
              />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Retirar no local</h3>
              <p className="text-sm text-gray-600">
                Busque seu pedido pessoalmente
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
