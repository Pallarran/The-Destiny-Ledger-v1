import { forwardRef } from 'react'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, step = 1, className = '' }, ref) => {
    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0] || min}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 ${className}`}
      />
    )
  }
)

Slider.displayName = 'Slider'

export { Slider }