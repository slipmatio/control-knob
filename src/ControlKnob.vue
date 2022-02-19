<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
const ready = ref(false)

// PI radians = 180 degrees
// 2PI radians = 360 degrees
// 1 radian = 180/PI degrees = 57.2957795 degrees

const RADIUS = 40
const MID_X = 50
const MID_Y = 50
const rad = 180 / Math.PI
const controlAngle = ref(0)
// const strokeWidth = 1

const origo = {
  x: MID_X,
  y: MID_Y,
}

// const MIN_DEGREES = 60
// const MIN_RADIANS = (Math.PI * radian) / 3
// const MAX_DEGREES = 300
// const MAX_RADIANS = 4 * Math.PI * radian

// const secondaryColor = '#dcdfe6'
// const stepSize = 1

// const minX = computed(() => MID_X + Math.cos(MIN_RADIANS) * RADIUS)
// const minY = computed(() => MID_Y - Math.sin(MIN_RADIANS) * RADIUS)
// const maxX = computed(() => MID_X + Math.cos(MAX_RADIANS) * RADIUS)
// const maxY = computed(() => MID_Y - Math.sin(MAX_RADIANS) * RADIUS)

// const firstLine = `M ${origo.x},${origo.y} L ${origo.x + RADIUS},50`

function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180
}

const cosLine = `M ${origo.x},${origo.y} L ${50 + Math.cos(-Math.PI) * -RADIUS * 2 + 10},50`
const sinLine = `M ${origo.x},${origo.y} L ${50 + Math.sin(Math.PI / 2) * RADIUS * 2 + 10},50`

// const angle = ((1 * Math.PI) / 4) * rad
const angle1 = 60
const angle2 = 120

const rad1 = Math.PI / 3
const rad2 = (2 * Math.PI) / 3

// const thirdLine = `M ${origo.x},${origo.y} L ${RADIUS * Math.cos(angle)},${
//   RADIUS * Math.sin(angle)
// }`
const thirdLine = computed(
  () =>
    `M ${origo.x},${origo.y} L ${50 + Math.cos(degToRad(controlAngle.value)) * RADIUS},${
      50 + Math.sin(degToRad(controlAngle.value)) * RADIUS
    }`
)
const line1 = computed(
  () => `M ${origo.x},${origo.y} L ${50 + Math.cos(rad1) * RADIUS},${50 + Math.sin(rad1) * RADIUS}`
)
const line2 = computed(
  () => `M ${origo.x},${origo.y} L ${50 + Math.cos(rad2) * RADIUS},${50 + Math.sin(rad2) * RADIUS}`
)

const lineEndX = computed(() => {
  return 50 + Math.cos(degToRad(controlAngle.value)) * RADIUS
})

const lineEndY = computed(() => {
  return 50 + Math.sin(degToRad(controlAngle.value)) * RADIUS
})

// const rangePath = computed(
//   () => `M ${minX.value} ${minY.value} A ${RADIUS} ${RADIUS} 0 1 1 ${maxX.value} ${maxY.value}`
// )

onMounted(() => {
  ready.value = true
})
</script>
<template>
  <div>
    <p>angle: {{ controlAngle }}</p>
    <input type="range" min="0" max="360" v-model="controlAngle" />
  </div>

  <div class="flex flex-row space-x-4">
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle cx="50" cy="50" r="40" stroke="red" fill="transparent" stroke-width="1" />
    </svg>
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle cx="50" cy="50" r="40" stroke="red" fill="transparent" stroke-width="1" />
      <circle cx="50" cy="50" r="40" stroke="red" fill="transparent" stroke-width="1" />
      <path
        :d="cosLine"
        :stroke-width="3"
        stroke="currentColor"
        class="text-blue-600"
        fill="transparent"
      ></path>
    </svg>
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle cx="50" cy="50" r="40" stroke="red" fill="transparent" stroke-width="1" />
      <path
        :d="sinLine"
        :stroke-width="3"
        stroke="currentColor"
        class="text-blue-600"
        fill="transparent"
      ></path>
    </svg>
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle cx="50" cy="50" r="40" stroke="red" fill="transparent" stroke-width="1" />
      <path
        :d="thirdLine"
        :stroke-width="3"
        stroke="currentColor"
        class="text-blue-600"
        fill="transparent"
      ></path>
    </svg>
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle cx="50" cy="50" r="40" stroke="red" fill="transparent" stroke-width="1" />
      <line x1="50" y1="50" :x2="lineEndX" :y2="lineEndY" stroke="black" stroke-width="2" />
    </svg>
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle cx="50" cy="50" r="40" stroke="red" fill="transparent" stroke-width="1" />
      <path
        :d="line1"
        :stroke-width="3"
        stroke="currentColor"
        class="text-blue-600"
        fill="transparent"
      ></path>
      <path
        :d="line2"
        :stroke-width="3"
        stroke="currentColor"
        class="text-blue-600"
        fill="transparent"
      ></path>
    </svg>
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle cx="50" cy="50" r="40" stroke="red" fill="transparent" stroke-width="1" />
      <line x1="50" y1="50" :x2="lineEndX" :y2="lineEndY" stroke="black" stroke-width="2" />
    </svg>
  </div>

  <div>
    <table>
      <thead>
        <th>var</th>
        <th>val</th>
      </thead>
      <tbody>
        <tr>
          <td>cosLine</td>
          <td>{{ cosLine }}</td>
        </tr>
        <tr>
          <td>sinLine</td>
          <td>{{ sinLine }}</td>
        </tr>
        <tr>
          <td>thirdLine</td>
          <td>{{ thirdLine }}</td>
        </tr>
        <tr>
          <td>line</td>
          <td>{{ lineEndX }},{{ lineEndY }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
