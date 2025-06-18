import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
    const { userId } = params

    try {
        const orders = await prisma.order.findMany({
            where: { customerId: userId },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(orders)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '取得訂單資料失敗' }, { status: 500 })
    }
}
