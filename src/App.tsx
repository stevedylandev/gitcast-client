import { useEffect, useState } from 'react'
import { Avatar } from './components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { CalendarIcon, GitBranchIcon, GitCommitIcon, GitPullRequestIcon, StarIcon, TrashIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import sdk, { Context } from '@farcaster/frame-sdk'
import { FeedResponse } from './utils/types'
import { Link } from './components/link'
import { Loader } from './components/loader'
import { Toggle } from './components/ui/toggle'

const SERVER_URL = "https://gitcast-api-worker.stevedsimkins.workers.dev"
//const SERVER_URL = "http://localhost:8787"

function App() {
  const [feed, setFeed] = useState<FeedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState<string>("Finding your people");
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [context, setContext] = useState<Context.FrameContext>()
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({
    PushEvent: false,
    PullRequestEvent: false,
    WatchEvent: false,
    DeleteEvent: false,
    CreateEvent: false,
  })

  useEffect(() => {
    const loadSDK = async () => {
      try {
        setContext(await sdk.context)
        sdk.actions.ready()
        setIsSDKLoaded(true)
      } catch (err) {
        console.error("Error loading Farcaster SDK:", err)
        setError("Failed to load Farcaster SDK. Using default FID.")
        setIsSDKLoaded(true)
      }
    }

    loadSDK()
  }, [])



  useEffect(() => {
    if (loading) {
      const phrases = [
        "Finding your people",
        "Building your feed",
        "Connecting to GitHub",
        "Gathering your events",
        "Loading repository data",
        "I promise it's almost over"
      ];

      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % phrases.length;
        setLoadingPhrase(phrases[currentIndex]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [loading]);


  useEffect(() => {
    if (!isSDKLoaded) return

    const fetchFeed = async () => {
      try {
        setLoading(true)

        const userFid = context?.user?.fid || 4823

        const response = await fetch(`${SERVER_URL}/feed/${userFid}?limit=100`)
        if (!response.ok) {
          throw new Error('Failed to fetch feed')
        }
        let data = await response.json()
        if (data.events.length === 0) {
          // Initialize the feed
          await fetch(`${SERVER_URL}/init/${userFid}`, {
            method: "POST"
          })

          // Poll the status endpoint until we have enough events
          let status = { stats: { events: 0 } }
          const pollInterval = 2000 // 2 seconds
          const maxPolls = 15 // Maximum polling attempts
          let pollCount = 0

          while (status.stats.events < 20 && pollCount < maxPolls) {
            await new Promise(resolve => setTimeout(resolve, pollInterval))
            const statusReq = await fetch(`${SERVER_URL}/status/${userFid}`)
            status = await statusReq.json()
            pollCount++
            setLoadingPhrase(`Gathering events (${status.stats.events}/10)...`)
          }

          // Re-fetch the feed after initialization and polling
          const refreshResponse = await fetch(`${SERVER_URL}/feed/${userFid}?limit=100`)
          if (refreshResponse.ok) {
            data = await refreshResponse.json()
          }
        }
        setFeed(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFeed()
  }, [isSDKLoaded, context])

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'PushEvent':
        return <GitCommitIcon className="h-4 w-4" />
      case 'PullRequestEvent':
        return <GitPullRequestIcon className="h-4 w-4" />
      case 'WatchEvent':
        return <StarIcon className="h-4 w-4" />
      case 'DeleteEvent':
        return <TrashIcon className="h-4 w-4" />
      case 'CreateEvent':
        return <GitBranchIcon className="h-4 w-4" />
      default:
        return <GitCommitIcon className="h-4 w-4" />
    }
  }
  const getBadgeVariant = (eventType: string): "pushEvent" | "pullRequestEvent" | "watchEvent" | "deleteEvent" | "createEvent" | "default" | "secondary" | "outline" | null | undefined => {
    switch (eventType) {
      case 'PushEvent':
        return 'pushEvent'
      case 'PullRequestEvent':
        return 'pullRequestEvent'
      case 'WatchEvent':
        return 'watchEvent'
      case 'DeleteEvent':
        return 'deleteEvent'
      case 'CreateEvent':
        return 'createEvent'
      default:
        return 'outline'
    }
  }

  const toggleFilter = (eventType: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [eventType]: !prev[eventType]
    }))
  }

  // If no filters are active, show all events, otherwise show only events that match active filters
  const filteredEvents = feed?.events.filter(event => {
    if (Object.values(activeFilters).every(filter => !filter)) {
      return true; // Show all events when no filters are active
    }
    return activeFilters[event.type]; // Only show events that match active filters
  }) || []

  if (loading) {
    return (

      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className='mb-24 text-center'>
          <h1 className="text-4xl font-bold">GitCast</h1>
          <p className='text-muted-foreground'>Merging GitHub into Farcaster</p>
        </div>

        <Loader />
        <p className="text-lg font-medium text-white">{loadingPhrase}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <div className='mb-6 text-center'>
        <h1 className="text-4xl font-bold">GitCast</h1>
        <p className='text-muted-foreground'>Merging GitHub into Farcaster</p>
        <div className="flex justify-center mt-4">
          <Link href="https://github.com/stevedylandev/gitcast-client">
            <Badge
              className="flex items-center gap-1 text-xs"
              variant="secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className='h-6 w-6' viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" /></svg>
              stevedylandev/gitcast-client
            </Badge>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-0 mb-6">
        <Toggle
          pressed={activeFilters.PushEvent}
          onPressedChange={() => toggleFilter('PushEvent')}
        >
          <Badge variant={activeFilters.PushEvent ? 'pushEvent' : 'outline'} className="flex items-center gap-1 text-xs">
            <GitCommitIcon className="h-3 w-3" /> Commits
          </Badge>
        </Toggle>
        <Toggle
          pressed={activeFilters.PullRequestEvent}
          onPressedChange={() => toggleFilter('PullRequestEvent')}
        >
          <Badge variant={activeFilters.PullRequestEvent ? 'pullRequestEvent' : 'outline'} className="flex items-center gap-1 text-xs">
            <GitPullRequestIcon className="h-3 w-3" /> PRs
          </Badge>
        </Toggle>
        <Toggle
          pressed={activeFilters.WatchEvent}
          onPressedChange={() => toggleFilter('WatchEvent')}
        >
          <Badge variant={activeFilters.WatchEvent ? 'watchEvent' : 'outline'} className="flex items-center gap-1 text-xs">
            <StarIcon className="h-3 w-3" /> Stars
          </Badge>
        </Toggle>
        <Toggle
          pressed={activeFilters.CreateEvent}
          onPressedChange={() => toggleFilter('CreateEvent')}
        >
          <Badge variant={activeFilters.CreateEvent ? 'createEvent' : 'outline'} className="flex items-center gap-1 text-xs">
            <GitBranchIcon className="h-3 w-3" /> Branches
          </Badge>
        </Toggle>
        {/* <Toggle
          pressed={activeFilters.DeleteEvent}
          onPressedChange={() => toggleFilter('DeleteEvent')}
        >
          <Badge variant={activeFilters.DeleteEvent ? 'deleteEvent' : 'outline'} className="flex items-center gap-1 text-xs">
            <TrashIcon className="h-3 w-3" /> Deletions
          </Badge>
        </Toggle> */}
      </div>

      <div className="flex flex-col justify-start gap-6">
        {filteredEvents.map((event) => (
          <Link href={event.eventUrl}>
            <Card key={event.id} className="shadow-sm py-2 px-1 hover:shadow-md transition-shadow max-w-full">
              <CardContent className="p-2">
                <div className="flex items-start gap-3">
                  <Link href={`https://github.com/${event.actor.login}`}>
                    <Avatar className="h-10 w-10 rounded-full border-2 border-border">
                      <img src={event.farcaster.pfp_url || event.actor.avatar_url} alt={event.actor.login} />
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{event.farcaster.display_name || event.actor.login}</span>
                      <Badge
                        variant={getBadgeVariant(event.type)}
                        className="flex items-center gap-1 text-xs"
                      >
                        {getEventIcon(event.type)}
                        {event.action}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground mt-1 overflow-hidden text-ellipsis">
                      <p className="underline">
                        {event.repo.name}
                      </p>
                    </div>
                    {event.commitMessage && (
                      <p className="mt-2 text-sm bg-muted p-2 rounded-md border border-border overflow-hidden">
                        <span className="line-clamp-3 break-words font-mono text-xs">{event.commitMessage}</span>
                      </p>
                    )}

                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div >
  )
}

export default App
