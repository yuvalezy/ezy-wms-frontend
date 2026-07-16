import {ReportColumnLinkType} from "@/features/reports/data/types";
import {isSafeReportLink, resolveReportLink} from "./report-link";

/**
 * The link resolver decides what becomes an `href`, so every branch here is a way a report cell can
 * point somewhere wrong — or somewhere hostile.
 *
 * The security cases are the point: the *template* is operator-authored and fixes the scheme, while
 * *values* come from SAP rows. These prove a value can never choose the scheme, escape the path, or
 * become the host.
 */

const internal = {linkType: ReportColumnLinkType.Internal, linkTemplate: "/itemCheck/{ItemCode}"};
const external = {linkType: ReportColumnLinkType.External, linkTemplate: "https://www.google.com/search?q={WhsName}"};

const row = {ItemCode: "A/B 100", WhsName: "Almacén & Cía", OnHand: 5, Missing: null};

describe("resolveReportLink", () => {
  describe("composition", () => {
    it("percent-encodes a value containing a slash and a space", () => {
      expect(resolveReportLink(internal, row)).toEqual({href: "/itemCheck/A%2FB%20100", external: false});
    });

    it("percent-encodes an ampersand into a query string", () => {
      // A warehouse name with & would otherwise split into a second query param.
      expect(resolveReportLink(external, row)).toEqual({
        href: "https://www.google.com/search?q=Almac%C3%A9n%20%26%20C%C3%ADa",
        external: true,
      });
    });

    it("matches placeholders to row keys case-insensitively", () => {
      expect(resolveReportLink({...internal, linkTemplate: "/itemCheck/{itemcode}"}, row))
        .toEqual({href: "/itemCheck/A%2FB%20100", external: false});
    });

    it("renders a numeric value", () => {
      expect(resolveReportLink({...internal, linkTemplate: "/x/{OnHand}"}, row))
        .toEqual({href: "/x/5", external: false});
    });

    it("composes the report drill-down, encoding each value independently", () => {
      const link = {
        linkType: ReportColumnLinkType.Internal,
        linkTemplate: "/reports/bin-stock?ItemCode={ItemCode}&WhsCode={WhsCode}",
      };
      expect(resolveReportLink(link, {ItemCode: "A/B 100", WhsCode: "01"})).toEqual({
        href: "/reports/bin-stock?ItemCode=A%2FB%20100&WhsCode=01",
        external: false,
      });
    });
  });

  describe("refusing to link", () => {
    it("returns null when the column does not link", () => {
      expect(resolveReportLink({linkType: ReportColumnLinkType.None, linkTemplate: "/x"}, row)).toBeNull();
    });

    it("returns null when a placeholder is NULL in this row", () => {
      // A live-looking /itemCheck/undefined is worse than the plain text it replaced.
      expect(resolveReportLink({...internal, linkTemplate: "/x/{Missing}"}, row)).toBeNull();
    });

    it("returns null when a placeholder names no column", () => {
      expect(resolveReportLink({...internal, linkTemplate: "/x/{Nope}"}, row)).toBeNull();
    });

    it("returns null for a blank value", () => {
      expect(resolveReportLink(internal, {ItemCode: "   "})).toBeNull();
    });

    it("hides the drill-down where the guard column is NULL", () => {
      // How stock-on-hand stops offering a journey into an empty bin report: BinLinkItem is NULL
      // exactly where the warehouse has bins turned off.
      const link = {
        linkType: ReportColumnLinkType.Internal,
        linkTemplate: "/reports/bin-stock?ItemCode={BinLinkItem}&WhsCode={WhsCode}",
      };
      expect(resolveReportLink(link, {BinLinkItem: null, WhsCode: "02"})).toBeNull();
      expect(resolveReportLink(link, {BinLinkItem: "A001", WhsCode: "01"})).not.toBeNull();
    });
  });

  describe("a row value must never decide where a cell points", () => {
    const hostile = {ItemCode: "javascript:alert(1)", Path: "../../admin", Host: "//evil.com", Q: "x&admin=1"};

    it("cannot inject a scheme", () => {
      expect(resolveReportLink(internal, hostile))
        .toEqual({href: "/itemCheck/javascript%3Aalert(1)", external: false});
    });

    it("cannot traverse the path", () => {
      expect(resolveReportLink({...internal, linkTemplate: "/x/{Path}"}, hostile))
        .toEqual({href: "/x/..%2F..%2Fadmin", external: false});
    });

    it("cannot become the host", () => {
      expect(resolveReportLink({...internal, linkTemplate: "/x/{Host}"}, hostile))
        .toEqual({href: "/x/%2F%2Fevil.com", external: false});
    });

    it("cannot inject an extra query parameter", () => {
      expect(resolveReportLink({...internal, linkTemplate: "/x?q={Q}"}, hostile))
        .toEqual({href: "/x?q=x%26admin%3D1", external: false});
    });
  });

  describe("a stored template is re-validated — a definition row can be hand-edited in the database", () => {
    it("refuses a javascript: template that never passed save-time validation", () => {
      expect(resolveReportLink({linkType: ReportColumnLinkType.External, linkTemplate: "javascript:alert(1)"}, row))
        .toBeNull();
    });

    it("refuses a protocol-relative internal template", () => {
      // "//evil.com/x" reads as root-relative but leaves the app.
      expect(resolveReportLink({linkType: ReportColumnLinkType.Internal, linkTemplate: "//evil.com/x"}, row))
        .toBeNull();
    });

    it("refuses a non-http external template", () => {
      expect(resolveReportLink({linkType: ReportColumnLinkType.External, linkTemplate: "ftp://files/x"}, row))
        .toBeNull();
    });
  });
});

describe("isSafeReportLink", () => {
  it.each([["/x", true], ["/reports/a?b=c", true], ["//evil.com", false], ["https://x", false], ["x", false]])(
    "internal %s -> %s", (href, expected) => {
      expect(isSafeReportLink(href as string, ReportColumnLinkType.Internal)).toBe(expected);
    });

  it.each([["https://x", true], ["http://x", true], ["HTTPS://x", true], ["/x", false], ["javascript:x", false]])(
    "external %s -> %s", (href, expected) => {
      expect(isSafeReportLink(href as string, ReportColumnLinkType.External)).toBe(expected);
    });

  it("never treats a None column as linkable", () => {
    expect(isSafeReportLink("/x", ReportColumnLinkType.None)).toBe(false);
  });
});
