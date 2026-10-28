"use client";
import { useState } from "react";
import Link from "next/link";
import { projects } from "@/data/site";

const categories = ["Todos", "Landing pages", "Portfólios", "Institucionais"] as const;
const types: Record<string, string> = {
  "conceito-landing": "Landing pages",
  "conceito-portfolio": "Portfólios",
  "conceito-site": "Institucionais",
};

export default function ProjectGallery() {
  const [filter, setFilter] = useState<string>("Todos");
  const visible = projects.filter(project => filter === "Todos" || types[project.slug] === filter);
  return <section aria-label="Galeria de projetos">
    <fieldset className="project-filters">
      <legend>Filtrar projetos</legend>
      {categories.map(category => <button type="button" key={category}
        aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}
    </fieldset>
    <p className="gallery-count" role="status">{visible.length} {visible.length === 1 ? "projeto conceitual" : "projetos conceituais"}</p>
    <div className="cards">
      {visible.map(project => <article className="mini-card project-card" key={project.slug}>
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/concepts/${project.slug}.png`}
          alt={`Prévia do conceito ${project.title}`} loading="lazy" />
        <small>{project.category} · {types[project.slug]}</small>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <Link className="case-link" href={`/projetos/${project.slug}`}>Ver conceito →</Link>
      </article>)}
    </div>
  </section>;
}
