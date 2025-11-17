import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Webhook do Mercado Pago para notificações de pagamento
    // Quando um pagamento é confirmado, o Mercado Pago envia uma notificação aqui

    console.log("Webhook recebido do Mercado Pago:", body)

    // Verificar tipo de notificação
    if (body.type === "payment") {
      const paymentId = body.data?.id

      if (paymentId) {
        // Aqui você pode atualizar o status do pedido no banco de dados
        // Por enquanto, apenas logamos
        console.log(`Pagamento ${paymentId} atualizado`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao processar webhook"
    }, { status: 500 })
  }
}
