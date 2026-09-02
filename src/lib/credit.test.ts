import { describe, expect, it } from 'vitest';
import { summarizeCustomerCredits, getCreditStatus } from './credit';

describe('summarizeCustomerCredits', () => {
  it('adds up all outstanding credit balances', () => {
    const summary = summarizeCustomerCredits([
      { amountDue: 50000 },
      { amountDue: 15000 },
      { amountDue: 0 },
    ]);

    expect(summary.totalOutstanding).toBe(65000);
    expect(summary.activeCustomers).toBe(2);
  });

  it('tracks due today and overdue unpaid loans', () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const future = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const summary = summarizeCustomerCredits([
      { customerName: 'A', amountDue: 30000, paidAmount: 10000, dueDate: yesterday },
      { customerName: 'B', amountDue: 20000, paidAmount: 0, dueDate: today },
      { customerName: 'C', amountDue: 10000, paidAmount: 10000, dueDate: future },
      { customerName: 'D', amountDue: 0, paidAmount: 0, dueDate: today },
    ]);

    expect(summary.totalOutstanding).toBe(40000);
    expect(summary.activeCustomers).toBe(2);
    expect(summary.dueTodayCount).toBe(1);
    expect(summary.overdueCount).toBe(1);
  });

  it('marks fully paid loans as completed', () => {
    expect(getCreditStatus(20000, 20000)).toBe('completed');
    expect(getCreditStatus(20000, 10000)).toBe('partial');
    expect(getCreditStatus(20000, 0)).toBe('open');
  });
});
