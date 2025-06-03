"use client"

import type React from "react"
import { useState, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"

interface ChipsInputProps {
  value: string[]
  onChange: (chips: string[]) => void
  placeholder?: string
  className?: string
}

const ChipsInput: React.FC<ChipsInputProps> = ({
  value = [],
  onChange,
  placeholder = "Agregar elemento...",
  className = "",
}) => {
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
      // Eliminar el último chip si el input está vacío y se presiona backspace
      removeChip(value[value.length - 1])
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Chips existentes */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((chip, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-md border"
            >
              <span>{chip}</span>
              <button
                type="button"
                onClick={() => removeChip(chip)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label={`Eliminar ${chip}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input para agregar nuevos chips */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addChip}
          disabled={!inputValue.trim()}
          size="sm"
          variant="outline"
          className="px-3"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-gray-500">Presiona Enter o haz clic en + para agregar elementos</p>
      )}
    </div>
  )
}

export default ChipsInput
