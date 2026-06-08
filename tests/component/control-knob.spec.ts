import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import ControlKnob from '../../src/ControlKnob.vue'

test('applies reactive options', async () => {
  const wrapper = mount(ControlKnob, {
    props: {
      modelValue: 0,
      options: {
        tabIndex: 5,
      },
    },
  })

  expect(wrapper.get('svg').attributes()['tabindex']).toBe('5')

  await wrapper.setProps({
    options: {
      tabIndex: 7,
    },
  })

  expect(wrapper.get('svg').attributes()['tabindex']).toBe('7')
})

test('uses showValue independently from showTick', () => {
  const wrapper = mount(ControlKnob, {
    props: {
      modelValue: 0,
      options: {
        hideDefaultValue: false,
        showTick: false,
        showValue: true,
      },
    },
  })

  expect(wrapper.find('line').exists()).toBe(false)
  expect(wrapper.find('text').exists()).toBe(true)
})

test('preserves falsy option values', () => {
  const wrapper = mount(ControlKnob, {
    props: {
      modelValue: 1,
      options: {
        tickStroke: 0,
      },
    },
  })

  expect(wrapper.get('line').attributes()['stroke-width']).toBe('0')
})

test('reset emits model update', async () => {
  const wrapper = mount(ControlKnob, {
    props: {
      modelValue: 50,
    },
  })

  await wrapper.get('svg').trigger('click', { altKey: true })

  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
})
