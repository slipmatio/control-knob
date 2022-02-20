<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { degToRad, leadingDebounce, changeToControlAngle } from '@/utils'
import { RADIUS, HALF_VIEWBOX, MIN_ANGLE, MAX_ANGLE } from '@/constants'

const knob = ref<HTMLElement>(0 as unknown as HTMLElement)
const controlAngle = ref(MIN_ANGLE)
const tickLength = ref(18)
const tickOffset = ref(10)
const lineStroke = ref(3)
const imageSize = ref(40)
const rimStroke = ref(11)
const valueArchStroke = ref(11)
const bgRadius = ref(34)
const shiftModifier = ref(false)
// const stepSize = 1

const tickStartX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickLength.value)
})

const tickStartY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickLength.value)
})

const tickEndX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickOffset.value)
})

const tickEndY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickOffset.value)
})

const rimStartX = HALF_VIEWBOX + -0.5 * RADIUS
const rimStartY = HALF_VIEWBOX + Math.sin(degToRad(120)) * RADIUS
const rimEndX = HALF_VIEWBOX + 0.5 * RADIUS
const rimEndY = HALF_VIEWBOX + Math.sin(degToRad(420)) * RADIUS

const startRad = degToRad(120)
const currentValueRad = computed(() => degToRad(controlAngle.value))
const largeArch = computed(() => (Math.abs(startRad - currentValueRad.value) < Math.PI ? 0 : 1))
const sweep = ref(1)
// const sweep = computed(() => (currentValueRad.value < startRad ? 0 : 1))

const valueEndX = computed(() => 50 + Math.cos(degToRad(controlAngle.value)) * RADIUS)
const valueEndY = computed(() => 50 + Math.sin(degToRad(controlAngle.value)) * RADIUS)

const rim = `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 1 1 ${rimEndX} ${rimEndY}`
const valueArch = computed(
  () =>
    `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 ${largeArch.value} ${sweep.value} ${valueEndX.value} ${valueEndY.value}`
)

let startY = 0
let prevY = 0
let currentY = 0
let yChange = 0
let startValue = 0
const mouseIsDown = ref(false)
const mouseMoved = ref(false)

const downListener = (event: MouseEvent) => {
  mouseIsDown.value = true
  mouseMoved.value = false
  startY = event.clientY
  prevY = event.clientY
  startValue = controlAngle.value
  // console.log('event: ', event)
}
const moveListener = leadingDebounce((event: MouseEvent) => {
  mouseMoved.value = true
  if (mouseIsDown.value) {
    currentY = event.clientY
    let direction: 'up' | 'down'
    const curYchange = prevY - currentY
    // const curAbsolutechange = startY - currentY

    if (curYchange < 0) {
      direction = 'down'
    } else {
      direction = 'up'
    }

    // console.log(
    //   `move. direction: ${direction}, curYchange: ${curYchange}, yChange: ${yChange}, prevY: ${prevY}, currentY: ${currentY}`
    // )

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

      yChange = curYchange
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

function setShiftModifier(event: KeyboardEvent) {
  if (event.key === 'Shift') {
    shiftModifier.value = true
  }
}

function unsetShiftModifier(event: KeyboardEvent) {
  if (event.key === 'Shift') {
    shiftModifier.value = false
  }
}

watch(
  () => knob.value,
  (element) => {
    if (element) {
      element.addEventListener('mousedown', downListener)
      document.addEventListener('mouseup', upListener)
      document.addEventListener('mousemove', moveListener)
      document.addEventListener('keydown', setShiftModifier)
      document.addEventListener('keyup', unsetShiftModifier)
    }
  }
)

onBeforeUnmount(() => {
  console.log('before unmount')
  knob.value.removeEventListener('mousedown', downListener)
  document.removeEventListener('mouseup', upListener)
  document.removeEventListener('mousemove', moveListener)
  document.removeEventListener('keydown', setShiftModifier)
  document.removeEventListener('keyup', unsetShiftModifier)
})
</script>
<template>
  <svg
    :width="imageSize"
    :height="imageSize"
    viewBox="0 0 100 100"
    ref="knob"
    class="select-none"
    @click.alt="resetValue"
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
      :stroke-width="lineStroke"
    />

    <text
      v-if="controlAngle > 120"
      :x="50"
      :y="62"
      text-anchor="middle"
      fill="currentColor"
      class="text-gray-50 text-[30px] font-normal font-mono"
    >
      {{ Math.ceil(controlAngle / 10) }}
    </text>
  </svg>
</template>
