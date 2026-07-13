export type Clock = Readonly<{ now: () => Date }>

export const systemClock: Clock = { now: () => new Date() }

const twoDigits = (value: number): string => String(value).padStart(2, '0')

export const formatLocalDate = (date: Date): string =>
  `${twoDigits(date.getDate())}/${twoDigits(date.getMonth() + 1)}/${date.getFullYear()}`

export const formatLocalTime = (date: Date): string =>
  `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`
