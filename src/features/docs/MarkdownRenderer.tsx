import React from "react";
import {Link} from "react-router";

const stripFrontmatter = (content: string) => content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const pattern = /(\!\[[^\]]*\]\([^)]*\)|\[[^\]]+\]\([^)]*\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(pattern);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (!part) return null;
    const image = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      const [src, ...titleParts] = image[2].trim().split(/\s+/);
      return <img key={key} src={src} alt={image[1]} title={titleParts.join(" ") || undefined} className="my-4 max-w-full rounded-lg border" />;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2].trim();
      if (href.startsWith("/")) return <Link key={key} to={href} className="text-blue-700 underline underline-offset-2">{inline(link[1], key)}</Link>;
      if (/^(https?:|mailto:)/i.test(href)) return <a key={key} href={href} target="_blank" rel="noreferrer" className="text-blue-700 underline underline-offset-2">{inline(link[1], key)}</a>;
      return <span key={key}>{inline(link[1], key)}</span>;
    }
    if ((part.startsWith("`") && part.endsWith("`"))) return <code key={key} className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>;
    if (part.startsWith("**") || part.startsWith("__")) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") || part.startsWith("_")) return <em key={key}>{part.slice(1, -1)}</em>;
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

export default function MarkdownRenderer({content}: {content: string}) {
  const lines = stripFrontmatter(content).split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let index = 0;
  let paragraph: string[] = [];
  let list: string[] = [];
  let ordered = false;
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(<p key={`p-${blocks.length}`} className="mb-4 leading-7">{inline(paragraph.join(" "), `p-${blocks.length}`)}</p>);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (!list.length) return;
    const Tag = ordered ? "ol" : "ul";
    blocks.push(<Tag key={`list-${blocks.length}`} className={`${ordered ? "list-decimal" : "list-disc"} mb-4 space-y-1 pl-6`}>{list.map((item, itemIndex) => <li key={itemIndex}>{inline(item, `list-${blocks.length}-${itemIndex}`)}</li>)}</Tag>);
    list = [];
  };

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim().startsWith("```")) {
      flushParagraph(); flushList();
      if (code) {
        blocks.push(<pre key={`code-${blocks.length}`} className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{code.join("\n")}</code></pre>);
        code = null;
      } else code = [];
      index++;
      continue;
    }
    if (code) { code.push(line); index++; continue; }
    if (line.trim().startsWith("|") && lines[index + 1]?.trim().match(/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/)) {
      flushParagraph(); flushList();
      const parseRow = (value: string) => value.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => cell.trim());
      const headers = parseRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) { rows.push(parseRow(lines[index])); index++; }
      blocks.push(<div key={`table-${blocks.length}`} className="mb-5 overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead><tr>{headers.map((header, cellIndex) => <th key={cellIndex} className="border bg-slate-50 px-3 py-2 font-semibold">{inline(header, `th-${blocks.length}-${cellIndex}`)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, cellIndex) => <td key={cellIndex} className="border px-3 py-2 align-top">{inline(row[cellIndex] ?? "", `td-${blocks.length}-${rowIndex}-${cellIndex}`)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (line.trim().startsWith(">")) {
      flushParagraph(); flushList();
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) { quote.push(lines[index].trim().replace(/^>\s?/, "")); index++; }
      blocks.push(<blockquote key={`quote-${blocks.length}`} className="mb-5 border-l-4 border-blue-300 bg-blue-50 px-4 py-3">{inline(quote.join(" "), `quote-${blocks.length}`)}</blockquote>);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      const level = heading[1].length;
      const Tag = (`h${level}`) as React.ElementType;
      blocks.push(<Tag key={`h-${blocks.length}`} className={`${level === 1 ? "text-2xl" : level === 2 ? "text-xl" : "text-lg"} mb-3 mt-7 font-semibold text-slate-900`}>{inline(heading[2], `h-${blocks.length}`)}</Tag>);
      index++; continue;
    }
    if (/^\s*([-*_])\s*\1\s*\1\s*$/.test(line)) { flushParagraph(); flushList(); blocks.push(<hr key={`hr-${blocks.length}`} className="my-6"/>); index++; continue; }
    const listItem = line.match(/^\s*(?:[-*+]\s+|(\d+)\.\s+)(.*)$/);
    if (listItem) {
      flushParagraph();
      const nextOrdered = Boolean(listItem[1]);
      if (list.length && ordered !== nextOrdered) flushList();
      ordered = nextOrdered; list.push(listItem[2]); index++; continue;
    }
    if (!line.trim()) { flushParagraph(); flushList(); index++; continue; }
    paragraph.push(line.trim()); index++;
  }
  flushParagraph(); flushList();
  if (code) blocks.push(<pre key={`code-${blocks.length}`} className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{code.join("\n")}</code></pre>);
  return <div className="docs-markdown text-slate-700">{blocks}</div>;
}
