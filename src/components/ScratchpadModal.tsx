import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, RotateCcw, PenTool, Check } from 'lucide-react';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#2563eb');
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : strokeColor;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#001f3f]/60 backdrop-blur-sm animate-fade-in text-[#171717]">
      <div className="bg-white border border-[#d9e7fb] rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[82vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#d9e7fb] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#edf3fd] text-[#005ce6]">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#001f3f] font-heading">Student Scratchpad & Rough Work</h3>
              <p className="text-xs text-[#5b6576] font-medium">Work through steps, sketch diagrams, and test equations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#edf3fd] text-[#7b8698] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#d9e7fb] bg-[#f4f7fd] text-xs gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setMode('pen')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                mode === 'pen'
                  ? 'bg-[#005ce6] text-white shadow-xs'
                  : 'bg-white text-[#313131] hover:bg-[#edf3fd] border border-[#d9e7fb]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Pen
            </button>
            <button
              onClick={() => setMode('eraser')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                mode === 'eraser'
                  ? 'bg-[#f59e0b] text-white shadow-xs'
                  : 'bg-white text-[#313131] hover:bg-[#edf3fd] border border-[#d9e7fb]'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" /> Eraser
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {mode === 'pen' && (
              <div className="flex items-center gap-1.5">
                {['#005ce6', '#0284c7', '#43b3a3', '#f59e0b', '#f04444', '#001f3f'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setStrokeColor(c)}
                    className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor: c,
                      borderColor: strokeColor === c ? '#001f3f' : 'transparent',
                    }}
                  />
                ))}
              </div>
            )}
            <button
              onClick={clearCanvas}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-[#f04444] hover:bg-[#fac5c5]/30 border border-[#d9e7fb] font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Drawing Canvas */}
        <div className="flex-1 relative bg-white touch-none cursor-crosshair">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#f4f7fd] border-t border-[#d9e7fb] flex items-center justify-between text-xs text-[#5b6576] font-medium">
          <span>Scratch work is private to your exam attempt.</span>
          <button
            onClick={onClose}
            className="btn btn-primary !py-1.5 !px-4 text-xs"
          >
            <Check className="w-3.5 h-3.5" /> Done
          </button>
        </div>
      </div>
    </div>
  );
};
