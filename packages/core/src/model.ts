export type EpisodeObservation = Readonly<{ episode: number; completed: boolean }>

export type WatchTime =
  | Readonly<{ kind: 'instant'; at: string }>
  | Readonly<{ kind: 'local'; date: string; time: string }>

export type ManualWatch = EpisodeObservation &
  Readonly<{
    showTitle: string
    startedAt: WatchTime
    endedAt: WatchTime
    people: readonly string[]
  }>

export type PlaybackEvent = Readonly<{
  type: 'play' | 'pause' | 'position' | 'end'
  sessionId: string
  showTitle: string
  episode: number
  /** ISO 8601 instant with explicit offset, supplied by the observer. */
  occurredAt: string
  positionSeconds: number
}>

export type WatchRecord =
  | Readonly<{ kind: 'manual'; watch: ManualWatch }>
  | Readonly<{ kind: 'playback'; event: PlaybackEvent }>

export type PlaybackSession = Readonly<{
  sessionId: string
  showTitle: string
  episode: number
  firstObservedAt: string
  lastObservedAt: string
  status: 'unknown' | 'playing' | 'paused' | 'ended'
  positionSeconds: number
  furthestPositionSeconds: number
  /** Observed wall time while playing, not media coverage across seeks or buffering. */
  observedPlayingSeconds: number
}>

export type InvalidObservation = Readonly<{ tag: 'invalid'; reason: string }>
export type ObservationResult<T> = Readonly<{ tag: 'ok'; value: T }> | InvalidObservation

/** Partial manual observations never advance the completed episode. Rewatch does not regress it. */
export const nextEpisode = (observations: readonly EpisodeObservation[]): number =>
  observations.reduce(
    (latest, item) => (item.completed ? Math.max(latest, item.episode) : latest),
    0,
  ) + 1
