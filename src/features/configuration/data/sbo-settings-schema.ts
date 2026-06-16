import {OptionField} from "./options-schema";

/**
 * Declarative schema for the friendly "SBO Settings" editor. Same string-valued,
 * PascalCase JSON contract as the Options editor; secret leaves (Password,
 * ServerPassword) arrive masked and are kept on save unless changed.
 */

export const SBO_GROUPS = ["connection", "advanced"] as const;
export type SboGroup = (typeof SBO_GROUPS)[number];

export const SBO_FIELDS: OptionField[] = [
  // Connection (SAP Service Layer)
  {key: "ServiceLayerUrl", kind: "string", group: "connection"},
  {key: "Database", kind: "string", group: "connection"},
  {key: "User", kind: "string", group: "connection"},
  {key: "Password", kind: "secret", group: "connection"},

  // Advanced / database server
  {key: "Server", kind: "string", group: "advanced"},
  {key: "ServerType", kind: "int", group: "advanced"},
  {key: "TrustedConnection", kind: "bool", group: "advanced"},
  {key: "ServerUser", kind: "string", group: "advanced"},
  {key: "ServerPassword", kind: "secret", group: "advanced"},
  {key: "ServiceLayerTimeoutSeconds", kind: "int", group: "advanced"},
];
