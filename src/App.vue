<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ControlKnob from './ControlKnob.vue'

const foo = ref(5)
const ready = ref(false)
console.log('Hello knob.')

const RADIUS = 40
const MID_X = 50
const MID_Y = 50
const MIN_RADIANS = (4 * Math.PI) / 3
const MAX_RADIANS = -Math.PI / 3
const strokeWidth = 17
const secondaryColor = '#dcdfe6'

const minX = computed(() => MID_X + Math.cos(MIN_RADIANS) * RADIUS)
const minY = computed(() => MID_Y - Math.sin(MIN_RADIANS) * RADIUS)
const maxX = computed(() => MID_X + Math.cos(MAX_RADIANS) * RADIUS)
const maxY = computed(() => MID_Y - Math.sin(MAX_RADIANS) * RADIUS)

const rangePath = computed(
  () => `M ${minX.value} ${minY.value} A ${RADIUS} ${RADIUS} 0 1 1 ${maxX.value} ${maxY.value}`
)

onMounted(() => {
  ready.value = true
})
</script>
<template>
  <div>
    <h2>Hello Knob</h2>

    <div>
      <ControlKnob />
    </div>
  </div>
</template>
