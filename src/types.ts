export interface ControlKnobOptions {
  imageSize?: number
  minValue?: number
  maxValue?: number
  /** Value restored on alt-click / reset. Defaults to `minValue`. */
  defaultValue?: number
  /** Snaps the value to multiples of this increment (e.g. `0.01`). `0` (default) keeps it continuous. */
  step?: number
  /** Formats the displayed value and `aria-valuetext`. Defaults to rounding. */
  formatValue?: (value: number) => string
  showTick?: boolean
  showValue?: boolean
  hideDefaultValue?: boolean
  tickLength?: number
  tickOffset?: number
  tickStroke?: number
  rimStroke?: number
  valueArchStroke?: number
  bgRadius?: number
  wheelFactor?: number
  keyFactor?: number
  tabIndex?: number
  ariaLabel?: string
  valueTextX?: number
  valueTextY?: number
  /** Font size of the value text, in viewBox units (the viewBox is 100×100). */
  fontSize?: number
  svgClass?: string
  bgClass?: string
  rimClass?: string
  valueArchClass?: string
  tickClass?: string
  valueTextClass?: string
  passiveEvents?: boolean
}
