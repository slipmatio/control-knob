import { describe, it, beforeEach, afterEach, expect, test, vi } from 'vitest'
import { degToRad, leadingDebounce, changeToControlAngle } from '../../src/utils'
import { MIN_ANGLE, MAX_ANGLE } from '../../src/constants'

const testfn = (a: number) => a + 1

test('degToRad', () => {
  expect(degToRad(0)).toEqual(0)
  expect(degToRad(90)).toEqual(Math.PI / 2)
  expect(degToRad(180)).toEqual(Math.PI)
  expect(degToRad(270)).toEqual(Math.PI * 1.5)
  expect(degToRad(360)).toEqual(Math.PI * 2)
})

describe('leadingDebounce', () => {
  let func = vi.fn()

  beforeEach(() => {
    func = vi.fn()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('debounces', () => {
    const mock = vi.fn().mockImplementation(testfn)
    const debouncedMock = leadingDebounce(func)

    mock(1)
    debouncedMock(1)

    expect(mock).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      mock(1)
      debouncedMock()
    }

    // @ts-expect-error missing typings
    expect(mock.calls.length).toBe(11)
    // @ts-expect-error missing typings
    expect(func.calls.length).toBeLessThan(11)
  })
})

test('changeToControlAngle', () => {
  // up from minimum
  expect(changeToControlAngle(MIN_ANGLE, 0)).toEqual(MIN_ANGLE)
  expect(changeToControlAngle(MIN_ANGLE, -10)).toEqual(MIN_ANGLE)
  expect(changeToControlAngle(MIN_ANGLE, 10)).toEqual(MIN_ANGLE + 20)
  expect(changeToControlAngle(MIN_ANGLE, 200)).toEqual(420)

  // dowm from maximum
  expect(changeToControlAngle(MAX_ANGLE, 0)).toEqual(MAX_ANGLE)
  expect(changeToControlAngle(MAX_ANGLE, 10)).toEqual(MAX_ANGLE)
  expect(changeToControlAngle(MAX_ANGLE, -10)).toEqual(MAX_ANGLE - 20)
  expect(changeToControlAngle(MAX_ANGLE, -200)).toEqual(MIN_ANGLE)

  // misc changes
  expect(changeToControlAngle(200, 0)).toEqual(200)
  expect(changeToControlAngle(200, 10)).toEqual(220)
  expect(changeToControlAngle(200, -10)).toEqual(180)
})
