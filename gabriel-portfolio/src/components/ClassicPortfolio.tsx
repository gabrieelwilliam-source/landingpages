"use client";
import { useEffect } from "react";
import Link from "next/link";
import ContactForm from "./ContactForm";
import { chapters, services, projects, spatialExhibits } from "@/data/site";
export default function ClassicPortfolio({
  onExplore,
  onSection,
}: {
  onExplore: () => void;
  onSection: (id: string) => void;
}) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) onSection(e.target.id);
      },
      { rootMargin: "-10% 0px -55% 0px" },
    );
    document
      .querySelectorAll(".content-section")
      .forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, [onSection]);
  return (
    <main>
      <a className="skip-link" href="#sobre">
        Pular para o conteúdo
      </a>
      <header className="topbar">
        <a className="signature" href="#inicio">
          Gabriel<span className="dot">.</span>
          <small>by zAIon</small>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#sobre">Sobre</a>
          <a href="#projetos">Projetos</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>
      <section className="hero" id="inicio">
        <div className="eyebrow">PORTFÓLIO / DESENVOLVIMENTO WEB</div>
        <h1>
          Sites com
          <br />
          <em>intenção.</em>
          <br />
          Experiências com
          <br />
          personalidade.
        </h1>
        <p>
          Sou Gabriel. Crio interfaces, sites e experiências digitais. Uma
          frente de desenvolvimento web do ecossistema zAIon.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={onExplore}>
            Entrar na jornada 3D →
          </button>
          <a className="outline" href="#projetos">
            Ver trabalhos
          </a>
          <a className="outline" href="#contato">
            Solicitar um projeto
          </a>
        </div>
        <div className="hero-bottom">
          <span>JOINVILLE / SC</span>
          <span>DESENVOLVIMENTO · WEB · AUTOMAÇÃO</span>
        </div>
      </section>
      <nav
        className="chapter-links classic-chapters"
        aria-label="Seções do portfólio"
      >
        {chapters.map((c) => (
          <a key={c.id} href={`#${c.id}`}>
            {c.index} / {c.nav} →
          </a>
        ))}
      </nav>
      <div className="content-sections">
        {chapters.map((c) => (
          <section key={c.id} id={c.id} className="content-section">
            <div className="number">{c.index} / 06</div>
            <div className="section-content">
              <span className="overline">{c.nav.toUpperCase()}</span>
              <h2>{c.headline}</h2>
              <p className="description">{c.description}</p>
              {c.id === "sobre" && (
                <article className="mini-card">
                  <h3>{spatialExhibits[1].title}</h3>
                  <p>{spatialExhibits[1].body}</p>
                </article>
              )}
              {c.id === "servicos" && (
                <div className="cards">
                  {services.map((s) => (
                    <article className="mini-card" key={s.name}>
                      <h3>{s.name}</h3>
                      <p>{s.detail}</p>
                    </article>
                  ))}
                </div>
              )}
              {c.id === "projetos" && (
                <div className="cards">
                  {projects.map((p) => (
                    <article className="mini-card" key={p.slug}>
                      <small>{p.category}</small>
                      <h3>{p.title}</h3>
                      <p>{p.description}</p>
                      <Link className="case-link" href={`/projetos/${p.slug}`}>
                        Ver conceito →
                      </Link>
                    </article>
                  ))}
                </div>
              )}
              {c.id === "processo" && (
                <div className="steps">
                  {[
                    "Descoberta",
                    "Direção",
                    "Design",
                    "Desenvolvimento",
                    "Revisão e entrega",
                  ].map((s, i) => (
                    <span key={s}>
                      {i + 1} / {s}
                    </span>
                  ))}
                </div>
              )}
              {c.id === "zaion" && (
                <img
                  className="brand-mark"
                  loading="lazy"
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/zaion-original.png`}
                  alt="zAIon Automações — logo original"
                />
              )}
              {c.id === "contato" && <ContactForm />}
            </div>
          </section>
        ))}
      </div>
      <footer>
        <strong>
          Gabriel<span className="dot">.</span>
        </strong>
        <span>Desenvolvimento web · by zAIon</span>
        <a href="#inicio">Voltar ao início ↑</a>
      </footer>
      <button className="classic-return" onClick={onExplore}>
        Voltar à jornada 3D →
      </button>
    </main>
  );
}
