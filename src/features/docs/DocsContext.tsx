import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useLocation} from "react-router";
import {useTranslation} from "react-i18next";
import {getDocumentationArticle, getDocumentationIndex, DocumentationArticle, DocumentationArticleSummary} from "./api";
import {useAuth} from "@/components/AppContext";

interface DocsContextValue {
  index: DocumentationArticleSummary[];
  loading: boolean;
  open: boolean;
  selected: DocumentationArticleSummary | null;
  selectedArticle: DocumentationArticle | null;
  setSelected: (article: DocumentationArticleSummary | null) => void;
  openHelp: () => void;
  closeHelp: () => void;
}

const Context = createContext<DocsContextValue | null>(null);

function routeMatches(pattern: string | null | undefined, pathname: string) {
  if (!pattern) return false;
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return false;
  return patternParts.every((part, index) => part.startsWith(":") || part === "*" || part === pathParts[index]);
}

export const DocsProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {isAuthenticated} = useAuth();
  const {i18n} = useTranslation();
  const location = useLocation();
  const locale = i18n.language?.toLowerCase().startsWith("es") ? "es" : "en";
  const [index, setIndex] = useState<DocumentationArticleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DocumentationArticleSummary | null>(null);
  const [selectedArticle, setLoadedArticle] = useState<DocumentationArticle | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { setIndex([]); return; }
    setLoading(true);
    getDocumentationIndex(locale).then(data => setIndex(data.articles)).catch(() => setIndex([])).finally(() => setLoading(false));
  }, [isAuthenticated, locale]);

  const currentArticle = useMemo(() => index.find(article => routeMatches(article.route, location.pathname)) ?? null, [index, location.pathname]);
  const selectArticle = useCallback((article: DocumentationArticleSummary | null) => {
    setSelected(article);
    setLoadedArticle(null);
    if (article) getDocumentationArticle(article.module, article.slug, locale).then(setLoadedArticle).catch(() => setLoadedArticle(null));
  }, [locale]);
  const openHelp = useCallback(() => { selectArticle(currentArticle); setOpen(true); }, [currentArticle, selectArticle]);
  const closeHelp = useCallback(() => setOpen(false), []);

  return <Context.Provider value={{index, loading, open, selected, selectedArticle, setSelected: selectArticle, openHelp, closeHelp}}>{children}</Context.Provider>;
};

export const useDocs = () => {
  const value = useContext(Context);
  if (!value) throw new Error("useDocs must be used inside DocsProvider");
  return value;
};
