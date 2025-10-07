'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Text, 
  Metric, 
  Title, 
  ProgressBar, 
  Badge,
  Flex,
  Grid
} from '@tremor/react'
import { 
  Box, 
  VStack, 
  HStack, 
  Button, 
  SimpleGrid
} from '@chakra-ui/react'
import { Target, Plus, Play, Square, RefreshCw } from 'lucide-react'
import { useAppState } from '../contexts/AppStateContext'
import { dcContextStore } from '../lib/dc-context-store'

// Sample data matching the mockup exactly
const kpiData = [
  {
    title: 'Active POVs',
    value: '12',
    change: '+15%',
    changeType: 'positive',
    subtitle: 'vs last month',
    icon: Target,
    color: 'orange'
  },
  {
    title: 'Pending TRRs',
    value: '23',
    change: '5 High Priority',
    changeType: 'warning',
    subtitle: '',
    color: 'yellow'
  },
  {
    title: 'Overall Success Rate',
    value: '89%',
    change: 'Goal: 85%',
    changeType: 'positive',
    subtitle: '',
    color: 'green'
  },
  {
    title: 'Platform Health',
    value: '99.9%',
    change: 'All systems operational',
    changeType: 'positive',
    subtitle: '',
    color: 'green'
  }
]

const povProjects = [
  { name: 'Project Hydra', progress: 75, status: 'In Progress', color: 'orange' },
  { name: 'Project Phoenix', progress: 40, status: 'At Risk', color: 'yellow' },
  { name: 'ACME Corp POV', progress: 25, status: 'In Progress', color: 'orange' },
  { name: 'Global Tech', progress: 100, status: 'Completed', color: 'green' }
]

const povStatusData = [
  { label: 'In Progress', count: 7, color: 'orange' },
  { label: 'At Risk', count: 3, color: 'yellow' },
  { label: 'Completed', count: 2, color: 'green' }
]

interface DashboardV2Props {
  className?: string
}

