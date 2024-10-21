import React, { useState } from "react"

type SwitcherProps = {
  isChecked: boolean
  setIsChecked: (isChecked: boolean) => void
}

const Switcher = ({ isChecked, setIsChecked }: SwitcherProps) => {
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <div className="w-12 mr-1">
      <label className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="sr-only"
          />
          <div
            className={`box block h-6 w-12 rounded-full ${
              isChecked ? "bg-foreground" : "bg-white/5"
            }`}
          ></div>
          <div
            className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full ${isChecked ? "bg-background" : "bg-foreground"} transition ${
              isChecked ? "translate-x-6" : ""
            }`}
          ></div>
        </div>
      </label>
    </div>
  )
}

export default Switcher
