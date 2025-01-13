import { 
  Mic, Wand2, Laptop, Database, 
  Headphones, Gavel, Video, Edit3 
} from 'lucide-react';
import type { RoleDataMap } from '../types/roles';

export const roleData: RoleDataMap = {
  court_reporter: {
    title: "Court Reporter",
    icon: Mic,
    description: "Empower your court reporting practice with cutting-edge AI technology and professional tools designed specifically for certified court reporters. Our platform streamlines your workflow while maintaining the highest standards of accuracy and professionalism.",
    features: [
      {
        icon: Wand2,
        title: "AI-Enhanced Transcription",
        description: "Advanced AI assistance for faster, more accurate transcripts with custom dictionary support and real-time suggestions."
      },
      {
        icon: Laptop,
        title: "Real-time Editing Suite",
        description: "Professional-grade editing interface with instant formatting, auto-punctuation, and speaker identification."
      },
      {
        icon: Database,
        title: "Custom Dictionary Management",
        description: "Build and maintain comprehensive case-specific dictionaries with automatic term learning."
      },
      {
        icon: Headphones,
        title: "Audio Enhancement",
        description: "Professional audio processing tools for crystal-clear playback and enhanced accuracy."
      }
    ],
    workflows: [
      {
        title: "Pre-Deposition Setup",
        steps: [
          "Review case materials and create custom dictionary entries",
          "Set up audio equipment and test recording quality",
          "Configure real-time streaming settings if required",
          "Verify all participants and their roles"
        ]
      },
      {
        title: "During Deposition",
        steps: [
          "Utilize real-time transcription with AI assistance",
          "Mark exhibits and important testimony",
          "Monitor audio quality and adjust as needed",
          "Track speaker identification and timestamps"
        ]
      },
      {
        title: "Post-Deposition Processing",
        steps: [
          "Review and edit transcript with AI suggestions",
          "Process and enhance audio recordings",
          "Generate formatted transcripts in multiple formats",
          "Secure delivery to authorized parties"
        ]
      }
    ],
    responsibilities: [
      "Capture accurate, verbatim records of legal proceedings",
      "Maintain professional certification and credentials",
      "Ensure confidentiality of sensitive information",
      "Manage and organize case-specific terminology",
      "Deliver certified transcripts within deadlines",
      "Coordinate with legal teams and witnesses"
    ],
    permissions: [
      "Access to professional transcription tools",
      "Custom dictionary management",
      "Audio processing and enhancement",
      "Real-time streaming capabilities",
      "Secure file storage and sharing",
      "Certificate generation and management"
    ]
  }
  // Other roles can be added here following the same structure
};