import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('wardrobe')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const formData = await request.formData()
  const imageFile = formData.get('image') as File | null
  const analysisStr = formData.get('analysis') as string | null

  if (!imageFile || !analysisStr) {
    return NextResponse.json({ error: '이미지와 분석 결과가 필요합니다' }, { status: 400 })
  }

  const analysis = JSON.parse(analysisStr)

  const ext = imageFile.name.split('.').pop() ?? 'jpg'
  const fileName = `${user.id}/${Date.now()}.${ext}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('wardrobe-images')
    .upload(fileName, imageFile)

  if (uploadError) {
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('wardrobe-images')
    .getPublicUrl(uploadData.path)

  const { data, error } = await supabase
    .from('wardrobe')
    .insert({
      user_id: user.id,
      image_url: publicUrl,
      category: analysis.category,
      colors: analysis.colors,
      style: analysis.style,
      material: analysis.material,
      season: analysis.season,
      description: analysis.description,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const { id, category, style, season, description } = await request.json()

  const { data, error } = await supabase
    .from('wardrobe')
    .update({ category, style, season, description })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const { id } = await request.json()

  const { error } = await supabase
    .from('wardrobe')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
