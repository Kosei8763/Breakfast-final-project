import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const StatusSchema = z.object({
    status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
})

export async function PATCH(request, { params }) {
    const { orderId } = await params
    const body = await request.json()

    // 驗證 status 是否為合法 enum 值
    const result = StatusSchema.safeParse(body)
    if (!result.success) {
        return NextResponse.json({ error: '無效的訂單狀態' }, { status: 400 })
    }

    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: result.data.status,
                updatedAt: new Date(),
                completedAt: result.data.status === 'COMPLETED' ? new Date() : null,
            },
        })

        return NextResponse.json(order, { status: 200 })
    } catch (error) {
        console.error('[ORDER_STATUS_UPDATE]', error)
        return NextResponse.json({ error: '訂單狀態更新失敗' }, { status: 500 })
    }
}
