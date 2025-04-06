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
