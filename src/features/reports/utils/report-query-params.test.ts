import {ReportLookupOption, ReportVariableDescriptor, ReportVariableType} from "@/features/reports/data/types";
import {variableValuesFromQuery} from "./report-query-params";
import {ReportVariableValues} from "./report-variable-values";

/**
 * The drill-down query contract. This is where the coercion table lives or dies — every branch here
 * is a way a report link can silently show the wrong data, so each gets a case.
 */

const variable = (
  name: string,
  type: ReportVariableType,
  extra: Partial<ReportVariableDescriptor> = {},
): ReportVariableDescriptor => ({
  name,
  label: name,
  type,
  decimals: 2,
  required: false,
  allowMultiple: false,
  defaultValue: null,
  options: [],
  hasLookup: type === ReportVariableType.SqlLookup,
  order: 0,
  ...extra,
});

const option = (value: string): ReportLookupOption => ({value, label: value});

/** Mirrors buildInitialVariableValues' shape rules without importing the component. */
const baseFor = (variables: ReportVariableDescriptor[]): ReportVariableValues => {
  const base: ReportVariableValues = {};
  for (const v of variables) {
    if (v.type === ReportVariableType.DateRange) base[v.name] = {from: null, to: null};
    else if (v.allowMultiple) base[v.name] = {values: v.defaultValue ? v.defaultValue.split(",") : []};
    else base[v.name] = {value: v.defaultValue};
  }
  return base;
};

const parse = (variables: ReportVariableDescriptor[], query: string) =>
  variableValuesFromQuery(variables, new URLSearchParams(query), baseFor(variables));

