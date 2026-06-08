<script setup lang="ts">
import { ref } from 'vue'

import ControlKnob from '@/ControlKnob.vue'
import DesignerComponent from '@/DesignerComponent.vue'
import type { ControlKnobOptions } from '@/types'

const options: ControlKnobOptions = {
  defaultValue: 50,
  imageSize: 80,
  showValue: false,
  tickLength: 40,
  tickOffset: -3,
  tickStroke: 1,
  rimStroke: 2,
  valueArchStroke: 5,
  bgRadius: 39,
  tabIndex: 1,
  rimClass: 'text-black/90',
  bgClass: 'text-[#36485A]',
  tickClass: 'text-[#8CE69F]',
}

const steppedOptions: ControlKnobOptions = {
  minValue: 0,
  maxValue: 12,
  step: 0.01,
  formatValue: (value: number) => value.toFixed(1),
  fontSize: 24,
}

const vmodel = ref(options.defaultValue)
const steppedValue = ref(0)
</script>
<template>
  <div class="p-4 bg-[#575757] text-gray-100">
    <div>
      <h2 class="mb-6 text-xl font-semibold">Default Control Knob</h2>

      <div class="px-8">
        <ControlKnob id="knob1" v-model="vmodel" data-test-id="first" />
      </div>

      <h2 class="my-6 text-xl font-semibold">Modified Control Knob</h2>

      <div class="px-8">
        <ControlKnob id="knob2" v-model="vmodel" :options="options" />
      </div>

      <h2 class="mb-6 text-xl font-semibold">Control Knob with passive event handling (not preventing scrolling)</h2>

      <div class="px-8">
        <ControlKnob id="knob1" v-model="vmodel" :options="{ passiveEvents: true }" />
      </div>

      <h2 class="my-6 text-xl font-semibold">Stepped Control Knob (0–12, 0.01 increments, shown rounded to 0.1)</h2>

      <div class="px-8">
        <ControlKnob id="knob4" v-model="steppedValue" :options="steppedOptions" />
      </div>
    </div>
    <div v-if="false">
      <h2 class="mb-6 text-3xl font-semibold">Knob Designer</h2>
      <DesignerComponent />
    </div>
  </div>
</template>
