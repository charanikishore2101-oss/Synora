import { create } from 'zustand';

export type CalculatorMode = 'standard' | 'scientific';

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

interface CalculatorState {
  expression: string;
  result: string;
  mode: CalculatorMode;
  history: CalculationHistoryItem[];
  setExpression: (expr: string) => void;
  appendValue: (val: string) => void;
  clear: () => void;
  deleteLast: () => void;
  calculate: () => void;
  setMode: (mode: CalculatorMode) => void;
  clearHistory: () => void;
}

// Safe Math Expression Parser
function evaluateExpression(expr: string): string {
  try {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/\^/g, '**');

    // Validate safe characters only
    if (!/^[0-9+\-*/().\sMathPIEsincostanlogsqrtln**]+$/.test(sanitized)) {
      return 'Error';
    }

    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${sanitized})`)();
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(8)).toString();
    }
    return 'Error';
  } catch {
    return 'Error';
  }
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  expression: '',
  result: '0',
  mode: 'standard',
  history: [],

  setExpression: (expr) => {
    const res = expr.trim() ? evaluateExpression(expr) : '0';
    set({ expression: expr, result: res });
  },

  appendValue: (val) => {
    const current = get().expression;
    const updated = current + val;
    const res = evaluateExpression(updated);
    set({ expression: updated, result: res });
  },

  clear: () => set({ expression: '', result: '0' }),

  deleteLast: () => {
    const current = get().expression;
    if (!current) return;
    const updated = current.slice(0, -1);
    const res = updated.trim() ? evaluateExpression(updated) : '0';
    set({ expression: updated, result: res });
  },

  calculate: () => {
    const { expression, result, history } = get();
    if (!expression.trim() || result === 'Error') return;

    const newItem: CalculationHistoryItem = {
      id: `calc-${Date.now()}`,
      expression,
      result,
      timestamp: Date.now(),
    };

    set({
      expression: result,
      history: [newItem, ...history].slice(0, 20),
    });
  },

  setMode: (mode) => set({ mode }),

  clearHistory: () => set({ history: [] }),
}));
