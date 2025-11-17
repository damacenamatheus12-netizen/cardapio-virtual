import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, cardData } = await request.json()

    // Verificar se o token do Mercado Pago está configurado
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: "Mercado Pago não configurado. Configure o Access Token nas variáveis de ambiente."
      }, { status: 400 })
    }

    // Criar pagamento com cartão no Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: `Pedido #${orderId}`,
        payment_method_id: "credit_card",
        installments: 1, // Apenas à vista
        payer: {
          email: "cliente@email.com"
        },
        token: cardData.token || "card_token_placeholder" // Em produção, use o SDK do MP para tokenizar
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.message || "Erro ao processar pagamento com cartão"
      }, { status: response.status })
    }

    // Verificar se o pagamento foi aprovado
    if (data.status === "approved") {
      return NextResponse.json({
        success: true,
        paymentId: data.id,
        status: data.status
      })
    } else {
      return NextResponse.json({
        success: false,
        error: "Pagamento não aprovado. Verifique os dados do cartão."
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro ao processar pagamento com cartão:", error)
    return NextResponse.json({
      success: false,
      error: "Erro interno ao processar pagamento"
    }, { status: 500 })
  }
}
