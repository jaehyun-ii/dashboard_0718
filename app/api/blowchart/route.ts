import { NextRequest, NextResponse } from 'next/server';
import { blowchartValues, Blowchart } from '@/lib/data';

// 블로우차트 데이터 (실제 환경에서는 DB에서 가져옴)
let blowchartStore: Blowchart = { ...blowchartValues };

// GET /api/blowchart - 블로우차트 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keys = searchParams.get('keys')?.split(',');
    
    let result = { ...blowchartStore };
    
    // 특정 키들만 요청된 경우
    if (keys && keys.length > 0) {
      result = {};
      keys.forEach(key => {
        if (key in blowchartStore) {
          result[key] = blowchartStore[key];
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error fetching blowchart data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blowchart data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/blowchart - 블로우차트 데이터 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 데이터 검증
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: 'Request body must be an object'
        },
        { status: 400 }
      );
    }
    
    // 숫자 값만 허용
    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== 'number') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Validation failed',
            message: `Value for key '${key}' must be a number`
          },
          { status: 400 }
        );
      }
    }
    
    // 데이터 업데이트
    blowchartStore = { ...blowchartStore, ...body };
    
    return NextResponse.json({
      success: true,
      data: blowchartStore,
      message: 'Blowchart data updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating blowchart data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update blowchart data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/blowchart - 특정 키의 블로우차트 값 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;
    
    // 데이터 검증
    if (!key || typeof value !== 'number') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: 'Required fields: key (string), value (number)'
        },
        { status: 400 }
      );
    }
    
    // 단일 키 업데이트
    blowchartStore[key] = value;
    
    return NextResponse.json({
      success: true,
      data: { [key]: value },
      message: `Blowchart value for '${key}' updated successfully`
    });
    
  } catch (error) {
    console.error('Error updating blowchart value:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update blowchart value',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}