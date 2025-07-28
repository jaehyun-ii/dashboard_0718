"use client";

import React, { useState } from 'react';
import { useReportsStore } from '@/lib/stores/reports-store';
import { BlankCard } from '@/components/ui/blank-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, RotateCcw, Download, Loader2 } from 'lucide-react';

export function ReportTable() {
  // Zustand store integration
  const {
    // State
    filters,
    selectedReports,
    currentPage,
    isLoading,
    error,
    
    // Actions
    setFilters,
    resetFilters,
    searchReports,
    selectReport,
    deselectReport,
    selectAllReports,
    clearSelection,
    setCurrentPage,
    downloadReports,
    
    // Computed values
    getFilteredReports,
    getPaginatedReports,
    getTotalPages,
  } = useReportsStore();
  
  // Local search input state
  const [searchInput, setSearchInput] = useState<string>(filters.searchKeyword);
  
  // Get computed data
  const filteredReports = getFilteredReports();
  const paginatedReports = getPaginatedReports();
  const totalPages = getTotalPages();
  
  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllReports(paginatedReports.map(report => report.id));
    } else {
      clearSelection();
    }
  };
  
  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      selectReport(reportId);
    } else {
      deselectReport(reportId);
    }
  };
  
  const handleSearch = () => {
    searchReports(searchInput);
  };
  
  const handleReset = () => {
    resetFilters();
    setSearchInput('');
  };
  
  const handleDownload = async () => {
    const selectedReportIds = Array.from(selectedReports);
    if (selectedReportIds.length > 0) {
      await downloadReports(selectedReportIds);
    }
  };
  
  // Pagination component
  const PaginationComponent = () => (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isLoading}
      >
        이전
      </Button>
      
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
        return (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(pageNum)}
            disabled={isLoading}
          >
            {pageNum}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || isLoading}
      >
        다음
      </Button>
    </div>
  );
  
  return (
    <BlankCard className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">보고서 조회</h1>
        <p className="text-xl text-slate-600">시스템 보고서를 조회하고 다운로드할 수 있습니다.</p>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">발전소</label>
          <Select 
            value={filters.plant} 
            onValueChange={(value) => setFilters({ plant: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="신인천">신인천</SelectItem>
              <SelectItem value="부산">부산</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">호기</label>
          <Select 
            value={filters.unit} 
            onValueChange={(value) => setFilters({ unit: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="1호기">1호기</SelectItem>
              <SelectItem value="2호기">2호기</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">보고서 종류</label>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {['사이클', '주간', '월간'].map((type) => (
              <button
                key={type}
                onClick={() => setFilters({ type })}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  filters.type === type 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">검색</label>
          <div className="flex space-x-2">
            <Input
              placeholder="보고서 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button size="sm" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset} disabled={isLoading}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Action Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-slate-600">
          총 {filteredReports.length}개의 보고서 ({selectedReports.size}개 선택됨)
        </div>
        <Button 
          onClick={handleDownload}
          disabled={selectedReports.size === 0 || isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>선택 항목 다운로드</span>
        </Button>
      </div>
      
      {/* Table Section */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left">
                <Checkbox
                  checked={selectedReports.size === paginatedReports.length && paginatedReports.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="p-4 text-left font-semibold text-slate-700">보고서 ID</th>
              <th className="p-4 text-left font-semibold text-slate-700">제목</th>
              <th className="p-4 text-left font-semibold text-slate-700">종류</th>
              <th className="p-4 text-left font-semibold text-slate-700">발전소</th>
              <th className="p-4 text-left font-semibold text-slate-700">호기</th>
              <th className="p-4 text-left font-semibold text-slate-700">생성일</th>
              <th className="p-4 text-left font-semibold text-slate-700">상태</th>
              <th className="p-4 text-left font-semibold text-slate-700">크기</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.map((report) => (
              <tr key={report.id} className="border-t hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <Checkbox
                    checked={selectedReports.has(report.id)}
                    onCheckedChange={(checked) => handleSelectReport(report.id, !!checked)}
                  />
                </td>
                <td className="p-4 font-mono text-sm">{report.id}</td>
                <td className="p-4 font-medium">{report.title}</td>
                <td className="p-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {report.type}
                  </span>
                </td>
                <td className="p-4">{report.plant}</td>
                <td className="p-4">{report.unit}</td>
                <td className="p-4 text-sm text-slate-600">{report.date}</td>
                <td className="p-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === '완료' 
                      ? 'bg-green-100 text-green-800'
                      : report.status === '진행중'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">{report.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <PaginationComponent />
    </BlankCard>
  );
}