"use client";

import { useRef, useState, useEffect } from "react";

interface RichReadMoreProps {
  /** Raw HTML or plain text to render */
  html: string;
  className?: string;
  collapsedHeight?: number; // px
  /** Background colour to blend the fade gradient into */
  fadeColor?: string;
  style?: React.CSSProperties;
}

export default function RichReadMore({
  html,
  className = "",
  collapsedHeight = 160,
  fadeColor = "#0c1620",
  style,
}: RichReadMoreProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setOverflows(el.scrollHeight > collapsedHeight + 8);
    }
  }, [html, collapsedHeight]);

  return (
    <div className={className}>
      {/* Content wrapper — relative so the gradient can overlay it */}
      <div className="relative">
        <div
          ref={contentRef}
          className="rich-content overflow-hidden"
          style={{
            maxHeight: expanded ? 4000 : collapsedHeight,
            transition: "max-height 0.35s ease",
            ...style,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Gradient fade — only when collapsed and content overflows */}
        {overflows && !expanded && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
            style={{
              background: `linear-gradient(to bottom, transparent, ${fadeColor})`,
            }}
          />
        )}
      </div>

      {overflows && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline focus:outline-none"
        >
          {expanded ? "See less" : "See more"}
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
