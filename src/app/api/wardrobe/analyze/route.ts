import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('image') as File | null

  if (!file) {
    return NextResponse.json({ error: '이미지가 없습니다' }, { status: 400 })
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: '지원하지 않는 이미지 형식입니다' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `이 옷 사진을 분석하여 JSON만 출력하세요. 코드블록, 설명 없이 순수 JSON만.

{
  "category": "top|bottom|outer|shoes|accessory",
  "colors": ["주요색상1", "주요색상2"],
  "style": ["casual", "minimal"],
  "material": "소재명 또는 null",
  "season": "summer|spring_autumn|winter",
  "description": "한 줄 설명 (예: 네이비 오버핏 트렌치코트)"
}

style은 1~3개 배열로 반환. 허용값: casual|minimal|street|sporty|formal|vintage|chic|girly|boyish|classic|romantic|preppy`,
          },
        ],
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')
    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysis)
  } catch {
    return NextResponse.json({ error: '분석에 실패했습니다. 다시 시도해주세요.' }, { status: 500 })
  }
}
