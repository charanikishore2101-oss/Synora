import { useState } from 'react';
import {
  Calculator as CalcIcon,
  Copy,
  Check,
  Trash2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useLayoutStore } from '../../store/useLayoutStore';

export function MiniCalculator() {
  const {
    expression,
    result,
    mode,
    history,
    appendValue,
    clear,
    deleteLast,
    calculate,
    setMode,
    clearHistory,
    setExpression,
  } = useCalculatorStore();
  const { expandToWorkspace } = useLayoutStore();

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        expandToWorkspace('calculator');
      } else {
        calculate();
      }
    } else if (e.key === 'Escape') {
      clear();
    } else if (e.key === 'Backspace') {
      deleteLast();
    } else if (/^[0-9+\-*/().^]$/.test(e.key)) {
      appendValue(e.key);
    }
  };

  const buttons = mode === 'standard' ? [
    ['C', '(', ')', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ] : [
    ['sin(', 'cos(', 'tan(', 'C'],
    ['sqrt(', 'log(', '^', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ];

  const handleButtonClick = (btn: string) => {
    if (btn === 'C') clear();
    else if (btn === '⌫') deleteLast();
    else if (btn === '=') calculate();
    else appendValue(btn);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between focus:outline-none" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Top Controls & Display */}
      <div className="p-3 rounded-2xl glass-panel border border-white/10 space-y-1 mb-2">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5 font-semibold text-violet-400">
            <CalcIcon className="w-3.5 h-3.5" />
            <span>Mini Calculator</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMode(mode === 'standard' ? 'scientific' : 'standard')}
              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-white font-mono uppercase transition-all"
            >
              {mode}
            </button>

            <button
              onClick={() => expandToWorkspace('calculator')}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              title="Expand Calculator (Ctrl + Enter)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Math Expression & Output */}
        <div className="text-right">
          <div className="text-xs text-gray-400 font-mono h-4 overflow-hidden truncate">
            {expression || '0'}
          </div>
          <div className="flex items-center justify-between mt-1">
            <button
              onClick={handleCopy}
              className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <div className="text-2xl font-bold text-white font-mono tracking-tight drop-shadow-md">
              {result}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Keypad & History */}
      <div className="grid grid-cols-5 gap-2 flex-1 overflow-hidden">
        {/* Keypad Grid */}
        <div className="col-span-3 grid grid-cols-4 gap-1.5">
          {buttons.flat().map((btn, idx) => {
            const isOperator = ['÷', '×', '-', '+', '='].includes(btn);
            const isControl = ['C', '⌫'].includes(btn);
            return (
              <button
                key={`${btn}-${idx}`}
                onClick={() => handleButtonClick(btn)}
                className={`rounded-xl text-xs font-semibold font-mono transition-all duration-150 flex items-center justify-center ${
                  btn === '='
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:brightness-110 active:scale-95'
                    : isOperator
                    ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30'
                    : isControl
                    ? 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/30'
                    : 'bg-white/5 hover:bg-white/15 text-white border border-white/10'
                }`}
              >
                {btn}
              </button>
            );
          })}
        </div>

        {/* History Preview Sidebar */}
        <div className="col-span-2 p-2 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-400" /> History
            </span>
            {history.length > 0 && (
              <button onClick={clearHistory} className="hover:text-red-400">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 scrollbar-none">
            {history.length === 0 ? (
              <p className="text-[10px] text-gray-500 text-center py-4">No calculations yet</p>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setExpression(h.result)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 cursor-pointer text-right border border-white/5 transition-all"
                >
                  <div className="text-[9px] text-gray-400 font-mono truncate">{h.expression}</div>
                  <div className="text-xs font-bold text-white font-mono truncate">= {h.result}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
