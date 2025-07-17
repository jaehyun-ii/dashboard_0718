import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardChartsTables() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Chart A</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">{"{" + "}"}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Chart B</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">{"{" + "}"}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Table C</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">{"{" + "}"}</div>
        </CardContent>
      </Card>
    </div>
  )
}
