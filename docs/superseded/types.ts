// ============================================================
// IEEE COMMITTEE — Shared TypeScript Interfaces
// ============================================================

export interface IEEEDomain {
  id: string
  name: string
  acronym: string
  tagline: string
  description: string
  activities: string[]
  color: string         // CSS color string — accent for this domain's card
  iconName: string      // Phosphor icon name
  memberCount?: string  // e.g. "4.2M+ global members"
}

export interface Workshop {
  id: string
  title: string
  date: string          // ISO 8601 date string
  description: string
  speaker?: string
  speakerRole?: string
  coverImage: string    // Relative path from /public
  videoUrl?: string
  tags: string[]        // Domain IDs this workshop relates to
  attendeeCount?: number
}

export interface Achievement {
  id: string
  title: string
  year: number
  description: string
  category: 'award' | 'publication' | 'competition' | 'milestone' | 'partnership'
  imageUrl?: string
}

export interface Project {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'upcoming'
  domains: string[]     // Domain IDs
  teamSize?: number
  coverImage: string
  githubUrl?: string
  demoUrl?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  domain?: string       // Domain ID they're associated with
  photo: string         // Path from /public
  linkedin?: string
  bio?: string
}

export interface StoryChapter {
  id: ChapterId
  order: number
  title: string
  subtitle: string
  narrativeText: string
  choices?: StoryChoice[]
}

export interface StoryChoice {
  id: string
  label: string
  description: string
  consequence: string   // Text shown after selection
  affectedDomain?: string  // Domain ID — used for personalisation
}

export type ChapterId =
  | 'hero'
  | 'ieee-intro'
  | 'domain-universe'
  | 'past-achievements'
  | 'workshops'
  | 'current-activities'
  | 'recruitment'

export interface RegistrationTrack {
  id: 'jc-joint-core' | 'associate'
  name: string
  tagline: string
  description: string
  benefits: string[]
  commitment: string
  ideal: string
  color: string
}

export interface StatItem {
  label: string
  value: number
  suffix?: string       // e.g. "+" or "K"
  prefix?: string
}