export const DashboardV2: React.FC<DashboardV2Props> = ({ className = '' }) => {
  const { state, actions } = useAppState()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'Dashboard', path: '/gui' },
    ])
    
    // Initialize sample data if empty
    if (dcContextStore.getAllCustomerEngagements().length === 0) {
      dcContextStore.initializeSampleData()
    }
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [actions])

  if (isLoading) {
    return (
      <Box p={8} className={`min-h-screen bg-cortex-bg-primary ${className}`}>
        <Box className="space-y-6 max-w-7xl mx-auto">
          {/* Loading skeleton matching the mockup layout */}
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 bg-cortex-bg-tertiary rounded w-64"></div>
                <div className="h-4 bg-cortex-bg-tertiary rounded w-80"></div>
              </div>
              <div className="h-10 bg-cortex-bg-tertiary rounded w-32"></div>
            </div>
            
            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card p-6 space-y-4">
                  <div className="h-4 bg-cortex-bg-tertiary rounded w-1/2"></div>
                  <div className="h-8 bg-cortex-bg-tertiary rounded w-3/4"></div>
                  <div className="h-4 bg-cortex-bg-tertiary rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </Box>
      </Box>
    )
  }

  return (
    <Box p={8} className={`min-h-screen bg-cortex-bg-primary ${className}`}>
      <Box className="space-y-6 max-w-7xl mx-auto">
        {/* Header matching mockup */}
        <HStack justify="space-between" align="center" className="mb-8">
          <Box>
            <Text className="text-2xl font-bold text-cortex-text-primary">
              Hello, Alex!
            </Text>
            <Text className="text-cortex-text-muted">
              Here's your command center for today.
            </Text>
          </Box>
          
          <Button
            variant="solid"
            size="md"
            className="bg-cortex-orange hover:bg-cortex-orange-light text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hidden sm:inline-flex flex items-center gap-2"
          >
            <Target size={16} />
            New POV
          </Button>
        </HStack>

        {/* KPI Cards matching mockup design */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} className="gap-6">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm hover:transform hover:-translate-y-0.5 transition-all duration-200">
              <VStack align="start" className="p-6 space-y-3">
                <Text className="text-cortex-text-muted text-sm font-medium">
                  {kpi.title}
                </Text>
                <Metric className="text-cortex-text-primary text-3xl font-bold">
                  {kpi.value}
                </Metric>
                <HStack className="space-x-2">
                  <Badge 
                    color={kpi.color === 'orange' ? 'orange' : kpi.color === 'yellow' ? 'yellow' : 'green'} 
                    size="xs"
                  >
                    {kpi.change}
                  </Badge>
                  {kpi.subtitle && (
                    <Text className="text-cortex-text-muted text-sm">
                      {kpi.subtitle}
                    </Text>
                  )}
                </HStack>
              </VStack>
            </Card>
          ))}
        </SimpleGrid>

        {/* Main content grid matching mockup */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} className="gap-6">
          {/* My Active POVs - Takes 2/3 width on large screens */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 2' }}>
            <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm p-6">
              <Title className="text-cortex-text-primary text-lg font-semibold mb-6">
                My Active POVs
              </Title>
              
              <VStack align="stretch" className="space-y-4">
                {povProjects.map((pov, index) => (
                  <Flex key={index} className="items-center justify-between p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors duration-200">
                    <VStack align="start" flex={1} className="space-y-2">
                      <Text className="text-cortex-text-primary font-medium text-sm">
                        {pov.name}
                      </Text>
                      <Box w="full">
                        <ProgressBar 
                          value={pov.progress} 
                          color={pov.color === 'orange' ? 'orange' : pov.color === 'yellow' ? 'yellow' : 'green'}
                          className="w-full"
                        />
                      </Box>
                    </VStack>
                    <VStack align="end" className="ml-4 min-w-0 flex-shrink-0 space-y-1">
                      <Text className="text-cortex-text-primary font-semibold text-sm">
                        {pov.progress}%
                      </Text>
                    </VStack>
                  </Flex>
                ))}
              </VStack>
            </Card>
          </Box>

          {/* POV Status - Takes 1/3 width on large screens */}
          <Box>
            <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm p-6">
              <Title className="text-cortex-text-primary text-lg font-semibold mb-6">
                POV Status
              </Title>
              
              {/* Donut chart representation */}
              <VStack className="space-y-4">
                <Box className="relative h-40 w-40 mx-auto mb-4">
                  {/* Simple circular representation */}
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-l-cortex-orange border-t-cortex-orange border-r-transparent border-b-transparent transform rotate-0"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VStack>
                        <Text className="text-cortex-text-primary font-bold text-lg">12</Text>
                        <Text className="text-cortex-text-muted text-xs">POVs</Text>
                      </VStack>
                    </div>
                  </div>
                </Box>
                
                <VStack align="stretch" className="w-full space-y-2">
                  {povStatusData.map((status, index) => (
                    <HStack key={index} justify="space-between" className="text-xs">
                      <HStack className="space-x-2">
                        <Box 
                          w={2} 
                          h={2} 
                          borderRadius="full" 
                          className={`bg-${status.color === 'orange' ? 'cortex-orange' : status.color === 'yellow' ? 'yellow-500' : 'cortex-success'}`}
                        />
                        <Text className="text-cortex-text-secondary">
                          {status.label} ({status.count})
                        </Text>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </Card>
          </Box>
        </SimpleGrid>

        {/* Scenario Execution Terminal matching mockup */}
        <Card className="glass-card border border-gray-700/50 bg-gray-900/60 backdrop-blur-sm p-0 overflow-hidden">
          <VStack align="stretch">
            {/* Terminal Header */}
            <HStack 
              justify="space-between" 
              className="bg-gray-800/50 border-b border-gray-700/50 px-4 py-3"
            >
              <HStack className="space-x-3">
                <HStack className="space-x-1">
                  <Box w={3} h={3} borderRadius="full" className="bg-red-500" />
                  <Box w={3} h={3} borderRadius="full" className="bg-yellow-500" />
                  <Box w={3} h={3} borderRadius="full" className="bg-green-500" />
                </HStack>
                <Text className="text-cortex-text-primary font-medium text-sm">
                  Cortex XSIAM - Scenario Shell
                </Text>
              </HStack>
              
              <HStack className="space-x-2">
                <Button size="sm" variant="ghost" className="p-1">
                  <Play size={14} />
                </Button>
                <Button size="sm" variant="ghost" className="p-1">
                  <Square size={14} />
                </Button>
                <Button size="sm" variant="ghost" className="p-1">
                  <RefreshCw size={14} />
                </Button>
              </HStack>
            </HStack>
            
            {/* Terminal Content */}
            <Box className="bg-black/90 p-4 font-mono text-sm text-cortex-success h-72 overflow-y-auto">
              <VStack align="start" className="space-y-1">
                <Text>Connecting to demo environment... <span className="text-cortex-success">success.</span></Text>
                <Text>Authenticated as: alex_dc</Text>
                <Text className="mt-2">
                  <span className="text-purple-400">(dc-portal) ~$</span>
                  <span className="text-cortex-text-primary ml-2">./run_scenario --name "APT28_Simulation"</span>
                </Text>
                <Text>Initializing scenario...</Text>
                <Text>[INFO] Deploying detection scripts.</Text>
                <Text className="text-cortex-success">[SUCCESS] Scenario 'APT28_Simulation' is now active.</Text>
                <Text className="mt-2">
                  <span className="text-purple-400">(dc-portal) ~$</span>
                  <span className="text-cortex-text-primary ml-2 animate-pulse">_</span>
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Card>
      </Box>
    </Box>
  )
}
