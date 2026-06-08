<script setup lang="ts">
import { HALF_VIEWBOX, MAX_ANGLE, MIN_ANGLE, RADIUS } from '@/constants'
import type { ControlKnobOptions } from '@/types'
import { changeToControlAngle, controlAngleToValue, degToRad, leadingDebounce, valueToControlAngle } from '@/utils'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

interface Props {
  modelValue: number
  options?: ControlKnobOptions
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const defaultOptions: Required<ControlKnobOptions> = {
  imageSize: 40,
  minValue: 0,
  maxValue: 100,
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
  valueTextY: 62,
  svgClass: 'select-none',
  bgClass: 'text-[#868686]',
  rimClass: 'text-[#393939]',
  valueArchClass: 'text-[#53d769]',
  tickClass: 'text-black',
  valueTextClass: 'text-gray-50 text-[30px] font-normal font-mono',
  passiveEvents: false,
}

function definedOptions(options: ControlKnobOptions = {}) {
  return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined)) as ControlKnobOptions
}

const knobOptions = computed<Required<ControlKnobOptions>>(() => ({
  ...defaultOptions,
  ...definedOptions(props.options),
}))

const knobElement = ref<SVGSVGElement | null>(null)

function getControlAngle(value: number) {
  return valueToControlAngle(knobOptions.value.minValue, knobOptions.value.maxValue, value)
}

const controlAngle = ref(getControlAngle(props.modelValue))

const vModel = computed<number>({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const startValue = vModel.value

const tickStartX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - knobOptions.value.tickLength)
})

const tickStartY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - knobOptions.value.tickLength)
})

const tickEndX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - knobOptions.value.tickOffset)
})

const tickEndY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - knobOptions.value.tickOffset)
})

const rimStartX = HALF_VIEWBOX + -0.5 * RADIUS
const rimStartY = HALF_VIEWBOX + Math.sin(degToRad(MIN_ANGLE)) * RADIUS
const rimEndX = HALF_VIEWBOX + 0.5 * RADIUS
const rimEndY = HALF_VIEWBOX + Math.sin(degToRad(MAX_ANGLE)) * RADIUS

const startRad = degToRad(MIN_ANGLE)
const currentValueRad = computed(() => degToRad(controlAngle.value))
const largeArch = computed(() => (Math.abs(startRad - currentValueRad.value) < Math.PI ? 0 : 1))
const sweep = 1

const valueEndX = computed(() => HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * RADIUS)
const valueEndY = computed(() => HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * RADIUS)

const rim = `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 1 1 ${rimEndX} ${rimEndY}`
const valueArch = computed(
  () =>
    `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 ${largeArch.value} ${sweep} ${valueEndX.value} ${valueEndY.value}`,
)

let prevY = 0
const pointerIsDown = ref(false)
const hasFocus = ref(false)
const shiftModifier = ref(false)

const downListener = (event: PointerEvent) => {
  pointerIsDown.value = true
  prevY = event.clientY
  addDocumentPointerListeners()
  preventScrolling(event)
}

function moveListener(event: PointerEvent) {
  if (!pointerIsDown.value) {
    return
  }

  const currentY = event.clientY
  const yChange = prevY - currentY

  if (yChange !== 0) {
    const change = changeToControlAngle(prevY, yChange, event.shiftKey)
    changeValue(controlAngle.value + change)
  }

  prevY = currentY
  preventScrolling(event)
}

const debouncedMoveListener = leadingDebounce(moveListener)

/** According to the chosen option, prevents propagation of the event.
 * @remarks If set, keeps page from scrolling while handling the knob
 */
function preventScrolling(event: PointerEvent | WheelEvent | KeyboardEvent): void {
  if (knobOptions.value.passiveEvents === false) {
    event.preventDefault()
    event.stopPropagation()
  }
}

const upListener = () => {
  pointerIsDown.value = false
  removeDocumentPointerListeners()
}

function resetValue() {
  changeValue(MIN_ANGLE)
}

function changeValue(change: number) {
  controlAngle.value = Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, change))
  vModel.value = controlAngleToValue(knobOptions.value.minValue, knobOptions.value.maxValue, controlAngle.value)
}

function keyDownListener(event: KeyboardEvent) {
  // Update the shift modifier here already, otherwise the precise mode is not triggered properly
  if (event.key === 'Shift') {
    shiftModifier.value = true
  }

  if (hasFocus.value && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    preventScrolling(event)
  }
}

