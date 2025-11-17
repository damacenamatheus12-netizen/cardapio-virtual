import { NextRequest, NextResponse } from 'next/server'

// Simulação de banco de dados em memória
const orders = new Map()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const order = orders.get(orderId)

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      status: order.status,
      order 
    })
  } catch (error) {
    console.error('Erro ao buscar status:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar status' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const body = await request.json()
    const order = orders.get(orderId)

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    order.status = body.status
    order.updatedAt = new Date().toISOString()
    orders.set(orderId, order)

    return NextResponse.json({ 
      success: true, 
      order 
    })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar status' },
      { status: 500 }
    )
  }
}
