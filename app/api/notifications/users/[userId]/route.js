import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
    const { userId } = await params

    try {
        const notification = await prisma.notification.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(notification)
    } catch (error) {
        return NextResponse.error(new Error('取得通知失敗'), { status: 500 })
    }
}

export async function POST(request, { params }) {
    const { userId } = await params
    const { orderId, message } = await request.json()

    if (!orderId || !message) {
        return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                orderId,
                message,
            },
        })

        return NextResponse.json(notification)
    } catch (error) {
        console.error('[CREATE_NOTIFICATION]', error)
        return NextResponse.json({ error: '建立通知失敗' }, { status: 500 })
    }
}
