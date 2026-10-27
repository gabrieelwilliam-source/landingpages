"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

type Draft = { name: string; email: string; message: string };
const empty: Draft = { name: "", email: "", message: "" };
const ContactDraft = createContext<{
  draft: Draft;
  update: (field: keyof Draft, value: string) => void;
  clear: () => void;
} | null>(null);

// Deliberately memory-only: no personal information in storage, URLs or requests.
export function ContactDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(empty);
  return <ContactDraft.Provider value={{ draft,
    update: (field, value) => setDraft(previous => ({ ...previous, [field]: value })),
    clear: () => setDraft(empty),
  }}>{children}</ContactDraft.Provider>;
}

export function useContactDraft() {
  const value = useContext(ContactDraft);
  if (!value) throw new Error("ContactForm requires ContactDraftProvider");
  return value;
}
