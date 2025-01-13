// Update the navigationItems array in MainNavigation.tsx
const navigationItems: NavigationItem[] = [
  { 
    label: 'Dashboard', 
    path: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  { 
    label: 'Calendar', 
    path: '/calendar', 
    icon: Calendar,
    description: 'Schedule management'
  },
  { 
    label: 'Messages', 
    path: '/messages', 
    icon: MessageSquare,
    badge: 3,
    description: 'Communication center'
  },
  { 
    label: 'Transcription', 
    path: '/transcription', 
    icon: Mic,
    description: 'Court reporter tools'
  },
  { 
    label: 'Resources', 
    path: '/resources', 
    icon: FileText,
    description: 'Documents and files'
  },
  { 
    label: 'Settings', 
    path: '/settings', 
    icon: Settings,
    description: 'System preferences'
  },
  { 
    label: 'Support', 
    path: '/support', 
    icon: HelpCircle,
    description: 'Help and documentation'
  }
];