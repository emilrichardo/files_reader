"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"

interface ChipsInputProps {
  value: string[]
  onChange: (chips: string[]) => void
  placeholder?: string
  className?: string
}

export default function ChipsInput({
  value = [],
  onChange,
  placeholder = "Agregar...",
  className = "",
}: ChipsInputProps) {
  const [inputValue, setInputValue] = useState("")

  const addChip = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue])
      setInputValue("")
    }
  }

  const removeChip = (chipToRemove: string) => {
    onChange(value.filter((chip) => chip !== chipToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addChip()
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeChip(value[value.length - 1])
    } else if (e.key === "," || e.key === ";") {
      e.preventDefault()
      addChip()
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((chip, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-md"
          >
            <span>{chip}</span>
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              aria-label={`Eliminar ${chip}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) {
            addChip()
          }
        }}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <p className="text-xs text-gray-500 mt-1">Presiona Enter o coma para agregar. Haz clic en X para eliminar.</p>
    </div>
  )
}
