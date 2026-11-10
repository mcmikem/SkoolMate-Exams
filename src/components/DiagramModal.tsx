import React from 'react';
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react';

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  diagramSvg?: string;
  imageUrl?: string;
  description?: string;
}

export const DiagramModal: React.FC<DiagramModalProps> = ({
  isOpen,
  onClose,
  title,
  diagramSvg,
  imageUrl,
  description,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#001f3f]/60 backdrop-blur-sm animate-fade-in text-[#171717]">
      <div className="bg-white border border-[#d9e7fb] rounded-[24px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d9e7fb] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#edf3fd] text-[#005ce6]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#001f3f] font-heading">{title}</h3>
              <p className="text-xs text-[#5b6576] font-medium">Isolated Question Diagram • High Resolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#edf3fd] text-[#7b8698] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 sm:p-8 overflow-auto flex flex-col items-center justify-center bg-[#f4f7fd] min-h-[280px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={description || title}
              className="max-h-[60vh] max-w-full object-contain rounded-2xl border border-[#d9e7fb] bg-white p-3 shadow-xs"
            />
          ) : diagramSvg ? (
            <div
              className="w-full max-w-lg p-6 rounded-2xl border border-[#d9e7fb] bg-white shadow-xs flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: diagramSvg }}
            />
          ) : (
            <div className="text-sm text-[#5b6576] font-medium">No diagram available for this question.</div>
          )}

          {description && (
            <p className="mt-4 text-xs text-[#5b6576] font-medium text-center max-w-md bg-white px-4 py-2 rounded-xl border border-[#d9e7fb] shadow-xs">
              {description}
            </p>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-[#d9e7fb] bg-white flex items-center justify-between">
          <span className="text-xs text-[#5b6576] font-medium flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-[#005ce6]" /> High-contrast diagram presentation
          </span>
          <button
            onClick={onClose}
            className="btn btn-primary !py-2 !px-4"
          >
            Close Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
