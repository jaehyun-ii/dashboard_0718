"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ReportItem {
  id: number;
  plant: string;
  unit: string;
  type: "cycle" | "weekly" | "monthly";
  name: string;
  date: string;
}

const sampleReports: ReportItem[] = [
  {
    id: 1,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-01",
  },
  {
    id: 2,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-02",
  },
  {
    id: 3,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-03",
  },
  {
    id: 4,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-04",
  },
  {
    id: 5,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-05",
  },
  {
    id: 6,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-06",
  },
  {
    id: 7,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-07",
  },
  {
    id: 8,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-08",
  },
  {
    id: 9,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-09",
  },
  {
    id: 10,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-10",
  },
  {
    id: 11,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-11",
  },
  {
    id: 12,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-12",
  },
  {
    id: 13,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-13",
  },
  {
    id: 14,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-14",
  },
  {
    id: 15,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-15",
  },
  {
    id: 16,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-16",
  },
  {
    id: 17,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-17",
  },
  {
    id: 18,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-18",
  },
  {
    id: 19,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-19",
  },
  {
    id: 20,
    plant: "신인천",
    unit: "1호기",
    type: "cycle",
    name: "신인천 1호기 주기보고서",
    date: "2024-04-20",
  },
];

export default function ReportsPage() {
  const [plant, setPlant] = useState("신인천");
  const [unit, setUnit] = useState("1호기");
  const [type, setType] = useState<"cycle" | "weekly" | "monthly">("cycle");
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setPage(1);
  }, [plant, unit, type, search]);

  const handleSearch = () => {
    setSearch(keyword);
  };

  const handleToggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const filtered = sampleReports.filter(
    (r) =>
      r.plant === plant &&
      r.unit === unit &&
      r.type === type &&
      (search === "" ||
        `${r.name}_${r.date}.pdf`.includes(search) ||
        r.date.includes(search))
  );

  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSelectAllClick = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      const newSelecteds = paginated.map((n) => n.id);
      setSelected((prev) => Array.from(new Set([...prev, ...newSelecteds])));
      return;
    }
    const pageIds = paginated.map((r) => r.id);
    setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
  };

  const handleDownload = () => {
    if (selected.length === 0) return;
    const names = sampleReports
      .filter((r) => selected.includes(r.id))
      .map((r) => `${r.name}_${r.date}.pdf`)
      .join(", ");
    alert(`Downloading: ${names}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const numSelected = paginated.filter((r) => selected.includes(r.id)).length;
  const rowCount = paginated.length;
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold">종합 점검 보고서</h1>
        <div className="flex items-center gap-2">
          <Select value={plant} onValueChange={setPlant}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="발전소" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="신인천">신인천</SelectItem>
              <SelectItem value="부산">부산</SelectItem>
            </SelectContent>
          </Select>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="호기" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1호기">1호기</SelectItem>
              <SelectItem value="2호기">2호기</SelectItem>
            </SelectContent>
          </Select>
          <Button>조회</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <h3 className="font-semibold whitespace-nowrap">보고서 유형</h3>
          <ToggleGroup
            type="single"
            value={type}
            onValueChange={(value) => {
              if (value) setType(value as "cycle" | "weekly" | "monthly");
            }}
            className="w-full md:w-auto"
          >
            <ToggleGroupItem value="cycle" className="flex-1">
              주기
            </ToggleGroupItem>
            <ToggleGroupItem value="weekly" className="flex-1">
              주간
            </ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="flex-1">
              월간
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle>보고서 목록</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <span>검색결과</span>
                <span className="font-bold text-primary">
                  {filtered.length}개
                </span>
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleDownload} disabled={selected.length === 0}>
                다운로드
              </Button>
              <Input
                placeholder="검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full sm:w-auto"
              />
              <Button variant="outline" onClick={handleSearch}>
                검색
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setKeyword("");
                  setSearch("");
                }}
              >
                검색 초기화
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        rowCount > 0 && numSelected === rowCount
                          ? true
                          : numSelected > 0
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={handleSelectAllClick}
                    />
                  </TableHead>
                  <TableHead>파일명</TableHead>
                  <TableHead>생성일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length > 0 ? (
                  paginated.map((r) => (
                    <TableRow
                      key={r.id}
                      data-state={selected.includes(r.id) && "selected"}
                      onClick={() => handleToggle(r.id)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(r.id)}
                          onCheckedChange={() => handleToggle(r.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{`${r.name}_${r.date}.pdf`}</TableCell>
                      <TableCell>{r.date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      조회된 보고서가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page - 1);
                    }}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(i + 1);
                      }}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
