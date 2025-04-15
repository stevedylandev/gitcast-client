interface Actor {
  login: string
  avatar_url: string
}

interface Repo {
  name: string
  url: string
}

interface Farcaster {
  username: string
  display_name: string
  pfp_url: string
}

interface Event {
  id: string
  type: string
  created_at: string
  actor: Actor
  repo: Repo
  fid: number
  action: string
  commitMessage: string | null
  farcaster: Farcaster
  eventUrl: string
}

export interface FeedResponse {
  events: Event[]
  fromCache: boolean
  cacheAge: number
}

export interface Repository {
  id: string
  name: string
  full_name: string
  description: string | null
  url: string
  html_url: string
  stars_count: number
  forks_count: number
  last_updated: number
  farcaster_stars_count: number
}

export interface RepositoriesResponse {
  repositories: Repository[]
  page: number
  limit: number
  hasMore: boolean
}
