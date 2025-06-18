import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(request, { params }) {
    const { userId } = await params

    try {
        await prisma.notification.updateMany({
            where: {
                userId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        })

        return NextResponse.json({ message: '已標記為已讀' })
    } catch (error) {
        console.error('標記通知為已讀時出錯：', error)
        return NextResponse.json({ error: '無法更新通知為已讀' }, { status: 500 })
    }
}
