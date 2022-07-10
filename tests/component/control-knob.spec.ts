import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import ControlKnob from '../../src/ControlKnob.vue'

test('Passes msg prop correctly', async () => {
  expect(ControlKnob).toBeTruthy()

  const wrapper = mount(ControlKnob, {
    props: {
      modelValue: 0,
      options: {
        tabIndex: 5,
      },
    },
  })

  const svg = wrapper.get('svg')
  expect(svg.attributes()['tabindex']).toBe('5')
})
