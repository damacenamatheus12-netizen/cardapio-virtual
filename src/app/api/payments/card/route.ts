import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, cardData } = body

    // Verificar se as credenciais do Mercado Pago estão configuradas
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      // Modo de demonstração - simular aprovação
      return NextResponse.json({
        success: true,
        paymentId: `DEMO-CARD-${orderId}`,
        status: 'approved',
        statusDetail: 'accredited'
      })
    }

    // Integração real com Mercado Pago
    const paymentData = {
      transaction_amount: amount,
      token: cardData.token, // Token gerado pelo Mercado Pago SDK no frontend
      description: 'Pedido',
      installments: 1, // Pagamento à vista
      payment_method_id: cardData.paymentMethodId,
      payer: {
        email: cardData.email || 'customer@email.com'
      }
    }

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(paymentData)
    })

    const payment = await response.json()

    if (!response.ok) {
      throw new Error(payment.message || 'Erro ao processar pagamento')
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail
    })
  } catch (error: any) {
    console.error('Erro ao processar pagamento com cartão:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}
