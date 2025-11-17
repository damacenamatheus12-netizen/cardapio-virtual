import { NextRequest, NextResponse } from 'next/server'
import { Order } from '@/lib/types'

// Simulação de banco de dados em memória (em produção, use um banco real)
const orders = new Map<string, Order>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items: body.items,
      total: body.total,
      deliveryMethod: body.deliveryMethod,
      deliveryAddress: body.deliveryAddress,
      paymentMethod: body.paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Salvar pedido
    orders.set(order.id, order)

    // Se for pagamento em dinheiro, já marcar como confirmado
    if (body.paymentMethod === 'cash') {
      order.status = 'payment_received'
      orders.set(order.id, order)
    }

    return NextResponse.json({ 
      success: true, 
      order 
    })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    orders: Array.from(orders.values()) 
  })
}