describe("variableValuesFromQuery", () => {
  describe("the drill-down that motivated this", () => {
    const variables = [
      variable("ItemCode", ReportVariableType.Text),
      variable("WhsCode", ReportVariableType.SqlLookup),
    ];

    it("applies both filters from a report link", () => {
      const {values, problems} = parse(variables, "ItemCode=A001&WhsCode=01");
      expect(problems).toEqual([]);
      expect(values).toEqual({ItemCode: {value: "A001"}, WhsCode: {value: "01"}});
    });

    it("decodes a value that needed encoding", () => {
      // encodeURIComponent("A/B 100") — the link resolver's output must survive the round trip.
      const {values} = parse(variables, "ItemCode=A%2FB%20100");
      expect(values.ItemCode).toEqual({value: "A/B 100"});
    });

    it("matches names case-insensitively", () => {
      const {values, problems} = parse(variables, "itemcode=A001");
      expect(problems).toEqual([]);
      expect(values.ItemCode).toEqual({value: "A001"});
    });

    it("keeps the declared default for a variable the URL omits", () => {
      const withDefault = [variable("ItemCode", ReportVariableType.Text, {defaultValue: "SEED"})];
      const {values} = parse(withDefault, "");
      expect(values.ItemCode).toEqual({value: "SEED"});
    });
  });

  describe("Boolean / YesNo — SAP's Y/N must work", () => {
    const variables = [variable("OnlyInStock", ReportVariableType.YesNo)];

    it.each([
      ["Y", "true"], ["y", "true"], ["yes", "true"], ["1", "true"], ["true", "true"], ["TRUE", "true"],
      ["N", "false"], ["n", "false"], ["no", "false"], ["0", "false"], ["false", "false"],
    ])("normalizes %s to %s", (input, expected) => {
      const {values, problems} = parse(variables, `OnlyInStock=${input}`);
      expect(problems).toEqual([]);
      // Must be literally "true"/"false": the filter bar's select and the backend both speak that,
      // and "Y" would render a blank control AND 400 the run.
      expect(values.OnlyInStock).toEqual({value: expected});
    });

    it("rejects a value that is not a flag", () => {
      const {problems} = parse(variables, "OnlyInStock=maybe");
      expect(problems).toEqual([{param: "OnlyInStock", kind: "invalidValue", value: "maybe"}]);
    });
  });

  describe("numbers", () => {
    it.each(["5", "-5", "+5", "0"])("accepts integer %s", (input) => {
      expect(parse([variable("Qty", ReportVariableType.Integer)], `Qty=${input}`).problems).toEqual([]);
    });

    it.each(["abc", "1.5", "1e3", "", " "])("rejects integer %s", (input) => {
      // Empty/blank is the exception: it is an explicit clear, not an invalid value.
      const {values, problems} = parse([variable("Qty", ReportVariableType.Integer)], `Qty=${input}`);
      if (input.trim() === "") {
        expect(problems).toEqual([]);
        expect(values.Qty).toEqual({value: null});
      } else {
        expect(problems).toHaveLength(1);
        expect(problems[0].kind).toBe("invalidValue");
      }
    });

    it.each(["1.5", ".5", "5.", "-1.5", "0"])("accepts decimal %s", (input) => {
      expect(parse([variable("Price", ReportVariableType.Decimal)], `Price=${input}`).problems).toEqual([]);
    });

    it.each(["1,5", "abc", "1.2.3"])("rejects decimal %s", (input) => {
      expect(parse([variable("Price", ReportVariableType.Decimal)], `Price=${input}`).problems).toHaveLength(1);
    });
  });

  describe("dates", () => {
    const variables = [variable("Day", ReportVariableType.Date)];

    it("accepts a real date", () => {
      const {values, problems} = parse(variables, "Day=2026-07-16");
      expect(problems).toEqual([]);
      expect(values.Day).toEqual({value: "2026-07-16"});
    });

    it("rejects 2026-02-31 — a regex would pass it and JS rolls it to Mar 3", () => {
      const {problems} = parse(variables, "Day=2026-02-31");
      expect(problems).toEqual([{param: "Day", kind: "invalidValue", value: "2026-02-31"}]);
    });

    it("accepts Feb 29 in a leap year and rejects it otherwise", () => {
      expect(parse(variables, "Day=2028-02-29").problems).toEqual([]);
      expect(parse(variables, "Day=2026-02-29").problems).toHaveLength(1);
    });

    it.each(["16/07/2026", "2026-7-16", "not-a-date", "2026-13-01"])("rejects %s", (input) => {
      expect(parse(variables, `Day=${encodeURIComponent(input)}`).problems).toHaveLength(1);
    });

    it("normalizes a datetime without seconds", () => {
      const {values} = parse([variable("At", ReportVariableType.DateTime)], "At=2026-07-16T14:30");
      expect(values.At).toEqual({value: "2026-07-16T14:30:00"});
    });

    it("rejects an out-of-range clock", () => {
      expect(parse([variable("At", ReportVariableType.DateTime)], "At=2026-07-16T25:00").problems).toHaveLength(1);
    });
  });

  describe("DateRange — two params, mirroring the backend's @XFrom/@XTo", () => {
    const variables = [variable("Period", ReportVariableType.DateRange)];

    it("reads both edges", () => {
      const {values, problems} = parse(variables, "PeriodFrom=2026-01-01&PeriodTo=2026-03-31");
      expect(problems).toEqual([]);
      expect(values.Period).toEqual({from: "2026-01-01", to: "2026-03-31"});
    });

    it("reads one edge and leaves the other null", () => {
      const {values} = parse(variables, "PeriodFrom=2026-01-01");
      expect(values.Period).toEqual({from: "2026-01-01", to: null});
    });

    it("rejects the bare name — a range is two params, not one", () => {
      const {problems} = parse(variables, "Period=2026-01-01");
      expect(problems).toEqual([{param: "Period", kind: "invalidValue", value: "2026-01-01"}]);
    });

    it("rejects an impossible edge", () => {
      expect(parse(variables, "PeriodFrom=2026-02-31").problems).toHaveLength(1);
    });

    it("lets a variable literally named PeriodFrom win over the range's From half", () => {
      const both = [variable("Period", ReportVariableType.DateRange), variable("PeriodFrom", ReportVariableType.Text)];
      const {values, problems} = parse(both, "PeriodFrom=hello");
      expect(problems).toEqual([]);
      expect(values.PeriodFrom).toEqual({value: "hello"});
      expect(values.Period).toEqual({from: null, to: null});
    });
  });

  describe("allowMultiple", () => {
    const variables = [variable("Whs", ReportVariableType.SqlLookup, {allowMultiple: true})];

    it("splits CSV", () => {
      const {values, problems} = parse(variables, "Whs=01,02");
      expect(problems).toEqual([]);
      expect(values.Whs).toEqual({values: ["01", "02"]});
    });

    it("accepts repeated keys as the same thing", () => {
      expect(parse(variables, "Whs=01&Whs=02").values.Whs).toEqual({values: ["01", "02"]});
    });

    it("drops blank members", () => {
      expect(parse(variables, "Whs=01,,02,").values.Whs).toEqual({values: ["01", "02"]});
    });

    it("reports the offending member when one is invalid", () => {
      const nums = [variable("Qty", ReportVariableType.Integer, {allowMultiple: true})];
      expect(parse(nums, "Qty=1,abc,3").problems).toEqual([{param: "Qty", kind: "invalidValue", value: "abc"}]);
    });
  });

  describe("SelectList", () => {
    const variables = [
      variable("Status", ReportVariableType.SelectList, {options: [option("Open"), option("Closed")]}),
    ];

    it("emits the option's own casing, not the URL's", () => {
      // Must match the <SelectItem> that renders it, or the control shows blank while filtering.
      expect(parse(variables, "Status=open").values.Status).toEqual({value: "Open"});
    });

    it("rejects a choice that does not exist", () => {
      expect(parse(variables, "Status=Pending").problems).toEqual([
        {param: "Status", kind: "invalidValue", value: "Pending"},
      ]);
    });
  });

  describe("problems that must not be silent", () => {
    const variables = [variable("ItemCode", ReportVariableType.Text)];

    it("reports an unknown param — this is the typo case", () => {
      // ?ItemCod=A001 must not run unfiltered while the URL promises one item.
      const {problems} = parse(variables, "ItemCod=A001");
      expect(problems).toEqual([{param: "ItemCod", kind: "unknownParam"}]);
    });

    it("echoes the param key verbatim, not normalized", () => {
      expect(parse(variables, "ITEMCOD=x").problems[0].param).toBe("ITEMCOD");
    });

    it("reports two keys resolving to the same variable rather than last-write-wins", () => {
      const {problems} = parse(variables, "ItemCode=A&itemcode=B");
      expect(problems).toHaveLength(1);
      expect(problems[0].kind).toBe("duplicateParam");
    });

    it("reports repeated keys on a single-valued variable", () => {
      const {problems} = parse(variables, "ItemCode=A&ItemCode=B");
      expect(problems).toEqual([{param: "ItemCode", kind: "duplicateParam"}]);
    });

    it("keeps the base value untouched when a value is invalid", () => {
      const withDefault = [variable("Qty", ReportVariableType.Integer, {defaultValue: "7"})];
      const {values} = parse(withDefault, "Qty=abc");
      expect(values.Qty).toEqual({value: "7"});
    });
  });

  describe("reserved and empty", () => {
    const variables = [variable("ItemCode", ReportVariableType.Text)];

    it("skips __-prefixed params silently — they are the runner's, not a variable's", () => {
      const {problems, values} = parse(variables, "__sort=OnHand&__offset=50");
      expect(problems).toEqual([]);
      expect(values.ItemCode).toEqual({value: null});
    });

    it("treats present-but-empty as an explicit clear, overriding the default", () => {
      const withDefault = [variable("ItemCode", ReportVariableType.Text, {defaultValue: "SEED"})];
      const {values, problems} = parse(withDefault, "ItemCode=");
      expect(problems).toEqual([]);
      expect(values.ItemCode).toEqual({value: null});
    });

    it("does not mutate the base object", () => {
      const base = baseFor(variables);
      variableValuesFromQuery(variables, new URLSearchParams("ItemCode=A001"), base);
      expect(base.ItemCode).toEqual({value: null});
    });
  });
});
