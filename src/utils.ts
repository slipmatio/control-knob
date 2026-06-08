import { MIN_ANGLE, MAX_ANGLE } from '@/constants'

export function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180
}

/**
 * Throttles `func` to at most once per animation frame, always invoking it with
 * the most recent arguments. Keeps high-frequency pointer moves smooth without
 * dropping the final position.
 */
export function rafThrottle<Args extends unknown[]>(func: (...args: Args) => void) {
  let rafId: number | null = null
  let lastArgs: Args | null = null

  const throttled = (...args: Args) => {
    lastArgs = args
    rafId ??= requestAnimationFrame(() => {
      rafId = null
      if (lastArgs) {
        func(...lastArgs)
      }
    })
  }

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
    rafId = null
    lastArgs = null
  }

  return throttled
}

export function changeToControlAngle(startValue: number, change: number, shiftModifier = false) {
  let controlYrange = 150
  if (shiftModifier) {
    controlYrange = controlYrange * 10
  }
  const controlRange = MAX_ANGLE - MIN_ANGLE
  const pixelChange = controlRange / controlYrange
  const controlAngleChange = change * pixelChange

  return controlAngleChange
}

export function controlAngleToValue(minValue: number, maxValue: number, controlAngle: number) {
  let controlPercentage: number
  const controlRange = MAX_ANGLE - MIN_ANGLE
  const valueRange = maxValue - minValue
  if (controlAngle === MIN_ANGLE) {
    controlPercentage = 0
  } else if (controlAngle === MAX_ANGLE) {
    controlPercentage = 1
  } else {
    controlPercentage = (controlAngle - MIN_ANGLE) / controlRange
  }
  return minValue + valueRange * controlPercentage
}

export function valueToControlAngle(minValue: number, maxValue: number, value: number) {
  let valuePercentage: number
  const controlRange = MAX_ANGLE - MIN_ANGLE
  const valueRange = maxValue - minValue

  if (value === minValue) {
    valuePercentage = 0
  } else if (value === maxValue) {
    valuePercentage = 1
  } else {
    valuePercentage = (value - minValue) / valueRange
  }
  return MIN_ANGLE + controlRange * valuePercentage
}
