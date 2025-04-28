import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, CheckCircle, AlertCircle, UserCheck } from "lucide-react"

// interface EnrollmentSummaryProps {
//   count: number
//   maleCount: number
//   femaleCount: number
//   activeCount: number
//   completedCount: number
//   expiredCount: number
//   pendingCount: number
//   }

export function EnrollmentSummary({
  count,
  maleCount,
  femaleCount,
  activeCount,
  completedCount,
  expiredCount,
  pendingCount,
}) {
  // Calculate percentages for the progress bars
  const malePercentage = count > 0 ? (maleCount / count) * 100 : 0
  const femalePercentage = count > 0 ? (femaleCount / count) * 100 : 0
  const activePercentage = count > 0 ? (activeCount / count) * 100 : 0
  const completedPercentage = count > 0 ? (completedCount / count) * 100 : 0
  const expiredPercentage = count > 0 ? (expiredCount / count) * 100 : 0
  const pendingPercentage = count > 0 ? (pendingCount / count) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count}</div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Male</span>
              <span className="font-medium">{maleCount}</span>
            </div>
            <Progress value={malePercentage} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span>Female</span>
              <span className="font-medium">{femaleCount}</span>
            </div>
            <Progress value={femalePercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <div className="text-xs text-muted-foreground">{activePercentage.toFixed(1)}% of total enrollments</div>
          <Progress value={activePercentage} className="h-2 mt-4" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}</div>
          <div className="text-xs text-muted-foreground">{completedPercentage.toFixed(1)}% of total enrollments</div>
          <Progress value={completedPercentage} className="h-2 mt-4" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status Overview</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Pending</span>
              <span className="font-medium">{pendingCount}</span>
            </div>
            <Progress value={pendingPercentage} className="h-2 bg-amber-100" />

            <div className="flex items-center justify-between text-sm">
              <span>Expired</span>
              <span className="font-medium">{expiredCount}</span>
            </div>
            <Progress value={expiredPercentage} className="h-2 bg-red-100" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
