import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
    let menuItems = await prisma.menuItem.findMany({
        orderBy: { name: 'asc' },
    })

    return NextResponse.json(menuItems)
}

export async function POST(request) {
    const body = await request.json()
    const { name, price, description, imageUrl } = body

    if (!name || typeof price !== 'number') {
        return NextResponse.json({ error: 'Name and valid price are required' }, { status: 400 })
    }

    const newMenuItem = await prisma.menuItem.create({
        data: {
            name,
            price,
            description,
            imageUrl,
        },
    })

    return NextResponse.json(newMenuItem, { status: 201 })
}
