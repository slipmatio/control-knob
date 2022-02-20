<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const knob = ref<HTMLElement>(0 as unknown as HTMLElement)
const RADIUS = 40
const IMAGE_VIEWBOX = 100
const HALF_VIEWBOX = IMAGE_VIEWBOX / 2
const minControlAngle = 120
const maxControlAngle = 420
const controlAngle = ref(minControlAngle)
const tickLength = ref(18)
const tickOffset = ref(10)
const lineStroke = ref(3)
const imageSize = ref(40)
const rimStroke = ref(11)
const valueArchStroke = ref(11)
const bgRadius = ref(34)
// const stepSize = 1

function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180
}

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
let currentY = 0
let yChange = 0
let startValue = 0
let absoluteValue = 120
const mouseIsDown = ref(false)
const mouseMoved = ref(false)

function debounceLeading(func: any, timeout = 10) {
  let timer: any
  return (...args: any) => {
    if (!timer) {
      func.apply(this, args)
    }
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
    }, timeout)
  }
}

function changeToControlAngle(change: number) {
  const controlRange = maxControlAngle - minControlAngle
  const controlYrange = 180

  const pixelChange = controlRange / controlYrange

  // 200px => 400
  // 1px = 300 / 400

  const controlAngleChange = change * pixelChange
  console.log('controlAngleChange absolute value: ', controlAngleChange)

  absoluteValue = startValue + controlAngleChange
  if (absoluteValue < 120) {
    absoluteValue = 120
  }

  if (absoluteValue > 420) {
    absoluteValue = 420
  }

  console.log('controlAngle absolute value: ', absoluteValue)
  controlAngle.value = absoluteValue
}

const downListener = (event: MouseEvent) => {
  mouseIsDown.value = true
  mouseMoved.value = false
  startY = event.clientY
  startValue = controlAngle.value
  console.log('event: ', event)
}
const moveListener = debounceLeading((event: MouseEvent) => {
  mouseMoved.value = true

  if (mouseIsDown.value) {
    currentY = event.clientY
    const curYchange = startY - currentY
    if (curYchange !== yChange) {
      yChange = curYchange
      changeToControlAngle(yChange)
      console.log('movinn. y change: ', curYchange, yChange)
    }
  }
})

const upListener = () => {
  mouseIsDown.value = false

  if (mouseMoved.value) {
    console.log('moved')
  } else {
    console.log('not moved')
  }
}

watch(
  () => knob.value,
  (element) => {
    if (element) {
      console.log('knob is mounted', element)
      element.addEventListener('mousedown', downListener)
      document.addEventListener('mouseup', upListener)
      document.addEventListener('mousemove', moveListener)
    } else {
      console.log('knob element', element)
    }
  }
)

onBeforeUnmount(() => {
  console.log('before unmount')

  knob.value.removeEventListener('mousedown', downListener)
  document.removeEventListener('mouseup', upListener)
  document.removeEventListener('mousemove', moveListener)
})
</script>
<template>
  <svg :width="imageSize" :height="imageSize" viewBox="0 0 100 100" ref="knob" class="select-none">
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
