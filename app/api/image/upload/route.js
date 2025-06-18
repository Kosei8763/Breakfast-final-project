import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Supabase URL or key is not set' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        const formData = await request.formData()
        const file = formData.get('file')

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'File is required' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const fileName = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage.from('uploads').upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
        })

        if (error) {
            throw error
        }

        const res = supabase.storage.from('uploads').getPublicUrl(data.path)
        const publicUrl = res.data.publicUrl

        return NextResponse.json({ success: true, url: publicUrl })
    } catch (error) {
        console.error('Error uploading image:', error)
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }
}
