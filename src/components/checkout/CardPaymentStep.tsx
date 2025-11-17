"use client"

import { useState } from "react"
import { CreditCard, Lock } from "lucide-react"

interface CardPaymentStepProps {
  onPaymentSubmit: (cardData: any) => Promise<void>
  primaryColor: string
}

export function CardPaymentStep({ 
  onPaymentSubmit,
  primaryColor 
}: CardPaymentStepProps) {
  const [loading, setLoading] = useState(false)
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .slice(0, 19)
  }

  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(?=\d)/, '$1/')
      .slice(0, 5)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!cardData.number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.number = "Número do cartão inválido"
    }
    if (!cardData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }
    if (!cardData.expiry.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiry = "Data inválida (MM/AA)"
    }
    if (!cardData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = "CVV inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onPaymentSubmit({
        cardNumber: cardData.number.replace(/\s/g, ''),
        cardholderName: cardData.name,
        expirationMonth: cardData.expiry.split('/')[0],
        expirationYear: '20' + cardData.expiry.split('/')[1],
        securityCode: cardData.cvv
      })
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <div 
          className="inline-flex p-4 rounded-full mb-4"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <CreditCard 
            className="w-8 h-8"
            style={{ color: primaryColor }}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pagamento com Cartão
        </h2>
        <p className="text-gray-600">
          Pagamento à vista no cartão de crédito ou débito
        </p>
      </div>

      <div className="space-y-4">
        {/* Número do Cartão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número do Cartão *
          </label>
          <input
            type="text"
            value={cardData.number}
            onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
            placeholder="0000 0000 0000 0000"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.number ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': primaryColor } as any}
          />
          {errors.number && (
            <p className="text-red-500 text-sm mt-1">{errors.number}</p>
          )}
        </div>

        {/* Nome no Cartão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome no Cartão *
          </label>
          <input
            type="text"
            value={cardData.name}
            onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': primaryColor } as any}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Validade e CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validade *
            </label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
              placeholder="MM/AA"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.expiry ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': primaryColor } as any}
            />
            {errors.expiry && (
              <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV *
            </label>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="123"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.cvv ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': primaryColor } as any}
            />
            {errors.cvv && (
              <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Lock className="w-4 h-4" />
        <span>Seus dados estão protegidos e criptografados</span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-colors disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? 'Processando...' : 'Confirmar Pagamento'}
      </button>
    </form>
  )
}
