import React from 'react';

interface PhysicalRulerProps {
  widthMm: number;
  label?: string;
  className?: string;
}

export const PhysicalRuler: React.FC<PhysicalRulerProps> = ({
  widthMm,
  label,
  className = '',
}) => {
  const cmCount = Math.floor(widthMm / 10);
  const remainingMm = widthMm % 10;

  const marks = [];
  for (let cm = 0; cm <= cmCount; cm++) {
    marks.push(cm);
  }

  return (
    <div
      style={{ width: `${widthMm}mm` }}
      className={`relative h-7 bg-amber-50/90 border border-amber-300 text-amber-900 select-none overflow-hidden text-[9px] font-mono shadow-xs rounded-t print:hidden ${className}`}
    >
      <div className="flex h-full items-end">
        {marks.map((cm) => (
          <div
            key={cm}
            style={{ width: cm === cmCount ? `${remainingMm * 10}%` : '10mm' }}
            className="h-full relative shrink-0 border-l border-amber-600"
          >
            {/* Centimeter number */}
            <span className="absolute left-0.5 top-0.5 text-[8px] font-bold">
              {cm}
            </span>

            {/* Half-centimeter (5mm) tick */}
            <div className="absolute left-1/2 bottom-0 w-px h-3 bg-amber-500" />

            {/* Millimeter small ticks */}
            <div className="absolute left-[10%] bottom-0 w-px h-1.5 bg-amber-400" />
            <div className="absolute left-[20%] bottom-0 w-px h-1.5 bg-amber-400" />
            <div className="absolute left-[30%] bottom-0 w-px h-1.5 bg-amber-400" />
            <div className="absolute left-[40%] bottom-0 w-px h-1.5 bg-amber-400" />
            <div className="absolute left-[60%] bottom-0 w-px h-1.5 bg-amber-400" />
            <div className="absolute left-[70%] bottom-0 w-px h-1.5 bg-amber-400" />
            <div className="absolute left-[80%] bottom-0 w-px h-1.5 bg-amber-400" />
            <div className="absolute left-[90%] bottom-0 w-px h-1.5 bg-amber-400" />
          </div>
        ))}
      </div>

      {/* Label tag */}
      {label && (
        <div className="absolute right-2 top-0.5 bg-amber-200/80 px-1.5 py-0.2 text-[8px] font-sans font-bold text-amber-900 rounded">
          {label}
        </div>
      )}
    </div>
  );
};
