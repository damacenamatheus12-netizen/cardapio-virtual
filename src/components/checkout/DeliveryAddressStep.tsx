"use client"

import { useState } from "react"
import { DeliveryAddress } from "@/lib/types"
import { MapPin } from "lucide-react"

interface DeliveryAddressStepProps {
  address: DeliveryAddress
  onAddressChange: (address: DeliveryAddress) => void
  onContinue: () => void
  primaryColor: string
}

export function DeliveryAddressStep({ 
  address, 
  onAddressChange, 
  onContinue,
  primaryColor 
}: DeliveryAddressStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!address.street.trim()) newErrors.street = "Rua é obrigatória"
    if (!address.number.trim()) newErrors.number = "Número é obrigatório"
    if (!address.neighborhood.trim()) newErrors.neighborhood = "Bairro é obrigatório"
    if (!address.city.trim()) newErrors.city = "Cidade é obrigatória"
    if (!address.state.trim()) newErrors.state = "Estado é obrigatório"
    if (!address.zipCode.trim()) newErrors.zipCode = "CEP é obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onContinue()
    }
  }

  const handleZipCodeChange = (value: string) => {
    // Formatar CEP automaticamente
    const formatted = value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
    onAddressChange({ ...address, zipCode: formatted })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-3 rounded-full"
          style={{ backgroundColor: primaryColor }}
        >
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Endereço de entrega
        </h2>
      </div>

      <div className="space-y-4">
        {/* CEP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP *
          </label>
          <input
            type="text"
            value={address.zipCode}
            onChange={(e) => handleZipCodeChange(e.target.value)}
            placeholder="00000-000"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.zipCode ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': primaryColor } as any}
          />
          {errors.zipCode && (
            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
          )}
        </div>

        {/* Rua */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rua *
          </label>
          <input
            type="text"
            value={address.street}
            onChange={(e) => onAddressChange({ ...address, street: e.target.value })}
            placeholder="Nome da rua"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.street ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': primaryColor } as any}
          />
          {errors.street && (
            <p className="text-red-500 text-sm mt-1">{errors.street}</p>
          )}
        </div>

        {/* Número e Complemento */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número *
            </label>
            <input
              type="text"
              value={address.number}
              onChange={(e) => onAddressChange({ ...address, number: e.target.value })}
              placeholder="123"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.number ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': primaryColor } as any}
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              value={address.complement || ''}
              onChange={(e) => onAddressChange({ ...address, complement: e.target.value })}
              placeholder="Apto, bloco..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor } as any}
            />
          </div>
        </div>

        {/* Bairro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro *
          </label>
          <input
            type="text"
            value={address.neighborhood}
            onChange={(e) => onAddressChange({ ...address, neighborhood: e.target.value })}
            placeholder="Nome do bairro"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.neighborhood ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': primaryColor } as any}
          />
          {errors.neighborhood && (
            <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>
          )}
        </div>

        {/* Cidade e Estado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => onAddressChange({ ...address, city: e.target.value })}
              placeholder="Nome da cidade"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': primaryColor } as any}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <input
              type="text"
              value={address.state}
              onChange={(e) => onAddressChange({ ...address, state: e.target.value.toUpperCase().slice(0, 2) })}
              placeholder="UF"
              maxLength={2}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': primaryColor } as any}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-colors mt-6"
        style={{ backgroundColor: primaryColor }}
      >
        Continuar para pagamento
      </button>
    </form>
  )
}
