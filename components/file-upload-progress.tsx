"use client"

import { Progress } from "@/components/ui/progress"
import { FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProgressProps {
  filename: string
  progress: number
  onCancel?: () => void
}

export default function FileUploadProgress({ filename, progress, onCancel }: FileUploadProgressProps) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <FileText className="w-5 h-5 text-blue-600" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900">{filename}</span>
          <span className="text-sm text-gray-500">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      {onCancel && (
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-6 w-6">
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
