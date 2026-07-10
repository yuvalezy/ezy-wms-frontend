import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {useTranslation} from "react-i18next";
import ContentTheme from "@/components/ContentTheme";
import {useDocs} from "./DocsContext";
import {getDocumentationArticle, DocumentationArticle} from "./api";
import MarkdownRenderer from "./MarkdownRenderer";

export default function DocsPage() {
  const {module, "*": wildcard} = useParams();
  const {i18n, t} = useTranslation();
  const navigate = useNavigate();
  const {index} = useDocs();
  const locale = i18n.language?.toLowerCase().startsWith("es") ? "es" : "en";
  const slug = wildcard || "index";
  const [article, setArticle] = useState<DocumentationArticle | null>(null);
  const summary = index.find(value => value.module === (module || "overview") && value.slug === slug);
  const currentIndex = summary ? index.findIndex(value => value.module === summary.module && value.slug === summary.slug) : -1;
  const previous = currentIndex > 0 ? index[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < index.length - 1 ? index[currentIndex + 1] : null;

  useEffect(() => {
    if (!module) { setArticle(null); return; }
    getDocumentationArticle(module, slug, locale).then(setArticle).catch(() => setArticle(null));
  }, [module, slug, locale]);

  return <ContentTheme title={t("docs.title")} titleBreadcrumbs={summary ? [{label: summary.title}] : []}>
    <div className="mx-auto max-w-5xl bg-white p-5 md:p-8">
      {!module ? <><h1 className="mb-2 text-3xl font-semibold">{t("docs.title")}</h1><p className="mb-8 text-slate-600">{t("docs.subtitle")}</p><div className="grid gap-3 sm:grid-cols-2">{index.map(value => <button key={`${value.module}/${value.slug}`} onClick={() => navigate(`/docs/${value.module}/${value.slug}`)} className="rounded-lg border p-4 text-left hover:border-blue-300 hover:bg-blue-50"><div className="font-medium">{value.title}</div><p className="mt-1 text-sm text-slate-500">{value.description}</p></button>)}</div></> : article ? <><h1 className="mb-2 text-3xl font-semibold">{article.summary.title}</h1><p className="mb-8 text-slate-600">{article.summary.description}</p><MarkdownRenderer content={article.content}/><div className="mt-10 flex justify-between gap-4 border-t pt-5"><button disabled={!previous} onClick={() => previous && navigate(`/docs/${previous.module}/${previous.slug}`)} className="text-left text-sm text-blue-700 disabled:invisible">← {previous?.title}</button><button disabled={!next} onClick={() => next && navigate(`/docs/${next.module}/${next.slug}`)} className="text-right text-sm text-blue-700 disabled:invisible">{next?.title} →</button></div></> : <p className="text-slate-500">{t("docs.notFound")}</p>}
    </div>
  </ContentTheme>;
}
