"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  if (items.length === 0) return null;

  // An item is "active" if it's hovered OR explicitly opened via click
  const isActive = (i: number) => hovered === i || open === i;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setOpen(open === i ? null : i)}
          className="group cursor-pointer overflow-hidden rounded-xl transition-all duration-200"
          style={{
            background: isActive(i) ? "#132535" : "#0f1e2a",
            border: isActive(i)
              ? "1px solid rgba(0,204,187,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Question row */}
          <div className="flex items-center justify-between px-6 py-5">
            <span className={`font-medium transition-colors duration-200 ${isActive(i) ? "text-white" : "text-gray-300"}`}>
              {item.question}
            </span>
            <span
              className="ml-4 flex-shrink-0 text-brand transition-transform duration-300"
              style={{ transform: isActive(i) ? "rotate(180deg)" : "none" }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          {/* Answer — visible on hover or click */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight: isActive(i) ? "400px" : "0px",
              opacity: isActive(i) ? 1 : 0,
            }}
          >
            <div
              className="px-6 pb-5"
              style={{ borderTop: "1px solid rgba(0,204,187,0.15)" }}
            >
              <p className="pt-4 text-sm leading-relaxed text-gray-400">{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
