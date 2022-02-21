<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { degToRad, leadingDebounce, changeToControlAngle, controlAngleToValue } from '@/utils'
import { RADIUS, HALF_VIEWBOX, MIN_ANGLE, MAX_ANGLE } from '@/constants'

const knob = ref<HTMLElement>(0 as unknown as HTMLElement)
const controlAngle = ref(MIN_ANGLE)

interface Props {
  options?: {
    imageSize?: number
    tickLength?: number
    tickOffset?: number
    tickStroke?: number
    rimStroke?: number
    valueArchStroke?: number
    bgRadius?: number
    minValue?: number
    maxValue?: number
    wheelFactor?: number
    keyFactor?: number
  }
}

const props = defineProps<Props>()

const imageSize = props.options?.imageSize || 40
const tickLength = props.options?.tickLength || 18
const tickOffset = props.options?.tickOffset || 10
const tickStroke = props.options?.tickStroke || 3
const rimStroke = props.options?.rimStroke || 11
const valueArchStroke = props.options?.valueArchStroke || 11
const bgRadius = props.options?.bgRadius || 34
const knobMinValue = props.options?.minValue || 0
const knobMaxValue = props.options?.maxValue || 100
const wheelModifierFactor = props.options?.wheelFactor || 10
const keyModifierFactor = props.options?.keyFactor || 10

const focused = ref(false)
const knobValue = ref(0)
const shiftModifier = ref(false)

const tickStartX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickLength)
})

const tickStartY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickLength)
})

const tickEndX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickOffset)
})

const tickEndY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickOffset)
})

const rimStartX = HALF_VIEWBOX + -0.5 * RADIUS
const rimStartY = HALF_VIEWBOX + Math.sin(degToRad(120)) * RADIUS
const rimEndX = HALF_VIEWBOX + 0.5 * RADIUS
const rimEndY = HALF_VIEWBOX + Math.sin(degToRad(420)) * RADIUS

const startRad = degToRad(120)
const currentValueRad = computed(() => degToRad(controlAngle.value))
const largeArch = computed(() => (Math.abs(startRad - currentValueRad.value) < Math.PI ? 0 : 1))
const sweep = ref(1)

const valueEndX = computed(() => 50 + Math.cos(degToRad(controlAngle.value)) * RADIUS)
const valueEndY = computed(() => 50 + Math.sin(degToRad(controlAngle.value)) * RADIUS)

const rim = `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 1 1 ${rimEndX} ${rimEndY}`
const valueArch = computed(
  () =>
    `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 ${largeArch.value} ${sweep.value} ${valueEndX.value} ${valueEndY.value}`
)

let prevY = 0
let currentY = 0
const mouseIsDown = ref(false)
const mouseMoved = ref(false)

const downListener = (event: MouseEvent) => {
  mouseIsDown.value = true
  mouseMoved.value = false
  prevY = event.clientY
}
const moveListener = leadingDebounce((event: MouseEvent) => {
  mouseMoved.value = true
  if (mouseIsDown.value) {
    currentY = event.clientY
    let direction: 'up' | 'down'
    const curYchange = prevY - currentY

    if (curYchange < 0) {
      direction = 'down'
    } else {
      direction = 'up'
    }

    if (
      prevY !== currentY &&
      ((direction === 'up' && controlAngle.value < MAX_ANGLE) ||
        (direction === 'down' && controlAngle.value > MIN_ANGLE))
    ) {
      const change = changeToControlAngle(prevY, curYchange, shiftModifier.value)

      if (controlAngle.value + change < MIN_ANGLE) {
        controlAngle.value = MIN_ANGLE
      } else if (controlAngle.value + change > MAX_ANGLE) {
        controlAngle.value = MAX_ANGLE
      } else {
        controlAngle.value += change
      }

      knobValue.value = controlAngleToValue(knobMinValue, knobMaxValue, controlAngle.value)
    }
    prevY = currentY
  }
})

const upListener = () => {
  mouseIsDown.value = false
}

function resetValue() {
  controlAngle.value = MIN_ANGLE
}

