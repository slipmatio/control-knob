<script setup lang="ts">
import Designer from './Designer.vue'
import ControlKnob from './ControlKnob.vue'

const options = {
  imageSize: 40,
  tickLength: 18,
  tickOffset: 18,
  tickStroke: 3,
  rimStroke: 11,
  valueArchStroke: 11,
  bgRadius: 34,
  minValue: 0,
  maxValue: 100,
  wheelFactor: 10,
  keyFactor: 10,
}
</script>
<template>
  <div class="p-4 bg-[#575757] text-gray-100">
    <div>
      <h2 class="mb-6 text-3xl font-semibold">Control Knob</h2>

      <div class="p-8">
        <ControlKnob :options="options" />
      </div>
    </div>
    <div v-if="false">
      <h2 class="mb-6 text-3xl font-semibold">Knob Designer</h2>
      <Designer />
    </div>
  </div>
</template>
