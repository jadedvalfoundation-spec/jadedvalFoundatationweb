"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Story {
  _id: string;
  personName: string;
  occupation: string;
  location?: string;
  image: string;
  story: string;
}

interface Props {
  stories: Story[];
}

export default function SuccessStoryCarousel({ stories }: Props) {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((a) => (a + 1) % stories.length);
  }, [stories.length]);

  const prev = () => {
    setActive((a) => (a - 1 + stories.length) % stories.length);
  };

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (stories.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, stories.length]);

  if (!stories.length) return null;

  const story = stories[active];

  return (
    <div className="relative">
      {/* Quote mark */}
      <div
        className="pointer-events-none absolute -top-8 left-0 font-heading text-[8rem] leading-none text-brand/20 select-none"
        aria-hidden
      >
        &ldquo;
      </div>

      <div className="relative min-h-[220px]">
        {stories.map((s, i) => (
          <div
            key={s._id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
          >
            {/* Story text */}
            <blockquote className="relative z-10 text-lg font-medium leading-relaxed text-white sm:text-xl lg:text-2xl">
              &ldquo;{s.story}&rdquo;
            </blockquote>

            {/* Person */}
            <div className="mt-8 flex items-center gap-4">
              {s.image ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-brand/40">
                  <Image src={s.image} alt={s.personName} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand font-heading text-xl font-bold ring-2 ring-brand/40">
                  {s.personName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-heading font-bold text-white">{s.personName}</p>
                <p className="text-sm text-gray-400">
                  {s.occupation}
                  {s.location ? ` · ${s.location}` : ""}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      {stories.length > 1 && (
        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-brand hover:text-brand"
            aria-label="Previous story"
          >
            ←
          </button>
          <div className="flex gap-2">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === active ? "2rem" : "0.375rem",
                  background: i === active ? "#00CCBB" : "rgba(255,255,255,0.2)",
                }}
                aria-label={`Go to story ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-brand hover:text-brand"
            aria-label="Next story"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
