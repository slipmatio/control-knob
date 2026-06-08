import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest'
import { MAX_ANGLE, MIN_ANGLE } from '@/constants'
import { changeToControlAngle, controlAngleToValue, degToRad, rafThrottle } from '@/utils'

test('degToRad', () => {
  expect(degToRad(0)).toEqual(0)
  expect(degToRad(90)).toEqual(Math.PI / 2)
  expect(degToRad(180)).toEqual(Math.PI)
  expect(degToRad(270)).toEqual(Math.PI * 1.5)
  expect(degToRad(360)).toEqual(Math.PI * 2)
})

describe('rafThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs once per frame with the latest arguments', () => {
    const func = vi.fn()
    const throttled = rafThrottle(func)

    throttled(1)
    throttled(2)
    throttled(3)
    expect(func).not.toHaveBeenCalled()

    vi.advanceTimersToNextFrame()
    expect(func).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledWith(3)
  })

  it('cancel prevents a pending call', () => {
    const func = vi.fn()
    const throttled = rafThrottle(func)

    throttled(1)
    throttled.cancel()

    vi.advanceTimersToNextFrame()
    expect(func).not.toHaveBeenCalled()
  })
})

test('changeToControlAngle', () => {
  // up from minimum
  expect(changeToControlAngle(MIN_ANGLE, 0, false)).toEqual(0)
  expect(changeToControlAngle(MIN_ANGLE, 0, true)).toEqual(0)
  expect(changeToControlAngle(MIN_ANGLE, -10, false)).toEqual(-20)
  expect(changeToControlAngle(MIN_ANGLE, -10, true)).toEqual(-2)
  expect(changeToControlAngle(MIN_ANGLE, 10, false)).toEqual(20)
  expect(changeToControlAngle(MIN_ANGLE, 10, true)).toEqual(2)
  expect(changeToControlAngle(MIN_ANGLE, 200, false)).toEqual(400)
  expect(changeToControlAngle(MIN_ANGLE, 200, true)).toEqual(40)

  // dowm from maximum
  expect(changeToControlAngle(MAX_ANGLE, 0, false)).toEqual(0)
  expect(changeToControlAngle(MAX_ANGLE, 0, true)).toEqual(0)
  expect(changeToControlAngle(MAX_ANGLE, 10, false)).toEqual(20)
  expect(changeToControlAngle(MAX_ANGLE, 10, true)).toEqual(2)
  expect(changeToControlAngle(MAX_ANGLE, -10, false)).toEqual(-20)
  expect(changeToControlAngle(MAX_ANGLE, -10, true)).toEqual(-2)
  expect(changeToControlAngle(MAX_ANGLE, -200, false)).toEqual(-400)
  expect(changeToControlAngle(MAX_ANGLE, -200, true)).toEqual(-40)

  // misc changes
  expect(changeToControlAngle(200, 0, false)).toEqual(0)
  expect(changeToControlAngle(200, 0, true)).toEqual(0)
  expect(changeToControlAngle(200, 30, false)).toEqual(60)
  expect(changeToControlAngle(200, 30, true)).toEqual(6)
  expect(changeToControlAngle(200, -30, false)).toEqual(-60)
  expect(changeToControlAngle(200, -30, true)).toEqual(-6)
})

test('controlAngleToValue', () => {
  // 0-100
  expect(controlAngleToValue(0, 100, 120)).toEqual(0)
  expect(controlAngleToValue(0, 100, 270)).toEqual(50)
  expect(controlAngleToValue(0, 100, 420)).toEqual(100)
  // -64-64
  expect(controlAngleToValue(-64, 64, 120)).toEqual(-64)
  expect(controlAngleToValue(-64, 64, 270)).toEqual(0)
  expect(controlAngleToValue(-64, 64, 420)).toEqual(64)
})
