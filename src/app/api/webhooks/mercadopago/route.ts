import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar se é uma notificação de pagamento
    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      // Buscar detalhes do pagamento no Mercado Pago
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
      
      if (!accessToken) {
        return NextResponse.json({ success: true })
      }

      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      const payment = await response.json()

      // Atualizar status do pedido baseado no status do pagamento
      if (payment.status === 'approved') {
        // Aqui você atualizaria o status do pedido no banco de dados
        console.log('Pagamento aprovado:', paymentId)
        
        // Buscar o pedido associado e atualizar status
        // const order = await getOrderByPaymentId(paymentId)
        // await updateOrderStatus(order.id, 'payment_received')
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
