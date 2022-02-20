import { MIN_ANGLE, MAX_ANGLE } from '@/constants'

export function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180
}

export function leadingDebounce<A = unknown, R = void>(func: (args: A) => R, timeout = 13) {
  let timer: NodeJS.Timeout | undefined
  return (...args: A[]) => {
    if (!timer) {
      // @ts-expect-error FIXME: couldn't figure this one out!
      func.apply(this, args)
    } else {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = undefined
    }, timeout)
  }
}

export function changeToControlAngle(startValue: number, change: number) {
  const controlRange = MAX_ANGLE - MIN_ANGLE
  const controlYrange = 150
  const pixelChange = controlRange / controlYrange
  const controlAngleChange = change * pixelChange

  let absoluteValue = startValue + controlAngleChange
  if (absoluteValue < 120) {
    absoluteValue = 120
  }

  if (absoluteValue > 420) {
    absoluteValue = 420
  }

  return absoluteValue
}
