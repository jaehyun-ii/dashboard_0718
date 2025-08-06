import { NextRequest, NextResponse } from 'next/server';
import { timelineData, VariableStatus, VariableGroup } from '@/lib/data';

// GET /api/variables - 변수 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycleId');
    const group = searchParams.get('group') as VariableGroup;
    const status = searchParams.get('status') as VariableStatus;
    
    if (!cycleId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: 'cycleId parameter is required'
        },
        { status: 400 }
      );
    }
    
    const cycle = timelineData.cycles.find(c => c.id === cycleId);
    
    if (!cycle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cycle not found',
          message: `Cycle with id '${cycleId}' does not exist`
        },
        { status: 404 }
      );
    }
    
    let variables = [...cycle.variables];
    
    // 그룹별 필터링
    if (group) {
      variables = variables.filter(variable => variable.group === group);
    }
    
    // 상태별 필터링
    if (status) {
      variables = variables.filter(variable => variable.status === status);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        cycleId,
        variables,
        summary: {
          total: variables.length,
          healthy: variables.filter(v => v.status === 'healthy').length,
          warning: variables.filter(v => v.status === 'warning').length,
          critical: variables.filter(v => v.status === 'critical').length,
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching variables:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch variables',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/variables - 변수 상태/값 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cycleId, variableName, status, value } = body;
    
    // 데이터 검증
    if (!cycleId || !variableName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: 'Required fields: cycleId, variableName'
        },
        { status: 400 }
      );
    }
    
    const cycleIndex = timelineData.cycles.findIndex(c => c.id === cycleId);
    
    if (cycleIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cycle not found',
          message: `Cycle with id '${cycleId}' does not exist`
        },
        { status: 404 }
      );
    }
    
    const variableIndex = timelineData.cycles[cycleIndex].variables.findIndex(
      v => v.name === variableName
    );
    
    if (variableIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Variable not found',
          message: `Variable '${variableName}' not found in cycle '${cycleId}'`
        },
        { status: 404 }
      );
    }
    
    // 변수 업데이트
    const variable = timelineData.cycles[cycleIndex].variables[variableIndex];
    
    if (status && ['healthy', 'warning', 'critical'].includes(status)) {
      variable.status = status as VariableStatus;
    }
    
    if (value !== undefined) {
      variable.value = String(value);
    }
    
    return NextResponse.json({
      success: true,
      data: variable,
      message: 'Variable updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating variable:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update variable',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/variables/summary - 전체 변수 상태 요약
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cycleIds } = body; // 특정 사이클들의 요약이 필요한 경우
    
    let cycles = timelineData.cycles;
    
    if (cycleIds && Array.isArray(cycleIds)) {
      cycles = cycles.filter(cycle => cycleIds.includes(cycle.id));
    }
    
    const allVariables = cycles.flatMap(cycle => cycle.variables);
    
    const summary = {
      total: allVariables.length,
      healthy: allVariables.filter(v => v.status === 'healthy').length,
      warning: allVariables.filter(v => v.status === 'warning').length,
      critical: allVariables.filter(v => v.status === 'critical').length,
      byGroup: {} as Record<VariableGroup, { total: number; healthy: number; warning: number; critical: number; }>
    };
    
    // 그룹별 요약
    const groups: VariableGroup[] = ['진동', '연소', '전기', '단위기기'];
    groups.forEach(group => {
      const groupVariables = allVariables.filter(v => v.group === group);
      summary.byGroup[group] = {
        total: groupVariables.length,
        healthy: groupVariables.filter(v => v.status === 'healthy').length,
        warning: groupVariables.filter(v => v.status === 'warning').length,
        critical: groupVariables.filter(v => v.status === 'critical').length,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Error fetching variables summary:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch variables summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}