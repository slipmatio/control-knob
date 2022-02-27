<script setup lang="ts">
import { ref } from 'vue'

import Designer from './Designer.vue'
import ControlKnob from './ControlKnob.vue'

const options = {
  imageSize: 40,
  tickLength: 18,
  tickOffset: 10,
  tickStroke: 3,
  rimStroke: 11,
  valueArchStroke: 11,
  bgRadius: 34,
  minValue: 0,
  maxValue: 100,
  wheelFactor: 10,
  keyFactor: 10,
  tabIndex: 0,
  ariaLabel: 'Knob',
  valueTextX: 50,
  valueTexty: 62,
  showTick: true,
  showNonDefaultValue: true,
}

const vmodel = ref(0)
const vmodel2 = ref(0)
</script>
<template>
  <div class="p-4 bg-[#575757] text-gray-100">
    <div>
      <h2 class="mb-6 text-xl font-semibold">Default Control Knob</h2>

      <div class="px-8">
        <ControlKnob id="knob1" v-model="vmodel" />
      </div>

      <h2 class="my-6 text-xl font-semibold">Modified Control Knob</h2>

      <div class="px-8">
        <ControlKnob id="knob2" v-model="vmodel" :options="options" />
      </div>
    </div>
    <div v-if="false">
      <h2 class="mb-6 text-3xl font-semibold">Knob Designer</h2>
      <Designer />
    </div>
  </div>
</template>
