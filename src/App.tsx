import { useEffect, useState } from 'react'
import { Avatar } from './components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { CalendarIcon, GitBranchIcon, GitCommitIcon, GitPullRequestIcon, StarIcon, TrashIcon, LoaderPinwheelIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import sdk, { Context } from '@farcaster/frame-sdk'
import { FeedResponse } from './utils/types'


function App() {
  const [feed, setFeed] = useState<FeedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState<string>("Finding your people");
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [context, setContext] = useState<Context.FrameContext>()

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

        const userFid = context?.user?.fid || 6023

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/feed/${userFid}?limit=100`)
        if (!response.ok) {
          throw new Error('Failed to fetch feed')
        }
        const data = await response.json()
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

  const getBadgeVariant = (eventType: string): "success" | "default" | "destructive" | "secondary" | "outline" | "interest" | null | undefined => {
    switch (eventType) {
      case 'PushEvent':
        return 'default' // blue
      case 'PullRequestEvent':
        return 'destructive' // red
      case 'WatchEvent':
        return 'interest' // gray
      case 'DeleteEvent':
        return 'destructive' // red
      case 'CreateEvent':
        return 'success' // green
      default:
        return 'outline' // default outline
    }
  }

  if (loading) {
    return (

      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-4xl font-bold mb-24 text-center">GitCast</h1>

        <LoaderPinwheelIcon className='animate-spin h-8 w-8' />
        <div className="animate-pulse">
          <p className="text-lg font-medium text-white">{loadingPhrase}...</p>
        </div>
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
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6 text-center">GitCast</h1>
      <div className="space-y-4">
        {feed?.events.map((event) => (
          <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow max-w-full">
            <CardContent className="p-2">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 rounded-full border-2 border-border">
                  <img src={event.actor.avatar_url} alt={event.actor.login} />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{event.actor.login}</span>
                    <Badge
                      variant={getBadgeVariant(event.type)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {getEventIcon(event.type)}
                      {event.action}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground mt-1 overflow-hidden text-ellipsis">
                    {context ? (
                      <p onClick={() => sdk.actions.openUrl(event.repo.url)} className="hover:underline">
                        {event.repo.name}
                      </p>
                    ) : (
                      <a href={event.repo.url} target='_blank' rel="noopner noreferrer" className="hover:underline">
                        {event.repo.name}
                      </a>
                    )}
                  </div>

                  {event.commitMessage && (
                    <p className="mt-2 text-sm bg-muted p-2 rounded-md border border-border overflow-hidden">
                      <span className="line-clamp-3 break-words">{event.commitMessage}</span>
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
        ))}
      </div>
    </div>
  )
}

export default App
