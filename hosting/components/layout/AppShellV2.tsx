'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  useDisclosure,
  Input,
  InputGroup,
  Menu,
  MenuItem,
  Card,
  useBreakpointValue,
} from '@chakra-ui/react'
import { 
  LayoutDashboard, 
  Target, 
  ClipboardList, 
  BarChart3, 
  Bot, 
  GitMerge, 
  PencilRuler,
  Search,
  Globe,
  Bell,
  Menu as MenuIcon,
  LogOut,
  Settings,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

// Navigation configuration matching the mockup
const NAV_ITEMS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/gui',
    description: 'Command center overview'
  },
  {
    id: 'pov',
    name: 'POV Mgmt',
    icon: Target,
    path: '/gui?tab=pov',
    description: 'Proof of Value management'
  },
  {
    id: 'trr',
    name: 'TRR',
    icon: ClipboardList,
    path: '/gui?tab=trr',
    description: 'Technical requirements review'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    description: 'Performance insights'
  },
  {
    id: 'ai',
    name: 'AI Assistant',
    icon: Bot,
    path: '/gui?tab=ai',
    description: 'AI-powered analysis'
  },
  {
    id: 'workflow',
    name: 'Workflow',
    icon: GitMerge,
    path: '/gui?tab=workflow',
    description: 'Process automation'
  },
  {
    id: 'builder',
    name: 'Demo Builder',
    icon: PencilRuler,
    path: '/gui?tab=builder',
    description: 'Create demonstrations'
  }
]

interface AppShellV2Props {
  children: React.ReactNode
}

