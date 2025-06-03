"use client"

import type React from "react"
import { useState, type KeyboardEvent, useEffect } from "react"
import { X, Plus } from "lucide-react"

interface ChipsInputProps {
  value: string[]
  onChange: (chips: string[]) => void
  placeholder?: string
  className?: string
}

export const ChipsInput: React.FC<ChipsInputProps> = ({
  value = [],
  onChange,
  placeholder = "Agregar...",
  className = "",
}: ChipsInputProps) => {
  const [inputValue, setInputValue] = useState("")

  // Asegurarse de que value siempre sea un array
  useEffect(() => {
    if (!Array.isArray(value)) {
      onChange([])
    }
  }, [value, onChange])

  const addChip = () => {
    // Manejar múltiples valores separados por coma
    const values = inputValue
      .split(/[,;]/)
      .map((v) => v.trim())
      .filter((v) => v)

    if (values.length > 0) {
      const newChips = [...value]

      values.forEach((val) => {
        if (!newChips.includes(val)) {
          newChips.push(val)
        }
      })

      onChange(newChips)
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
      // Agregar el contenido actual antes de la coma
      const currentValue = inputValue.trim()
      if (currentValue) {
        const newChips = [...value]
        if (!newChips.includes(currentValue)) {
          newChips.push(currentValue)
        }
        onChange(newChips)
        setInputValue("")
      }
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {Array.isArray(value) && value.length > 0
          ? value.map((chip, index) => (
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
            ))
          : null}
      </div>
      <div className="flex gap-2">
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
        <button
          type="button"
          onClick={addChip}
          disabled={!inputValue.trim()}
          className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Escribe y presiona Enter, o separa con comas para agregar varios.</p>
    </div>
  )
}

export default ChipsInput
