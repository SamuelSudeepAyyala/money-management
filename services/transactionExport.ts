import { Transaction } from "../components/moneyflow/types";

export function downloadTransactionsCsv(transactions: Transaction[]) {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = ["Date,Name,Type,Category,Account,Amount,Notes", ...transactions.map(transaction => [transaction.date, transaction.name, transaction.type, transaction.category, transaction.account, transaction.amount.toFixed(2), transaction.notes || ""].map(escape).join(","))];
  const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "moneyflow-transactions.csv"; link.click(); URL.revokeObjectURL(url);
}

