import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Text Part */}
      <div className="flex flex-col">
        <div className="flex">
          <span className="text-[#00A9A5] font-bold text-lg leading-none ml-1">劉忠</span>
        </div>
        <div className="flex items-center leading-none">
          <span className="text-4xl font-black tracking-tighter flex items-center" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-[#00A9A5]">T.</span>
            <span className="text-[#2B78B7]">LOW</span>
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[1.5px] w-6 bg-[#666666] opacity-60" />
          <span className="text-[10px] font-bold text-[#4D4D4D] uppercase tracking-[0.25em] whitespace-nowrap" style={{ fontFamily: 'sans-serif' }}>
            Dental Clinic
          </span>
          <div className="h-[1.5px] w-6 bg-[#666666] opacity-60" />
        </div>
      </div>
    </div>
  );
};