function changeValue(change: number) {
  if (change > controlAngle.value) {
    if (change < MAX_ANGLE) {
      controlAngle.value = change
    } else {
      controlAngle.value = MAX_ANGLE
    }
  }

  if (change < controlAngle.value) {
    if (change < controlAngle.value && change > MIN_ANGLE) {
      controlAngle.value = change
    } else {
      controlAngle.value = MIN_ANGLE
    }
  }
  knobValue.value = controlAngleToValue(knobMinValue, knobMaxValue, controlAngle.value)
}

function keyDownListener(event: KeyboardEvent) {
  if (event.key === 'Shift') {
    shiftModifier.value = true
  }

  if (
    focused.value &&
    shiftModifier.value &&
    (event.key === 'ArrowUp' || event.key === 'ArrowDown')
  ) {
    event.preventDefault()
  }
}

function keyUpListener(event: KeyboardEvent) {
  if (event.key === 'Shift') {
    shiftModifier.value = false
  }

  let newValue: number
  const keyModifier = shiftModifier.value ? 1 : keyModifierFactor
  if (focused.value && event.key === 'ArrowUp') {
    newValue = controlAngle.value + 1 * keyModifier
    changeValue(newValue)
    if (shiftModifier.value) {
      event.stopPropagation()
    }
  }

  if (focused.value && event.key === 'ArrowDown') {
    newValue = controlAngle.value - 1 * keyModifier
    changeValue(newValue)
  }
}

function wheelListener(event: WheelEvent) {
  let newValue: number
  const wheelModifier = event.shiftKey ? 1 : wheelModifierFactor
  if ((!event.shiftKey && event.deltaY < 0) || (event.shiftKey && event.deltaX < 0)) {
    newValue = controlAngle.value + 1 * wheelModifier
  } else {
    newValue = controlAngle.value - 1 * wheelModifier
  }
  changeValue(newValue)
}

watch(
  () => knob.value,
  (element) => {
    if (element) {
      element.addEventListener('mousedown', downListener)
      element.addEventListener('wheel', wheelListener)
      document.addEventListener('mouseup', upListener)
      document.addEventListener('mousemove', moveListener)
      document.addEventListener('keydown', keyDownListener)
      document.addEventListener('keyup', keyUpListener)
      knobValue.value = controlAngleToValue(knobMinValue, knobMaxValue, controlAngle.value)
    }
  }
)

onBeforeUnmount(() => {
  console.log('before unmount')
  knob.value.removeEventListener('mousedown', downListener)
  knob.value.removeEventListener('wheel', wheelListener)
  document.removeEventListener('mouseup', upListener)
  document.removeEventListener('mousemove', moveListener)
  document.removeEventListener('keydown', keyDownListener)
  document.removeEventListener('keyup', keyUpListener)
})
</script>
<template>
  <svg
    :width="imageSize"
    :height="imageSize"
    viewBox="0 0 100 100"
    ref="knob"
    @click.alt="resetValue"
    role="slider"
    aria-label="Knob"
    :aria-valuemin="knobMinValue"
    :aria-valuemax="knobMaxValue"
    :aria-valuenow="knobValue"
    class="select-none focus:outline-none focus:ring-2 focus:ring-green-500"
    tabindex="0"
    @focus="focused = true"
    @blur="focused = false"
  >
    <circle
      :cx="HALF_VIEWBOX"
      :cy="HALF_VIEWBOX"
      :r="bgRadius"
      stroke="#868686"
      fill="#868686"
      :stroke-width="1"
    />

    <path
      :d="rim"
      :stroke-width="rimStroke"
      stroke="currentColor"
      class=""
      style="color: #393939"
      fill="none"
    ></path>

    <path
      v-if="controlAngle > 120"
      :d="valueArch"
      :stroke-width="valueArchStroke"
      stroke="currentColor"
      class=""
      style="color: #53d769"
      fill="none"
    ></path>

    <line
      :x1="tickStartX"
      :y1="tickStartY"
      :x2="tickEndX"
      :y2="tickEndY"
      stroke="black"
      :stroke-width="tickStroke"
    />

    <text
      v-if="controlAngle > 120"
      :x="50"
      :y="62"
      text-anchor="middle"
      fill="currentColor"
      class="text-gray-50 text-[30px] font-normal font-mono"
    >
      {{ Math.ceil(knobValue) }}
    </text>
  </svg>
</template>
