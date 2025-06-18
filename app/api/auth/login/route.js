import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ message: '欄位不得為空' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return NextResponse.json({ message: '找不到用戶' }, { status: 404 })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return NextResponse.json({ message: '密碼錯誤' }, { status: 401 })
        }

        return NextResponse.json({
            message: '登入成功',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (error) {
        console.error('登入錯誤:', error)
        return NextResponse.json({ message: '伺服器錯誤' }, { status: 500 })
    }
}
