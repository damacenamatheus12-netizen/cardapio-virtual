"use client"

import { useState } from "react"
import { Truck, Store, MapPin, ArrowRight } from "lucide-react"
import type { DeliveryMethod, DeliveryAddress } from "@/lib/types"

interface DeliveryMethodStepProps {
  onNext: (method: DeliveryMethod, address?: DeliveryAddress) => void
  primaryColor: string
}

export function DeliveryMethodStep({ onNext, primaryColor }: DeliveryMethodStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod | null>(null)
  const [address, setAddress] = useState<DeliveryAddress>({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateAddress = () => {
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

  const handleNext = () => {
    if (!selectedMethod) return

    if (selectedMethod === "delivery") {
      if (validateAddress()) {
        onNext(selectedMethod, address)
      }
    } else {
      onNext(selectedMethod)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Como você quer receber?</h2>
        <p className="text-gray-600">Escolha a forma de recebimento do seu pedido</p>
      </div>

      {/* Delivery Method Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedMethod("delivery")}
          className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
            selectedMethod === "delivery"
              ? "border-current shadow-lg"
              : "border-gray-200 hover:border-gray-300"
          }`}
          style={selectedMethod === "delivery" ? { borderColor: primaryColor } : {}}
        >
          <Truck 
            className="w-12 h-12 mb-3 mx-auto" 
            style={selectedMethod === "delivery" ? { color: primaryColor } : { color: "#9CA3AF" }}
          />
          <h3 className="font-bold text-lg mb-1">Entrega no endereço</h3>
          <p className="text-sm text-gray-600">Receba em casa ou no trabalho</p>
        </button>

        <button
          onClick={() => setSelectedMethod("pickup")}
          className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
            selectedMethod === "pickup"
              ? "border-current shadow-lg"
              : "border-gray-200 hover:border-gray-300"
          }`}
          style={selectedMethod === "pickup" ? { borderColor: primaryColor } : {}}
        >
          <Store 
            className="w-12 h-12 mb-3 mx-auto" 
            style={selectedMethod === "pickup" ? { color: primaryColor } : { color: "#9CA3AF" }}
          />
          <h3 className="font-bold text-lg mb-1">Retirar no local</h3>
          <p className="text-sm text-gray-600">Busque pessoalmente</p>
        </button>
      </div>

      {/* Delivery Address Form */}
      {selectedMethod === "delivery" && (
        <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
            <h3 className="font-bold text-lg">Endereço de entrega</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP *
              </label>
              <input
                type="text"
                value={address.zipCode}
                onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                placeholder="00000-000"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.zipCode ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2`}
                style={{ "--tw-ring-color": primaryColor } as any}
              />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rua *
              </label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="Nome da rua"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.street ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2`}
                style={{ "--tw-ring-color": primaryColor } as any}
              />
              {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número *
              </label>
              <input
                type="text"
                value={address.number}
                onChange={(e) => setAddress({ ...address, number: e.target.value })}
                placeholder="123"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.number ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2`}
                style={{ "--tw-ring-color": primaryColor } as any}
              />
              {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={address.complement}
                onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                placeholder="Apto, bloco, etc"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro *
              </label>
              <input
                type="text"
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                placeholder="Nome do bairro"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.neighborhood ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2`}
                style={{ "--tw-ring-color": primaryColor } as any}
              />
              {errors.neighborhood && <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="Nome da cidade"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.city ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2`}
                style={{ "--tw-ring-color": primaryColor } as any}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="UF"
                maxLength={2}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.state ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2`}
                style={{ "--tw-ring-color": primaryColor } as any}
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!selectedMethod}
        className="w-full py-4 rounded-full text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: primaryColor }}
      >
        Continuar
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )
}
