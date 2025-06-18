import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
    try {
        const body = await req.json()
        const { customerId, orderItems } = body

        if (!customerId || !Array.isArray(orderItems) || orderItems.length === 0) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
        }

        // 查詢 menuItem 價格
        const menuItemIds = orderItems.map((item) => item.menuItemId)
        const menuItems = await prisma.menuItem.findMany({
            where: { id: { in: menuItemIds } },
        })

        const itemsWithPrice = orderItems.map((item) => {
            const menuItem = menuItems.find((m) => m.id === item.menuItemId)
            if (!menuItem) throw new Error(`MenuItem not found: ${item.menuItemId}`)
            return {
                ...item,
                price: menuItem.price,
                total: menuItem.price * item.quantity,
            }
        })

        const totalAmount = itemsWithPrice.reduce((sum, item) => sum + item.total, 0)

        // 建立 order + items
        const order = await prisma.order.create({
            data: {
                customerId,
                totalAmount,
                status: 'PENDING',
                items: {
                    create: orderItems.map((item) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        specialRequest: item.specialRequest || '',
                    })),
                },
            },
            include: {
                customer: {
                    select: { name: true },
                },
                items: {
                    include: {
                        menuItem: {
                            select: { name: true, price: true },
                        },
                    },
                },
            },
        })

        // 回傳格式
        return NextResponse.json({
            id: order.id,
            customerId: order.customerId,
            totalAmount: order.totalAmount,
            customer: {
                name: order.customer.name,
            },
            items: order.items.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                specialRequest: item.specialRequest,
                menuItem: {
                    name: item.menuItem.name,
                    price: item.menuItem.price,
                },
            })),
            status: order.status,
            createdAt: order.createdAt,
        })
    } catch (error) {
        console.error('Order creation failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
