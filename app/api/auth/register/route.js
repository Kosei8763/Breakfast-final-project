import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req) {
    try {
        const body = await req.json()
        const { name, email, password } = body

        if (!name || !email || !password) {
            return NextResponse.json({ message: '所有欄位皆為必填' }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })

        if (existingUser) {
            return NextResponse.json({ message: '電子信箱已註冊' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CUSTOMER', // 預設角色為顧客
            },
        })

        return NextResponse.json({ message: '註冊成功' }, { status: 201 })
    } catch (error) {
        console.error('註冊錯誤:', error)
        return NextResponse.json({ message: '伺服器錯誤' }, { status: 500 })
    }
}