export const AppShellV2: React.FC<AppShellV2Props> = ({ children }) => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, lg: false })
  
  // Determine active nav item based on current path
  useEffect(() => {
    const item = NAV_ITEMS.find(item => {
      if (item.path === pathname) return true
      if (item.path.includes('?') && pathname === item.path.split('?')[0]) {
        const params = new URLSearchParams(item.path.split('?')[1])
        const currentParams = new URLSearchParams(window?.location?.search || '')
        return params.get('tab') === currentParams.get('tab')
      }
      return false
    })
    setActiveItem(item?.id || 'dashboard')
  }, [pathname])

  // Handle navigation
  const handleNavigate = useCallback(async (item: any) => {
    setIsLoading(true)
    setActiveItem(item.id)
    
    try {
      await router.push(item.path)
      if (isMobile) onClose()
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setTimeout(() => setIsLoading(false), 300)
    }
  }, [router, isMobile, onClose])

  // Handle logout
  const handleLogout = useCallback(async () => {
    setIsLoading(true)
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoading(false)
    }
  }, [logout, router])

  // Navigation Item Component
  const NavItem = ({ item, isActive, onClick }: any) => (
    <Button
      key={item.id}
      onClick={() => onClick(item)}
      variant="ghost"
      size={sidebarCollapsed ? 'sm' : 'md'}
      justifyContent={sidebarCollapsed ? 'center' : 'flex-start'}
      w="full"
      h={sidebarCollapsed ? '12' : '14'}
      px={sidebarCollapsed ? '2' : '4'}
      py="3"
      borderRadius="xl"
      position="relative"
      bg={isActive ? 'rgba(249, 115, 22, 0.1)' : 'transparent'}
      color={isActive ? 'cortex.500' : 'text.secondary'}
      borderBottom={isActive ? '2px solid' : '2px solid transparent'}
      borderColor={isActive ? 'cortex.500' : 'transparent'}
      _hover={{
        bg: isActive ? 'rgba(249, 115, 22, 0.15)' : 'bg.hover',
        color: 'text.primary',
        borderColor: 'cortex.500'
      }}
      transition="all 0.2s ease-in-out"
    >
      <HStack w="full" className={sidebarCollapsed ? 'space-x-0' : 'space-x-3'}>
        <Box>
          <item.icon size={sidebarCollapsed ? 18 : 20} />
        </Box>
        {!sidebarCollapsed && (
          <VStack align="flex-start" flex={1}>
            <Text fontSize="sm" fontWeight="500" lineHeight="tight">
              {item.name}
            </Text>
          </VStack>
        )}
      </HStack>
      
      {isActive && (
        <Box
          position="absolute"
          left="-1px"
          top="50%"
          transform="translateY(-50%)"
          w="3px"
          h="20px"
          bg="cortex.500"
          borderRadius="full"
        />
      )}
    </Button>
  )

  // Sidebar Content Component
  const SidebarContent = ({ onItemClick }: any) => (
    <Flex direction="column" h="full" bg="bg.secondary" borderRight="1px solid" borderColor="border.secondary">
      {/* Header */}
      <Flex
        p="4"
        align="center"
        justify={sidebarCollapsed ? 'center' : 'space-between'}
        borderBottom="1px solid"
        borderColor="border.secondary"
        minH="16"
      >
        {!sidebarCollapsed ? (
          <>
            <HStack className="space-x-3">
              <Box
                w="8"
                h="8"
                bg="linear-gradient(135deg, #FF6900 0%, #E55A00 100%)"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize="sm" fontWeight="bold">
                  C
                </Text>
              </Box>
              <VStack align="flex-start">
                <Text fontSize="sm" fontWeight="600" color="text.primary">
                  Cortex DC Portal
                </Text>
                <Text fontSize="xs" color="text.muted">
                  Dashboard
                </Text>
              </VStack>
            </HStack>
            
            <IconButton
              aria-label="Collapse sidebar"
              size="sm"
              variant="ghost"
              onClick={() => setSidebarCollapsed(true)}
            >
              <ChevronLeft size={16} />
            </IconButton>
          </>
        ) : (
            <IconButton
              aria-label="Expand sidebar"
              size="sm"
              variant="ghost"
              onClick={() => setSidebarCollapsed(false)}
            >
              <ChevronRight size={16} />
            </IconButton>
        )}
      </Flex>

      {/* Navigation Items */}
      <VStack p="4" flex={1} align="stretch" className="space-y-1">
        {NAV_ITEMS.map((item) => (
            <Box key={item.id}>
              <NavItem
                item={item}
                isActive={activeItem === item.id}
                onClick={onItemClick}
              />
            </Box>
        ))}
      </VStack>

      {/* Footer */}
      {!sidebarCollapsed && (
        <Box p="4" borderTop="1px solid" borderColor="border.secondary">
          <VStack className="space-y-2">
            <HStack color="text.muted" fontSize="xs" className="space-x-2">
              <Box w="2" h="2" bg="success.500" borderRadius="full" />
              <Text>System Online</Text>
            </HStack>
            <Text fontSize="xs" color="text.muted" textAlign="center">
              v2.5.1
            </Text>
          </VStack>
        </Box>
      )}
    </Flex>
  )

  // Top Bar Component
  const TopBar = () => (
    <Box className="bg-cortex-bg-secondary border-b border-gray-700/50">
      <Box>
        <Flex h="16" align="center" justify="space-between">
          {/* Left side */}
          <HStack className="space-x-4">
            {isMobile && (
              <IconButton
                aria-label="Open menu"
                size="md"
                variant="ghost"
                onClick={onOpen}
              >
                <MenuIcon size={20} />
              </IconButton>
            )}
            
            <Text fontSize="lg" fontWeight="700" color="text.primary">
              Hello, {user?.displayName?.split(' ')[0] || 'Alex'}!
            </Text>
            <Text fontSize="sm" color="text.muted">
              Here's your command center for today.
            </Text>
          </HStack>

          {/* Right side */}
          <HStack className="space-x-3">

            {/* Global Context */}
            <Button
              variant="subtle"
              size="sm"
              className="flex items-center gap-2"
            >
              <Globe size={16} />
              <Text display={{ base: 'none', md: 'block' }}>Global Context</Text>
              <ChevronLeft size={16} style={{ transform: 'rotate(270deg)' }} />
            </Button>

            {/* Notifications */}
            <IconButton
              aria-label="Notifications"
              size="md"
              variant="subtle"
            >
              <Bell size={18} />
            </IconButton>

            {/* User Menu - Simple Avatar for now */}
            <div
              className="w-8 h-8 rounded-full bg-cortex-orange flex items-center justify-center text-white text-sm font-bold cursor-pointer border-2 border-gray-600 hover:bg-cortex-orange-light transition-colors"
              onClick={handleLogout}
              title="Click to logout"
            >
              {(user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
            </div>
          </HStack>
        </Flex>
      </Box>
    </Box>
  )

  return (
    <Box h="100vh" bg="bg.primary" display="flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box w={sidebarCollapsed ? '20' : '72'} transition="width 0.3s ease">
          <SidebarContent onItemClick={handleNavigate} />
        </Box>
      )}

      {/* Mobile Drawer - temporarily disabled for build */}

      {/* Main Content */}
      <Flex direction="column" flex={1} overflow="hidden">
        <TopBar />
        <Box flex={1} overflow="auto" bg="bg.primary">
          {children}
        </Box>
      </Flex>
    </Box>
  )
}