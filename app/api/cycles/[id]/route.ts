import { NextRequest, NextResponse } from 'next/server';
import { timelineData } from '@/lib/data';

// GET /api/cycles/[id] - 특정 사이클 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cycle = timelineData.cycles.find(c => c.id === id);
    
    if (!cycle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cycle not found',
          message: `Cycle with id '${id}' does not exist`
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: cycle
    });
    
  } catch (error) {
    console.error('Error fetching cycle:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cycle',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/cycles/[id] - 사이클 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const cycleIndex = timelineData.cycles.findIndex(c => c.id === id);
    
    if (cycleIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cycle not found',
          message: `Cycle with id '${id}' does not exist`
        },
        { status: 404 }
      );
    }
    
    // 사이클 업데이트
    const updatedCycle = {
      ...timelineData.cycles[cycleIndex],
      ...body,
      id, // ID는 변경하지 않음
    };
    
    timelineData.cycles[cycleIndex] = updatedCycle;
    
    return NextResponse.json({
      success: true,
      data: updatedCycle,
      message: 'Cycle updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating cycle:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update cycle',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cycles/[id] - 사이클 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cycleIndex = timelineData.cycles.findIndex(c => c.id === id);
    
    if (cycleIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cycle not found',
          message: `Cycle with id '${id}' does not exist`
        },
        { status: 404 }
      );
    }
    
    // 사이클 삭제
    const deletedCycle = timelineData.cycles.splice(cycleIndex, 1)[0];
    
    return NextResponse.json({
      success: true,
      data: deletedCycle,
      message: 'Cycle deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting cycle:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete cycle',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}