function keyUpListener(event: KeyboardEvent) {
  if (event.key === 'Shift') {
    shiftModifier.value = false
  }

  let newValue: number
  const keyModifier = shiftModifier.value ? 1 : knobOptions.value.keyFactor
  if (hasFocus.value && event.key === 'ArrowUp') {
    newValue = controlAngle.value + 1 * keyModifier
    changeValue(newValue)
  }

  if (hasFocus.value && event.key === 'ArrowDown') {
    newValue = controlAngle.value - 1 * keyModifier
    changeValue(newValue)
  }
}

function wheelListener(event: WheelEvent) {
  let newValue: number
  const wheelModifier = event.shiftKey ? 1 : knobOptions.value.wheelFactor
  if ((!event.shiftKey && event.deltaY < 0) || (event.shiftKey && event.deltaX < 0)) {
    newValue = controlAngle.value + 1 * wheelModifier
  } else {
    newValue = controlAngle.value - 1 * wheelModifier
  }
  changeValue(newValue)
  preventScrolling(event)
}

function addElementListeners(element: SVGSVGElement) {
  element.addEventListener('pointerdown', downListener, { passive: knobOptions.value.passiveEvents })
  element.addEventListener('wheel', wheelListener, { passive: knobOptions.value.passiveEvents })
}

function removeElementListeners(element: SVGSVGElement) {
  element.removeEventListener('pointerdown', downListener)
  element.removeEventListener('wheel', wheelListener)
}

function addDocumentPointerListeners() {
  document.addEventListener('pointermove', debouncedMoveListener, { passive: knobOptions.value.passiveEvents })
  document.addEventListener('pointerup', upListener)
  document.addEventListener('pointercancel', upListener)
}

function removeDocumentPointerListeners() {
  document.removeEventListener('pointermove', debouncedMoveListener)
  document.removeEventListener('pointerup', upListener)
  document.removeEventListener('pointercancel', upListener)
}

watch(
  () => [knobElement.value, knobOptions.value.passiveEvents] as const,
  ([element], [oldElement]) => {
    if (oldElement) {
      removeElementListeners(oldElement)
    }

    if (element) {
      addElementListeners(element)
    }
  },
)

watch(
  () => [props.modelValue, knobOptions.value.minValue, knobOptions.value.maxValue] as const,
  ([value]) => {
    if (!pointerIsDown.value) {
      controlAngle.value = getControlAngle(value)
    }
  },
)

onBeforeUnmount(() => {
  if (knobElement.value) {
    removeElementListeners(knobElement.value)
  }
  removeDocumentPointerListeners()
})
</script>
<template>
  <svg
    ref="knobElement"
    :width="knobOptions.imageSize"
    :height="knobOptions.imageSize"
    viewBox="0 0 100 100"
    role="slider"
    :aria-label="knobOptions.ariaLabel"
    :aria-valuemin="knobOptions.minValue"
    :aria-valuemax="knobOptions.maxValue"
    :aria-valuenow="vModel"
    :tabindex="knobOptions.tabIndex"
    :class="knobOptions.svgClass"
    @click.alt="resetValue"
    @focus="hasFocus = true"
    @blur="hasFocus = false"
    @keydown="keyDownListener"
    @keyup="keyUpListener"
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
    ></path>

    <path
      v-if="controlAngle > MIN_ANGLE"
      :d="valueArch"
      :stroke-width="knobOptions.valueArchStroke"
      stroke="currentColor"
      fill="none"
      :class="knobOptions.valueArchClass"
    ></path>

    <line
      v-if="knobOptions.showTick"
      :x1="tickStartX"
      :y1="tickStartY"
      :x2="tickEndX"
      :y2="tickEndY"
      stroke="currentColor"
      :stroke-width="knobOptions.tickStroke"
      :class="knobOptions.tickClass"
    />

    <text
      v-if="knobOptions.showValue && (!knobOptions.hideDefaultValue || startValue !== vModel)"
      :x="knobOptions.valueTextX"
      :y="knobOptions.valueTextY"
      text-anchor="middle"
      fill="currentColor"
      :class="knobOptions.valueTextClass"
    >
      {{ Math.ceil(vModel) }}
    </text>
  </svg>
</template>
