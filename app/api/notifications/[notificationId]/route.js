import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(request, { params }) {
    const { notificationId } = await params

    try {
        const notification = await prisma.notification.delete({
            where: { id: notificationId },
        })

        return NextResponse.json(notification)
    } catch (error) {
        return NextResponse.error(new Error('刪除通知失敗'), { status: 500 })
    }
}
