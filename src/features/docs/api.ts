import {axiosInstance} from "@/utils/axios-instance";

export interface DocumentationArticleSummary {
  module: string;
  slug: string;
  title: string;
  description: string;
  section: string;
  route?: string | null;
  roles: string[];
  superUserOnly: boolean;
  feature?: string | null;
  order: number;
}

export interface DocumentationArticle {
  summary: DocumentationArticleSummary;
  content: string;
}

export interface DocumentationIndex {
  locale: string;
  articles: DocumentationArticleSummary[];
}

export const getDocumentationIndex = async (locale: string) =>
  (await axiosInstance.get<DocumentationIndex>("docs", {params: {locale}})).data;

export const getDocumentationArticle = async (module: string, slug: string, locale: string) =>
  (await axiosInstance.get<DocumentationArticle>(`docs/${module}/${slug}`, {params: {locale}})).data;

