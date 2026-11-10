import React, { useState } from 'react';
import { X, UploadCloud, RefreshCw, Sparkles } from 'lucide-react';

interface UploadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadPdf: (base64: string, fileName: string) => Promise<void>;
}

export const UploadPdfModal: React.FC<UploadPdfModalProps> = ({
  isOpen,
  onClose,
  onUploadPdf,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await onUploadPdf(base64, selectedFile.name);
        setIsProcessing(false);
        onClose();
      };
      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      alert(`Conversion error: ${err.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/60 backdrop-blur-sm animate-fade-in text-[#171717]">
      <div className="bg-white border border-[#d9e7fb] rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6 sm:p-7">
        <div className="flex items-center justify-between border-b border-[#d9e7fb] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#edf3fd] text-[#005ce6]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#001f3f] font-heading">Upload Past Paper PDF</h3>
              <p className="text-xs text-[#5b6576] font-medium">Extract questions, marks, and diagrams for student practice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#7b8698] hover:text-[#171717] hover:bg-[#edf3fd] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-7 text-center space-y-3 transition-colors ${
            dragActive
              ? 'border-[#005ce6] bg-[#eef4ff]'
              : 'border-[#d9e7fb] bg-[#f4f7fd] hover:border-[#b0ccf7]'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white text-[#005ce6] border border-[#d9e7fb] flex items-center justify-center mx-auto shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="text-xs text-[#171717] font-bold">
              {selectedFile ? selectedFile.name : 'Drag & drop exam paper PDF here, or browse files'}
            </p>
            {selectedFile && (
              <span className="text-[11px] text-[#005ce6] font-bold">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to convert
              </span>
            )}
          </div>

          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <span className="btn btn-secondary !py-2 !px-4">
              Browse PDF
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#d9e7fb]">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={!selectedFile || isProcessing}
            className="btn btn-primary flex-1 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Digitizing Exam...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#fff1cf]" />
                <span>Digitize into Exam</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
