"use client"

import type React from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { useFileUpload } from "@/hooks/use-file-upload"

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string | null
  extractedData: any
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, fileUrl, extractedData }) => {
  const { apiResponse, isWaitingApiResponse } = useFileUpload()
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  File Preview
                </Dialog.Title>
                <div className="mt-2">
                  {fileUrl && <iframe src={fileUrl} title="File Preview" width="100%" height="400px" />}
                  {extractedData && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Extracted Data</h4>
                      <pre className="bg-gray-50 rounded-lg border p-3 text-xs overflow-auto max-h-32">
                        {JSON.stringify(extractedData, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Respuesta de la API */}
                  {(apiResponse || isWaitingApiResponse) && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Respuesta de la API</h4>
                      {isWaitingApiResponse ? (
                        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <span className="ml-2 text-sm text-gray-600">Esperando respuesta...</span>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg border p-3">
                          <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-32">
                            {JSON.stringify(apiResponse, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default FilePreviewModal
