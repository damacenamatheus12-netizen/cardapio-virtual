import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, description } = body

    // Verificar se as credenciais do Mercado Pago estão configuradas
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      // Modo de demonstração - gerar QR Code simulado
      const pixCode = `00020126580014br.gov.bcb.pix0136${orderId}520400005303986540${amount.toFixed(2)}5802BR5925NOME DO ESTABELECIMENTO6009SAO PAULO62070503***6304`
      
      const qrCodeBase64 = await QRCode.toDataURL(pixCode, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      return NextResponse.json({
        success: true,
        paymentId: `DEMO-${orderId}`,
        qrCode: pixCode,
        qrCodeBase64,
        copyPaste: pixCode,
        status: 'pending'
      })
    }

    // Integração real com Mercado Pago
    const paymentData = {
      transaction_amount: amount,
      description: description || 'Pedido',
      payment_method_id: 'pix',
      payer: {
        email: 'customer@email.com'
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
      throw new Error(payment.message || 'Erro ao criar pagamento')
    }

    const qrCode = payment.point_of_interaction?.transaction_data?.qr_code
    const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      qrCode,
      qrCodeBase64: qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null,
      copyPaste: qrCode,
      status: payment.status
    })
  } catch (error: any) {
    console.error('Erro ao criar pagamento PIX:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar pagamento PIX' },
      { status: 500 }
    )
  }
}
