import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
    const { orderId } = await params

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        })

        if (!order) {
            return NextResponse.json({ error: '找不到訂單' }, { status: 404 })
        }

        return NextResponse.json(order, { status: 200 })
    } catch (error) {
        console.error('[ORDER_GET]', error)
        return NextResponse.json({ error: '取得通知失敗' }, { status: 500 })
    }
}
