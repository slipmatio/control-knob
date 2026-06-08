<script setup lang="ts">
import { HALF_VIEWBOX, MAX_ANGLE, MIN_ANGLE, RADIUS } from '@/constants'
import type { ControlKnobOptions } from '@/types'
import {
  changeToControlAngle,
  controlAngleToValue,
  degToRad,
  quantize,
  rafThrottle,
  valueToControlAngle,
} from '@/utils'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ options?: ControlKnobOptions }>()
const modelValue = defineModel<number>({ default: 0 })

const defaultOptions: Required<ControlKnobOptions> = {
  imageSize: 40,
  minValue: 0,
  maxValue: 100,
  defaultValue: 0,
  step: 0,
  formatValue: (value) => String(Math.round(value)),
  showTick: true,
  showValue: true,
  hideDefaultValue: true,
  tickLength: 18,
  tickOffset: 10,
  tickStroke: 3,
  rimStroke: 11,
  valueArchStroke: 11,
  bgRadius: 34,
  wheelFactor: 10,
  keyFactor: 10,
  tabIndex: 0,
  ariaLabel: 'Knob',
  valueTextX: 50,
  valueTextY: 50,
  fontSize: 30,
  svgClass: 'select-none',
  bgClass: 'text-[#868686]',
  rimClass: 'text-[#393939]',
  valueArchClass: 'text-[#53d769]',
  tickClass: 'text-black',
  valueTextClass: 'text-gray-50 font-normal font-mono',
  passiveEvents: false,
}

const knobOptions = computed<Required<ControlKnobOptions>>(() => {
  const overrides = Object.entries(props.options ?? {}).filter(([, value]) => value !== undefined)
  return { ...defaultOptions, ...Object.fromEntries(overrides) }
})

function getControlAngle(value: number) {
  return valueToControlAngle(knobOptions.value.minValue, knobOptions.value.maxValue, value)
}

const controlAngle = ref(getControlAngle(modelValue.value))

const angleRad = computed(() => degToRad(controlAngle.value))
const cosAngle = computed(() => Math.cos(angleRad.value))
const sinAngle = computed(() => Math.sin(angleRad.value))

const tick = computed(() => {
  const { tickLength, tickOffset } = knobOptions.value
  return {
    x1: HALF_VIEWBOX + cosAngle.value * (RADIUS - tickLength),
    y1: HALF_VIEWBOX + sinAngle.value * (RADIUS - tickLength),
    x2: HALF_VIEWBOX + cosAngle.value * (RADIUS - tickOffset),
    y2: HALF_VIEWBOX + sinAngle.value * (RADIUS - tickOffset),
  }
})

const startRad = degToRad(MIN_ANGLE)
const rimStartX = HALF_VIEWBOX - 0.5 * RADIUS
const rimStartY = HALF_VIEWBOX + Math.sin(startRad) * RADIUS
const rimEndX = HALF_VIEWBOX + 0.5 * RADIUS
const rimEndY = HALF_VIEWBOX + Math.sin(degToRad(MAX_ANGLE)) * RADIUS
const rim = `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 1 1 ${rimEndX} ${rimEndY}`

const valueArch = computed(() => {
  const endX = HALF_VIEWBOX + cosAngle.value * RADIUS
  const endY = HALF_VIEWBOX + sinAngle.value * RADIUS
  // SVG large-arc flag: 1 once the swept angle exceeds a half turn.
  const largeArc = Math.abs(startRad - angleRad.value) < Math.PI ? 0 : 1
  return `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${endX} ${endY}`
})

const valueText = computed(() => knobOptions.value.formatValue(modelValue.value))
const showValueText = computed(() => {
  const { showValue, hideDefaultValue, defaultValue } = knobOptions.value
  return showValue && (!hideDefaultValue || modelValue.value !== defaultValue)
})

function changeValue(angle: number) {
  const { minValue, maxValue, step } = knobOptions.value
  const clampedAngle = Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, angle))
  const value = quantize(minValue, maxValue, step, controlAngleToValue(minValue, maxValue, clampedAngle))
  modelValue.value = value
  // Re-derive the angle from the (possibly snapped) value so the tick and arch land on the step.
  controlAngle.value = step ? getControlAngle(value) : clampedAngle
}

function resetValue() {
  changeValue(getControlAngle(knobOptions.value.defaultValue))
}

