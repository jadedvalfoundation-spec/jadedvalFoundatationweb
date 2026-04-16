"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

export interface ProjectCard {
  _id: string;
  name: string;
  description: string;
  image?: string;
  status: "upcoming" | "ongoing" | "completed";
  targetAmount: number;
  raised: number;
  donorCount: number;
}

export interface ProgramSection {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  projects: ProjectCard[];
}

interface ProgramsDisplayProps {
  programs: ProgramSection[];
  lang: Locale;
}

type StatusFilter = "all" | "upcoming" | "ongoing" | "completed";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: "ongoing", label: "Ongoing" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

const STATUS_BADGE: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ongoing: "bg-brand/20 text-brand border-brand/30",
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
};

const STATUS_DOT: Record<string, string> = {
  upcoming: "bg-blue-400",
  ongoing: "bg-brand",
  completed: "bg-green-400",
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function ProjectCardUI({ project, lang }: { project: ProjectCard; lang: Locale }) {
  const pct = project.targetAmount > 0
    ? Math.min(100, (project.raised / project.targetAmount) * 100)
    : 0;

  const desc = stripHtml(project.description);

  return (
    <Link
      href={`/${lang}/projects/${project._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
      style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Image */}
      <div className="relative h-52 flex-shrink-0 overflow-hidden bg-[#132535]">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#132535] to-[#1a3a50]">
            <span className="text-5xl opacity-20">🌍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Status badge — top left */}
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[project.status]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[project.status]}`} />
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {project.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400 line-clamp-3">
          {desc.slice(0, 140)}{desc.length > 140 ? "…" : ""}
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-semibold text-brand">${project.raised.toLocaleString()} raised</span>
            <span className="text-gray-500">{pct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-gray-500">
            <span>{project.donorCount} donor{project.donorCount !== 1 ? "s" : ""}</span>
            <span>Goal: ${project.targetAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Donate button for active projects */}
        {project.status !== "completed" && (
          <div className="mt-4" onClick={(e) => e.preventDefault()}>
            <a
              href={`/${lang}/donate?project=${project._id}&name=${encodeURIComponent(project.name)}`}
              className="block w-full rounded-full bg-brand py-2.5 text-center text-xs font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark"
            >
              Donate Now
            </a>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ProgramsDisplay({ programs, lang }: ProgramsDisplayProps) {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");

  // Count total projects per status across all programs
  const countByStatus = (status: StatusFilter) => {
    if (status === "all") return programs.reduce((sum, p) => sum + p.projects.length, 0);
    return programs.reduce((sum, p) => sum + p.projects.filter((pr) => pr.status === status).length, 0);
  };

  const filteredPrograms = programs
    .map((prog) => ({
      ...prog,
      projects: activeFilter === "all"
        ? prog.projects
        : prog.projects.filter((pr) => pr.status === activeFilter),
    }))
    .filter((prog) => prog.projects.length > 0);

  return (
    <>
      {/* Status filter tabs */}
      <div className="sticky top-16 z-30 bg-[#0c1620] py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => {
              const count = countByStatus(tab.value);
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    activeFilter === tab.value
                      ? "bg-brand text-white"
                      : "border border-white/10 text-gray-400 hover:border-brand/40 hover:text-white"
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                    activeFilter === tab.value ? "bg-white/20 text-white" : "bg-white/10 text-gray-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Program sections */}
      <div className="py-16">
        {filteredPrograms.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No projects in this category yet.
          </div>
        ) : (
          filteredPrograms.map((program, idx) => (
            <section
              key={program._id}
              className="py-12"
              style={{ background: idx % 2 === 0 ? "#0a1520" : "#0c1620" }}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Program header */}
                <div className="mb-10 flex items-start gap-5">
                  {program.logo && (
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand/10">
                      <Image src={program.logo} alt={program.name} width={56} height={56} className="h-14 w-14 object-cover rounded-xl" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand">
                      {activeFilter !== "all" ? activeFilter : "All Projects"} · {program.projects.length} project{program.projects.length !== 1 ? "s" : ""}
                    </p>
                    <h2 className="mt-1 font-heading text-2xl font-bold text-white sm:text-3xl">
                      {program.name}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                      {program.description.slice(0, 200)}{program.description.length > 200 ? "…" : ""}
                    </p>
                  </div>
                </div>

                {/* Project grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {program.projects.map((project) => (
                    <ProjectCardUI key={project._id} project={project} lang={lang} />
                  ))}
                </div>
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
