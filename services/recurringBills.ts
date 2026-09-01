import { ApiRecurringBill } from "./api";

export function isRecurringBillDue(bill: ApiRecurringBill, today: string): boolean {
  return bill.next_due <= today;
}

export function dueRecurringBills(bills: ApiRecurringBill[], today: string): ApiRecurringBill[] {
  return bills.filter(bill => isRecurringBillDue(bill, today)).sort((left, right) => left.next_due.localeCompare(right.next_due));
}
