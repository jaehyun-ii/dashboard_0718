import { NextRequest, NextResponse } from 'next/server';
import { SwirlDataEntry } from '@/lib/data';

// 임시 스월 데이터 (실제 환경에서는 DB에서 가져옴)
let swirlDataStore: SwirlDataEntry[] = [
  {
    cycle: "215",
    swirlData: [
      {
        datetime: "2023-11-15 17:30:53",
        output: 0.15,
        sensors: Array.from({ length: 27 }, (_, i) => ({
          name: `T${i + 1}`,
          value: 10 + Math.random() * 5,
        })),
      },
    ],
  },
];

// GET /api/swirl-data - 스월 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycleId');
    
    let result = [...swirlDataStore];
    
    if (cycleId) {
      result = result.filter(entry => entry.cycle === cycleId);
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error fetching swirl data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch swirl data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/swirl-data - 스월 데이터 생성/업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 데이터 검증
    if (!body.cycle || !body.swirlData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: 'Missing required fields: cycle, swirlData'
        },
        { status: 400 }
      );
    }
    
    // 기존 데이터 찾기
    const existingIndex = swirlDataStore.findIndex(entry => entry.cycle === body.cycle);
    
    if (existingIndex >= 0) {
      // 업데이트
      swirlDataStore[existingIndex] = body;
    } else {
      // 새로 추가
      swirlDataStore.push(body);
    }
    
    return NextResponse.json({
      success: true,
      data: body,
      message: existingIndex >= 0 ? 'Swirl data updated successfully' : 'Swirl data created successfully'
    }, { status: existingIndex >= 0 ? 200 : 201 });
    
  } catch (error) {
    console.error('Error saving swirl data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save swirl data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}