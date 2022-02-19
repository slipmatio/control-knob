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
const controlAngle = ref(120)
const lineLength = ref(25)
const lineOffset = ref(10)
const lineStroke = ref(4)
const imageSize = ref(100)
const circleWidth = ref(2)
const rimWidth = ref(12)
// const strokeWidth = 1

const origo = {
  x: MID_X,
  y: MID_Y,
}

// const stepSize = 1
// const firstLine = `M ${origo.x},${origo.y} L ${origo.x + RADIUS},50`

function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180
}

const cosLine = `M ${origo.x},${origo.y} L ${50 + Math.cos(-Math.PI) * -RADIUS * 2 + 10},50`
const sinLine = `M ${origo.x},${origo.y} L ${50 + Math.sin(Math.PI / 2) * RADIUS * 2 + 10},50`

// const angle = ((1 * Math.PI) / 4) * rad
// const angle1 = 60
// const angle2 = 120

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

const lineStartX = computed(() => {
  return 50 + Math.cos(degToRad(controlAngle.value)) * (RADIUS - lineLength.value)
})

const lineStartY = computed(() => {
  return 50 + Math.sin(degToRad(controlAngle.value)) * (RADIUS - lineLength.value)
})

const lineEndX = computed(() => {
  return 50 + Math.cos(degToRad(controlAngle.value)) * (RADIUS - lineOffset.value)
})

const lineEndY = computed(() => {
  return 50 + Math.sin(degToRad(controlAngle.value)) * (RADIUS - lineOffset.value)
})

const rimStartX = 50 + Math.cos(degToRad(120)) * RADIUS
const rimStartY = 50 + Math.sin(degToRad(120)) * RADIUS
const rimEndX = 50 + Math.cos(degToRad(420)) * RADIUS
const rimEndY = 65 + Math.cos(degToRad(420)) * RADIUS

const rim = `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 60 1 1 ${rimEndX} ${rimEndY}`

// const rangePath = computed(
//   () => `M ${minX.value} ${minY.value} A ${RADIUS} ${RADIUS} 0 1 1 ${maxX.value} ${maxY.value}`
// )

onMounted(() => {
  ready.value = true
})
</script>
<style>
.knob {
  width: --imageSize;
}
</style>
<template>
  <div>
    <div>
      <p>angle: {{ controlAngle }}</p>
      <input type="range" min="120" max="420" v-model="controlAngle" />
    </div>

    <div>
      <p>line length: {{ lineLength }}</p>
      <input type="range" min="1" max="50" v-model="lineLength" />
    </div>

    <div>
      <p>line offset: {{ lineOffset }}</p>
      <input type="range" min="0" max="50" v-model="lineOffset" />
    </div>

    <div>
      <p>line stroke: {{ lineStroke }}</p>
      <input type="range" min="1" max="6" v-model="lineStroke" />
    </div>

    <div>
      <p>rim width: {{ rimWidth }}</p>
      <input type="range" min="1" max="15" v-model="rimWidth" />
    </div>

    <div>
      <p>image size: {{ imageSize }}</p>
      <input type="range" min="30" max="400" v-model="imageSize" />
    </div>
  </div>

  <div class="flex flex-row space-x-4">
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle cx="50" cy="50" r="40" stroke="red" fill="transparent" :stroke-width="circleWidth" />
      <path
        :d="thirdLine"
        :stroke-width="3"
        stroke="currentColor"
        class="text-blue-600"
        fill="transparent"
      ></path>
    </svg>
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle
        cx="50"
        cy="50"
        :r="RADIUS"
        stroke="red"
        fill="transparent"
        :stroke-width="circleWidth"
      />
      <line x1="50" y1="50" :x2="lineEndX" :y2="lineEndY" stroke="black" stroke-width="2" />
    </svg>
    <svg :width="100" :height="100" viewBox="0 0 100 100" class="text-red-500 bg-slate-200">
      <circle
        cx="50"
        cy="50"
        :r="RADIUS"
        stroke="red"
        fill="transparent"
        :stroke-width="circleWidth"
      />
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
      <path
        :d="thirdLine"
        :stroke-width="1"
        stroke="currentColor"
        class="text-red-600"
        fill="transparent"
      ></path>
    </svg>
    <svg
      :width="imageSize"
      :height="imageSize"
      viewBox="0 0 100 100"
      class="text-red-500 bg-slate-200"
    >
      <circle
        cx="50"
        cy="50"
        :r="RADIUS"
        stroke="red"
        fill="transparent"
        :stroke-width="circleWidth"
      />
      <line
        :x1="lineStartX"
        :y1="lineStartY"
        :x2="lineEndX"
        :y2="lineEndY"
        stroke="black"
        :stroke-width="lineStroke"
      />
    </svg>
    <svg
      :width="imageSize"
      :height="imageSize"
      viewBox="0 0 100 100"
      class="text-red-500 bg-slate-200"
    >
      <circle
        cx="50"
        cy="50"
        :r="RADIUS"
        stroke="red"
        fill="transparent"
        :stroke-width="circleWidth"
      />
      <path
        :d="rim"
        :stroke-width="rimWidth"
        stroke="currentColor"
        class="text-blue-600"
        fill="none"
      ></path>

      <line
        :x1="lineStartX"
        :y1="lineStartY"
        :x2="lineEndX"
        :y2="lineEndY"
        stroke="black"
        :stroke-width="lineStroke"
      />
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
