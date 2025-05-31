"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Upload, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { DocumentField, DocumentRow } from "@/lib/types"

export default function CreateDocumentPage() {
  const [documentName, setDocumentName] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")
  const [fields, setFields] = useState<DocumentField[]>([
    {
      id: "1",
      field_name: "document_title",
      type: "text",
      description: "The title of the document",
      formats: [],
      required: true,
      order: 0,
    },
  ])
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [dragActive, setDragActive] = useState(false)

  const addField = () => {
    const newField: DocumentField = {
      id: Date.now().toString(),
      field_name: "",
      type: "text",
      description: "",
      formats: [],
      required: false,
      order: fields.length,
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<DocumentField>) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const addRow = () => {
    const newRow: DocumentRow = {
      id: Date.now().toString(),
      document_id: "temp",
      data: {},
      created_at: new Date().toISOString(),
    }
    setRows([...rows, newRow])
  }

  const updateRowData = (rowId: string, fieldName: string, value: any) => {
    setRows(rows.map((row) => (row.id === rowId ? { ...row, data: { ...row.data, [fieldName]: value } } : row)))
  }

  const removeRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files: FileList) => {
    // Simulate file processing
    Array.from(files).forEach((file) => {
      console.log("Processing file:", file.name)
      // Here you would typically upload the file and extract data
    })
  }

  const exportDocument = (format: "csv" | "pdf" | "excel") => {
    console.log(`Exporting document as ${format}`)
    // Implementation for export functionality
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Document</h1>
          <p className="text-gray-600">Define your data structure and start extracting information from documents.</p>
        </div>

        {/* Document Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
            <CardDescription>Basic information about your document project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter project name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder="Describe your project..."
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fields Configuration */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Data Fields</CardTitle>
              <CardDescription>Define the structure of your data extraction</CardDescription>
            </div>
            <Button onClick={addField} className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Field Name *</Label>
                      <Input
                        value={field.field_name}
                        onChange={(e) => updateField(field.id, { field_name: e.target.value })}
                        placeholder="field_name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={field.type} onValueChange={(value: any) => updateField(field.id, { type: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Formats</Label>
                      <Input
                        value={field.formats?.join(", ") || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            formats: e.target.value
                              .split(",")
                              .map((f) => f.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="format1, format2"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeField(field.id)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label>Description</Label>
                    <Input
                      value={field.description || ""}
                      onChange={(e) => updateField(field.id, { description: e.target.value })}
                      placeholder="Field description..."
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Data Entries</CardTitle>
              <CardDescription>Manual data entries and extracted information</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={addRow} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
              <Select onValueChange={exportDocument}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      {fields.map((field) => (
                        <th key={field.id} className="border border-gray-200 p-3 text-left font-medium text-gray-900">
                          {field.field_name}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </th>
                      ))}
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {fields.map((field) => (
                          <td key={field.id} className="border border-gray-200 p-2">
                            <Input
                              value={row.data[field.field_name] || ""}
                              onChange={(e) => updateRowData(row.id, field.field_name, e.target.value)}
                              placeholder={`Enter ${field.field_name}...`}
                              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                            />
                          </td>
                        ))}
                        <td className="border border-gray-200 p-2">
                          <Button variant="outline" size="icon" onClick={() => removeRow(row.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={fields.length + 1}
                          className="border border-gray-200 p-8 text-center text-gray-500"
                        >
                          No data entries yet. Add a row or upload files to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>Upload files to automatically extract data based on your defined fields</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-black bg-black/5" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</h3>
              <p className="text-gray-600 mb-4">Supports PDF, JPG, PNG, DOC, DOCX files</p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button className="bg-black hover:bg-gray-800 text-white">Choose Files</Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline">Save as Template</Button>
          <Button className="bg-black hover:bg-gray-800 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Document
          </Button>
        </div>
      </div>
    </div>
  )
}
