import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
    const orders = await prisma.order.findMany({
        where: {
            status: 'READY', // 只查詢狀態為 READY 的訂單
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            items: {
                include: {
                    menuItem: true, // ✅ 這行是重點，否則 menuItem 會是 undefined
                },
            },
            customer: true, // 建議也一併帶入顧客資訊（如有需要）
        },
    })

    return NextResponse.json(orders)
}
