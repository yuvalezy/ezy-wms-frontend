import React from "react";
import {ExternalLink} from "lucide-react";
import {ResolvedReportLink} from "@/features/reports/utils/report-link";
import {cn} from "@/utils/css-utils";

/**
 * Renders one report cell as a hyperlink.
 *
 * Internal links navigate client-side (react-router) so the SPA never reloads; external links are a
 * plain `<a>` opening in a new tab. Both are real `<a href>` elements rather than click handlers on
 * a `<span>`, which is what keeps ctrl/cmd-click, middle-click, "Open in new tab" and "Copy link
 * address" working — a report is a list of things to go look at, so opening several in tabs is the
 * normal way to use one.
 *
 * The `href` is assumed already validated by `resolveReportLink`. This component composes no URLs.
 */

export interface ReportCellLinkProps {
  link: ResolvedReportLink;
  /** `useNavigate()`'s result. Only used for internal links. */
  onNavigate: (to: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function ReportCellLink({link, onNavigate, children, className}: ReportCellLinkProps) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        // noopener is the load-bearing half: without it the opened page gets a handle on this one
        // via window.opener and can navigate it. noreferrer also keeps SAP data out of the Referer
        // header, since a link template can put a row value in the query string.
        rel="noopener noreferrer"
        // A report row is not a navigation target the user chose, so an accidental click must not
        // take the table away with it; stop it reaching any row-level handler.
        onClick={(e) => e.stopPropagation()}
        className={cn("inline-flex items-center gap-1 text-blue-600 hover:underline", className)}
      >
        {children}
        <ExternalLink className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true"/>
      </a>
    );
  }

  return (
    <a
      href={link.href}
      onClick={(e) => {
        e.stopPropagation();
        // Modified clicks and anything but the primary button are the browser's to handle — that is
        // how "open this row in a new tab" works, and preventing it would break a real workflow.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        onNavigate(link.href);
      }}
      className={cn("text-blue-600 hover:underline", className)}
    >
      {children}
    </a>
  );
}

export default ReportCellLink;