/** Prevents the page from scrolling while interacting, unless `passiveEvents` is set. */
function preventScrolling(event: Event) {
  if (!knobOptions.value.passiveEvents) {
    event.preventDefault()
    event.stopPropagation()
  }
}

const pointerIsDown = ref(false)
let prevY = 0

const applyDrag = rafThrottle((clientY: number, shiftKey: boolean) => {
  const yChange = prevY - clientY
  prevY = clientY
  if (yChange !== 0) {
    changeValue(controlAngle.value + changeToControlAngle(prevY, yChange, shiftKey))
  }
})

function onPointerDown(event: PointerEvent) {
  pointerIsDown.value = true
  prevY = event.clientY
  // Capture keeps move/up events flowing even when the pointer leaves the knob.
  const target = event.target as Element
  target.setPointerCapture(event.pointerId)
  preventScrolling(event)
}

function onPointerMove(event: PointerEvent) {
  if (!pointerIsDown.value) {
    return
  }
  preventScrolling(event)
  applyDrag(event.clientY, event.shiftKey)
}

function onPointerUp() {
  pointerIsDown.value = false
}

function onWheel(event: WheelEvent) {
  const step = event.shiftKey ? 1 : knobOptions.value.wheelFactor
  const scrollingUp = event.shiftKey ? event.deltaX < 0 : event.deltaY < 0
  changeValue(controlAngle.value + (scrollingUp ? step : -step))
  preventScrolling(event)
}

function onKeyDown(event: KeyboardEvent) {
  const step = event.shiftKey ? 1 : knobOptions.value.keyFactor
  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowRight':
      changeValue(controlAngle.value + step)
      break
    case 'ArrowDown':
    case 'ArrowLeft':
      changeValue(controlAngle.value - step)
      break
    case 'Home':
      changeValue(MIN_ANGLE)
      break
    case 'End':
      changeValue(MAX_ANGLE)
      break
    default:
      return
  }
  preventScrolling(event)
}

watch(
  () => [modelValue.value, knobOptions.value.minValue, knobOptions.value.maxValue] as const,
  ([value]) => {
    if (!pointerIsDown.value) {
      controlAngle.value = getControlAngle(value)
    }
  },
)

onBeforeUnmount(() => applyDrag.cancel())
</script>

<template>
  <svg
    :width="knobOptions.imageSize"
    :height="knobOptions.imageSize"
    viewBox="0 0 100 100"
    role="slider"
    :aria-label="knobOptions.ariaLabel"
    :aria-valuemin="knobOptions.minValue"
    :aria-valuemax="knobOptions.maxValue"
    :aria-valuenow="modelValue"
    :aria-valuetext="valueText"
    aria-orientation="vertical"
    :tabindex="knobOptions.tabIndex"
    :class="knobOptions.svgClass"
    @click.alt="resetValue"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @lostpointercapture="onPointerUp"
    @wheel="onWheel"
    @keydown="onKeyDown"
  >
    <circle
      :cx="HALF_VIEWBOX"
      :cy="HALF_VIEWBOX"
      :r="knobOptions.bgRadius"
      stroke="currentColor"
      fill="currentColor"
      :class="knobOptions.bgClass"
      :stroke-width="1"
    />

    <path
      :d="rim"
      :stroke-width="knobOptions.rimStroke"
      stroke="currentColor"
      fill="none"
      :class="knobOptions.rimClass"
    />

    <path
      v-if="controlAngle > MIN_ANGLE"
      :d="valueArch"
      :stroke-width="knobOptions.valueArchStroke"
      stroke="currentColor"
      fill="none"
      :class="knobOptions.valueArchClass"
    />

    <line
      v-if="knobOptions.showTick"
      :x1="tick.x1"
      :y1="tick.y1"
      :x2="tick.x2"
      :y2="tick.y2"
      stroke="currentColor"
      :stroke-width="knobOptions.tickStroke"
      :class="knobOptions.tickClass"
    />

    <text
      v-if="showValueText"
      :x="knobOptions.valueTextX"
      :y="knobOptions.valueTextY"
      :font-size="knobOptions.fontSize"
      text-anchor="middle"
      dominant-baseline="central"
      fill="currentColor"
      :class="knobOptions.valueTextClass"
    >
      {{ valueText }}
    </text>
  </svg>
</template>
