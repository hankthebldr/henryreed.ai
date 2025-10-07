'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Text, 
  Metric, 
  Title, 
  ProgressBar, 
  AreaChart, 
  DonutChart, 
  BarChart,
  Badge,
  Flex,
  Grid,
  Col
} from '@tremor/react'
import { Box, VStack, HStack, Button } from '@chakra-ui/react'
import { useAppState } from '../../contexts/AppStateContext'
import { dcContextStore } from '../../lib/dc-context-store'
import { Download, TrendingUp, Users, Target, CheckCircle } from 'lucide-react'

// Sample data matching the mockup
const povStatusData = [
  { name: 'In Progress', value: 7, color: '#f97316' },
  { name: 'At Risk', value: 3, color: '#f59e0b' }, 
  { name: 'Completed', value: 2, color: '#10b981' }
]

const timeSeriesData = [
  { month: 'Jan', 'Win Rate': 85, 'Completion': 78 },
  { month: 'Feb', 'Win Rate': 89, 'Completion': 82 },
  { month: 'Mar', 'Win Rate': 87, 'Completion': 85 },
  { month: 'Apr', 'Win Rate': 92, 'Completion': 88 },
  { month: 'May', 'Win Rate': 89, 'Completion': 91 },
  { month: 'Jun', 'Win Rate': 94, 'Completion': 89 }
]

const industryData = [
  { name: 'Financial Services', value: 35 },
  { name: 'Healthcare', value: 28 },
  { name: 'Manufacturing', value: 22 },
  { name: 'Technology', value: 15 }
]

const activePovs = [
  { name: 'Project Hydra', progress: 75, status: 'on-track' },
  { name: 'Project Phoenix', progress: 40, status: 'at-risk' },
  { name: 'ACME Corp POV', progress: 25, status: 'on-track' },
  { name: 'Global Tech', progress: 100, status: 'completed' }
]

