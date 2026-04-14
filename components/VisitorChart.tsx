'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, Eye } from 'lucide-react'

interface VisitorChartProps {
  profileId: string
}

type DataVisibility = 'both' | 'visitors' | 'views'

interface DailyVisit {
  date: string
  unique_visitors: number
  total_views: number
}

export function VisitorChart({ profileId }: VisitorChartProps) {
  const supabase = createClient()
  const [data, setData] = useState<DailyVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [visibility, setVisibility] = useState<DataVisibility>('both')

  useEffect(() => {
    loadDailyVisits()
  }, [profileId])

  async function loadDailyVisits() {
    const { data: visits } = await supabase
      .from('daily_visits')
      .select('visit_date, unique_visitors, total_views')
      .eq('profile_id', profileId)
      .order('visit_date', { ascending: true })
      .limit(30)

    // Create a map of existing visit data by date string (YYYY-MM-DD)
    const visitMap = new Map<string, { unique_visitors: number; total_views: number }>()
    visits?.forEach(v => {
      visitMap.set(v.visit_date, {
        unique_visitors: v.unique_visitors,
        total_views: v.total_views
      })
    })

    // Generate all 30 days (from 29 days ago to today)
    const allDays: DailyVisit[] = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      const visitData = visitMap.get(dateStr)
      
      allDays.push({
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric' 
        }),
        unique_visitors: visitData?.unique_visitors || 0,
        total_views: visitData?.total_views || 0
      })
    }
    
    setData(allDays)
    setLoading(false)
  }

  const totalVisitors = data.reduce((sum, d) => sum + d.unique_visitors, 0)
  const totalViews = data.reduce((sum, d) => sum + d.total_views, 0)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            Daily Visitors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No visitor data yet. Data will appear once people start viewing your profile.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            Daily Visitors (Last 30 Days)
          </CardTitle>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setVisibility('visitors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                visibility === 'visitors' || visibility === 'both'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{totalVisitors.toLocaleString()} visitors</span>
            </button>
            <button
              onClick={() => setVisibility('views')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                visibility === 'views' || visibility === 'both'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{totalViews.toLocaleString()} views</span>
            </button>
            {(visibility === 'visitors' || visibility === 'views') && (
              <button
                onClick={() => setVisibility('both')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:bg-muted"
                title="Show both"
              >
                <span className="text-xs">Show both</span>
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              {(visibility === 'both' || visibility === 'visitors') && (
                <Line 
                  type="monotone" 
                  dataKey="unique_visitors" 
                  name="Unique Visitors"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
              {(visibility === 'both' || visibility === 'views') && (
                <Line 
                  type="monotone" 
                  dataKey="total_views" 
                  name="Total Views"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
