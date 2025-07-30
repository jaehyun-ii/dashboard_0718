import { NextRequest, NextResponse } from 'next/server';
import { timelineData, CycleInfo } from '@/lib/data';

// GET /api/cycles - 사이클 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const turbine = searchParams.get('turbine');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let cycles = [...timelineData.cycles];
    
    // 필터링
    if (turbine && turbine !== 'all') {
      cycles = cycles.filter(cycle => cycle.turbine === turbine);
    }
    
    if (dateFrom) {
      cycles = cycles.filter(cycle => cycle.date >= dateFrom);
    }
    
    if (dateTo) {
      cycles = cycles.filter(cycle => cycle.date <= dateTo);
    }
    
    if (status && status !== 'all') {
      cycles = cycles.filter(cycle => 
        cycle.variables.some(variable => variable.status === status)
      );
    }
    
    // 페이지네이션
    const totalCount = cycles.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedCycles = cycles.slice(startIndex, startIndex + limit);
    
    return NextResponse.json({
      success: true,
      data: {
        cycles: paginatedCycles,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching cycles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cycles',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/cycles - 새 사이클 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 데이터 검증
    const requiredFields = ['name', 'turbine', 'date', 'start', 'end'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }
    
    // 새 사이클 생성
    const newCycle: CycleInfo = {
      id: `cycle-${Date.now()}`,
      name: body.name,
      turbine: body.turbine,
      date: body.date,
      start: body.start,
      end: body.end,
      color: body.color || 'from-blue-500 to-purple-500',
      variables: body.variables || []
    };
    
    // 메모리에 추가 (실제 환경에서는 DB에 저장)
    timelineData.cycles.push(newCycle);
    
    return NextResponse.json({
      success: true,
      data: newCycle,
      message: 'Cycle created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating cycle:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create cycle',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}