export default function AnalyticsPage() {
  const { state, actions } = useAppState()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'Analytics', path: '/analytics' },
    ])
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [actions])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green'
      case 'at-risk': return 'yellow'
      default: return 'orange'
    }
  }

  if (isLoading) {
    return (
      <Box p={6} className="min-h-screen bg-cortex-bg-primary">
        <Box className="space-y-6 max-w-7xl mx-auto">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-cortex-bg-tertiary rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card p-6">
                  <div className="h-4 bg-cortex-bg-tertiary rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-cortex-bg-tertiary rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </Box>
      </Box>
    )
  }

  return (
    <Box p={6} className="min-h-screen bg-cortex-bg-primary">
      <Box className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <HStack justify="space-between" align="center" className="pb-6">
          <Box>
            <Text className="text-2xl font-bold text-cortex-text-primary">Customer Analytics</Text>
            <Text className="text-cortex-text-muted">Visualize trends and performance across all engagements</Text>
          </Box>
          
          <Button
            variant="solid"
            size="md"
            className="bg-cortex-orange hover:bg-cortex-orange-light text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Download size={16} />
            Export Data
          </Button>
        </HStack>

        {/* KPI Cards */}
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
          <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm">
            <Flex alignItems="start" className="space-x-4">
              <div className="p-3 rounded-xl bg-cortex-orange/20">
                <Target className="h-6 w-6 text-cortex-orange" />
              </div>
              <div>
                <Text className="text-cortex-text-muted text-sm">Active POVs</Text>
                <Metric className="text-cortex-text-primary text-3xl font-bold">12</Metric>
                <Text className="text-cortex-success text-sm font-medium">
                  <Badge color="green" size="xs" className="mr-2">+15%</Badge>
                  vs last month
                </Text>
              </div>
            </Flex>
          </Card>

          <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm">
            <Flex alignItems="start" className="space-x-4">
              <div className="p-3 rounded-xl bg-yellow-500/20">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <Text className="text-cortex-text-muted text-sm">Pending TRRs</Text>
                <Metric className="text-yellow-400 text-3xl font-bold">23</Metric>
                <Text className="text-yellow-400 text-sm font-medium">
                  <Badge color="yellow" size="xs" className="mr-2">5 High Priority</Badge>
                </Text>
              </div>
            </Flex>
          </Card>

          <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm">
            <Flex alignItems="start" className="space-x-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <Text className="text-cortex-text-muted text-sm">Overall Success Rate</Text>
                <Metric className="text-green-400 text-3xl font-bold">89%</Metric>
                <Text className="text-cortex-text-muted text-sm">Goal: 85%</Text>
              </div>
            </Flex>
          </Card>

          <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm">
            <Flex alignItems="start" className="space-x-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <Text className="text-cortex-text-muted text-sm">Platform Health</Text>
                <Metric className="text-green-400 text-3xl font-bold">99.9%</Metric>
                <Text className="text-cortex-text-muted text-sm">All systems operational</Text>
              </div>
            </Flex>
          </Card>
        </Grid>

        {/* Charts Row */}
        <Grid numItems={1} numItemsLg={2} className="gap-6">
          {/* Time Series Chart */}
          <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm p-6">
            <Title className="text-cortex-text-primary text-lg font-semibold mb-2">POV Win Rate Over Time</Title>
            <Text className="text-cortex-text-muted text-sm mb-6">Last 6 Months</Text>
            <AreaChart
              className="h-64"
              data={timeSeriesData}
              index="month"
              categories={['Win Rate', 'Completion']}
              colors={['orange', 'green']}
              yAxisWidth={40}
              showAnimation={true}
              showLegend={true}
              showGridLines={true}
              showXAxis={true}
              showYAxis={true}
              onValueChange={(v) => console.log(v)}
            />
          </Card>

          {/* Donut Chart */}
          <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm p-6">
            <Title className="text-cortex-text-primary text-lg font-semibold mb-2">POV Status Distribution</Title>
            <Text className="text-cortex-text-muted text-sm mb-6">Current Quarter</Text>
            <DonutChart
              className="h-64"
              data={povStatusData}
              category="value"
              index="name"
              colors={['orange', 'yellow', 'green']}
              showAnimation={true}
              showTooltip={true}
              label="12 POVs Total"
            />
          </Card>
        </Grid>

        {/* Active POVs Table */}
        <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm p-6">
          <Title className="text-cortex-text-primary text-lg font-semibold mb-6">My Active POVs</Title>
          <div className="space-y-4">
            {activePovs.map((pov, index) => (
              <Flex key={index} className="items-center space-x-4 p-4 rounded-lg bg-gray-800/50">
                <div className="flex-1">
                  <Text className="text-cortex-text-primary font-medium">{pov.name}</Text>
                  <div className="mt-2">
                    <ProgressBar 
                      value={pov.progress} 
                      color={getStatusColor(pov.status)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="text-right min-w-0 flex-shrink-0">
                  <Text className="text-cortex-text-primary font-semibold">{pov.progress}%</Text>
                  <Badge 
                    color={getStatusColor(pov.status)}
                    size="sm"
                    className="mt-1"
                  >
                    {pov.status === 'completed' ? 'Completed' : 
                     pov.status === 'at-risk' ? 'At Risk' : 'On Track'}
                  </Badge>
                </div>
              </Flex>
            ))}
          </div>
        </Card>

        {/* Industry Distribution */}
        <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm p-6">
          <Title className="text-cortex-text-primary text-lg font-semibold mb-2">Industry Distribution</Title>
          <Text className="text-cortex-text-muted text-sm mb-6">Active POVs by Industry</Text>
          <BarChart
            className="h-64"
            data={industryData}
            index="name"
            categories={['value']}
            colors={['orange']}
            yAxisWidth={40}
            showAnimation={true}
            showLegend={false}
            showGridLines={true}
            showXAxis={true}
            showYAxis={true}
          />
        </Card>
      </Box>
    </Box>
  )
}
