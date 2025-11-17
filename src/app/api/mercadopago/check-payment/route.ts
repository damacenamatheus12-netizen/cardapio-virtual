import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: "Payment ID não fornecido"
      }, { status: 400 })
    }

    // Verificar se o token do Mercado Pago está configurado
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: "Mercado Pago não configurado"
      }, { status: 400 })
    }

    // Consultar status do pagamento no Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: "Erro ao consultar pagamento"
      }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      status: data.status,
      statusDetail: data.status_detail
    })
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error)
    return NextResponse.json({
      success: false,
      error: "Erro interno ao verificar pagamento"
    }, { status: 500 })
  }
}
