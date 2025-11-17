import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount } = await request.json()

    // Verificar se o token do Mercado Pago está configurado
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: "Mercado Pago não configurado. Configure o Access Token nas variáveis de ambiente."
      }, { status: 400 })
    }

    // Criar pagamento PIX no Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: `Pedido #${orderId}`,
        payment_method_id: "pix",
        payer: {
          email: "cliente@email.com"
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.message || "Erro ao criar pagamento PIX"
      }, { status: response.status })
    }

    // Extrair dados do QR Code
    const qrCode = data.point_of_interaction?.transaction_data?.qr_code
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64

    if (!qrCode || !qrCodeBase64) {
      return NextResponse.json({
        success: false,
        error: "Erro ao gerar QR Code PIX"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paymentId: data.id,
      qrCode,
      qrCodeBase64
    })
  } catch (error) {
    console.error("Erro ao criar pagamento PIX:", error)
    return NextResponse.json({
      success: false,
      error: "Erro interno ao processar pagamento"
    }, { status: 500 })
  }
}
