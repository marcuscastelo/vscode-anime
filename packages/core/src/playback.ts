import type { ObservationResult, PlaybackEvent, PlaybackSession, WatchRecord } from './model.js'

/** Each session belongs to one media item. New playback after end needs a new session id. */
export const observePlayback = (
  previous: PlaybackSession | undefined,
  event: PlaybackEvent,
): ObservationResult<PlaybackSession> => {
  if (!event.sessionId.trim() || !event.showTitle.trim()) {
    return { tag: 'invalid', reason: 'Playback requires a session and show' }
  }
  if (!Number.isFinite(event.episode) || event.episode < 0) {
    return { tag: 'invalid', reason: 'Invalid episode' }
  }
  if (!Number.isFinite(event.positionSeconds) || event.positionSeconds < 0) {
    return { tag: 'invalid', reason: 'Invalid playback position' }
  }
  if (
    !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(event.occurredAt) ||
    !Number.isFinite(Date.parse(event.occurredAt))
  ) {
    return { tag: 'invalid', reason: 'Playback requires a timestamp with an explicit offset' }
  }
  if (
    previous !== undefined &&
    (previous.showTitle !== event.showTitle ||
      previous.episode !== event.episode ||
      previous.sessionId !== event.sessionId)
  ) {
    return { tag: 'invalid', reason: 'A playback session cannot change its media or identity' }
  }
  const elapsed =
    previous === undefined
      ? 0
      : (Date.parse(event.occurredAt) - Date.parse(previous.lastObservedAt)) / 1000
  if (elapsed < 0)
    return { tag: 'invalid', reason: 'Playback events must be chronological within a session' }
  if (previous?.status === 'ended')
    return { tag: 'invalid', reason: 'Ended playback requires a new session' }
  const status =
    event.type === 'position'
      ? (previous?.status ?? 'unknown')
      : event.type === 'play'
        ? 'playing'
        : event.type === 'pause'
          ? 'paused'
          : 'ended'
  return {
    tag: 'ok',
    value: {
      sessionId: event.sessionId,
      showTitle: event.showTitle,
      episode: event.episode,
      firstObservedAt: previous?.firstObservedAt ?? event.occurredAt,
      lastObservedAt: event.occurredAt,
      status,
      positionSeconds: event.positionSeconds,
      furthestPositionSeconds: Math.max(
        previous?.furthestPositionSeconds ?? 0,
        event.positionSeconds,
      ),
      observedPlayingSeconds:
        (previous?.observedPlayingSeconds ?? 0) + (previous?.status === 'playing' ? elapsed : 0),
    },
  }
}

export const projectPlayback = (
  records: readonly WatchRecord[],
): ObservationResult<readonly PlaybackSession[]> => {
  const sessions = new Map<string, PlaybackSession>()
  for (const record of records) {
    if (record.kind !== 'playback') continue
    const result = observePlayback(sessions.get(record.event.sessionId), record.event)
    if (result.tag === 'invalid') return result
    sessions.set(record.event.sessionId, result.value)
  }
  return { tag: 'ok', value: [...sessions.values()] }
}
