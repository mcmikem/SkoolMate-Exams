import React from 'react';

interface MathSymbolBarProps {
  onInsertSymbol: (symbol: string) => void;
}

const SYMBOLS = [
  { label: '²', value: '²' },
  { label: '³', value: '³' },
  { label: '√', value: '√' },
  { label: 'π', value: 'π' },
  { label: 'θ', value: 'θ' },
  { label: '°', value: '°' },
  { label: '±', value: '±' },
  { label: '×', value: '×' },
  { label: '÷', value: '÷' },
  { label: '≤', value: '≤' },
  { label: '≥', value: '≥' },
  { label: '≠', value: '≠' },
  { label: 'Δ', value: 'Δ' },
  { label: 'Ω', value: 'Ω' },
  { label: 'μ', value: 'μ' },
  { label: '½', value: '½' },
  { label: '∑', value: '∑' },
  { label: '∫', value: '∫' },
  { label: '→', value: '→' },
];

export const MathSymbolBar: React.FC<MathSymbolBarProps> = ({ onInsertSymbol }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-2 bg-[#f4f7fd] rounded-xl border border-[#d9e7fb] text-xs">
      <span className="text-[#5b6576] font-bold px-1 flex items-center shrink-0">
        Symbols:
      </span>
      {SYMBOLS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onInsertSymbol(s.value)}
          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#005ce6] hover:text-white text-[#313131] font-semibold border border-[#d9e7fb] transition-colors font-mono shrink-0 shadow-xs cursor-pointer"
          title={`Insert ${s.label}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};
