import React, {useEffect, useMemo, useState} from "react";
import {ArrowLeft, BookOpen, ExternalLink, Search, X} from "lucide-react";
import {useNavigate} from "react-router";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useTranslation} from "react-i18next";
import {useDocs} from "./DocsContext";
import MarkdownRenderer from "./MarkdownRenderer";

const docsPath = (article: {module: string; slug: string}) => `/docs/${article.module}/${article.slug}`;

export default function HelpPanel() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {open, closeHelp, index, loading, selected, selectedArticle, setSelected} = useDocs();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return index;
    return index.filter(article => `${article.title} ${article.description} ${article.module} ${article.slug}`.toLowerCase().includes(value));
  }, [index, query]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeHelp(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeHelp]);
  if (!open) return null;

  return <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l bg-white shadow-2xl" aria-label={t("docs.helpTitle")}>
    <div className="flex items-center justify-between border-b px-5 py-4">
      <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-700"/><h2 className="font-semibold">{t("docs.helpTitle")}</h2></div>
      <button onClick={closeHelp} className="rounded p-2 hover:bg-slate-100" aria-label={t("close")}><X className="h-5 w-5"/></button>
    </div>
    {selected ? <>
      <div className="flex items-center justify-between border-b px-5 py-3">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-blue-700"><ArrowLeft className="h-4 w-4"/>{t("docs.allGuides")}</button>
        <button onClick={() => navigate(docsPath(selected))} className="flex items-center gap-1 text-sm text-blue-700">{t("docs.openFullPage")}<ExternalLink className="h-4 w-4"/></button>
      </div>
      <ScrollArea className="min-h-0 flex-1 overflow-hidden"><div className="p-5">{selectedArticle ? <><h1 className="mb-2 text-2xl font-semibold">{selectedArticle.summary.title}</h1><p className="mb-6 text-sm text-slate-500">{selectedArticle.summary.description}</p><MarkdownRenderer content={selectedArticle.content}/></> : <p className="text-sm text-slate-500">{t("loading")}</p>}</div></ScrollArea>
    </> : <>
      <div className="border-b p-4"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/><Input value={query} onChange={event => setQuery(event.target.value)} placeholder={t("docs.searchPlaceholder")} className="pl-9"/></div></div>
      <ScrollArea className="min-h-0 flex-1 overflow-hidden"><div className="p-4">{loading ? <p className="p-3 text-sm text-slate-500">{t("loading")}</p> : filtered.map(article => <button key={`${article.module}/${article.slug}`} onClick={() => setSelected(article)} className="mb-2 block w-full rounded-lg border p-3 text-left hover:border-blue-300 hover:bg-blue-50"><div className="font-medium">{article.title}</div><div className="mt-1 text-sm text-slate-500">{article.description}</div></button>)}{!loading && !filtered.length && <p className="p-3 text-sm text-slate-500">{t("docs.noResults")}</p>}</div></ScrollArea>
    </>}
  </aside>;
}
