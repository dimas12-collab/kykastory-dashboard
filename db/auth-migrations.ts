import { sqlite } from "./index";

export function ensureAuthColumns() {
  const accountColumns = sqlite.prepare("PRAGMA table_info(account)").all() as { name: string }[];
  if (accountColumns.length && !accountColumns.some(column => column.name === "issuer")) sqlite.exec("ALTER TABLE account ADD COLUMN issuer TEXT;");
}
