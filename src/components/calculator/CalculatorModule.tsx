import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator as CalcIcon,
  Copy,
  Check,
  Trash2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useCalculatorStore } from '../../store/useCalculatorStore';

export function CalculatorModule() {
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

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      calculate();
    } else if (e.key === 'Escape') {
      clear();
    } else if (e.key === 'Backspace') {
      deleteLast();
    } else if (/^[0-9+\-*/().^]$/.test(e.key)) {
      appendValue(e.key);
    }
  };

  const standardButtons = [
    ['C', '(', ')', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ];

  const scientificButtons = [
    ['sin(', 'cos(', 'tan(', 'C', '÷'],
    ['sqrt(', 'log(', 'ln(', '^', '×'],
    ['7', '8', '9', '(', '-'],
    ['4', '5', '6', ')', '+'],
    ['1', '2', '3', '0', '.'],
    ['π', 'e', '⌫', '=', '='],
  ];

  const buttons = mode === 'scientific' ? scientificButtons : standardButtons;

  const handleButtonClick = (btn: string) => {
    if (btn === 'C') clear();
    else if (btn === '⌫') deleteLast();
    else if (btn === '=') calculate();
    else appendValue(btn);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="glass-panel p-6 w-full max-w-4xl mx-auto h-[560px] flex flex-col justify-between overflow-hidden shadow-2xl focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg">
            <CalcIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Calculator Workspace</h3>
            <p className="text-xs text-gray-400 font-medium">Standard &amp; Scientific Expression Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode(mode === 'standard' ? 'scientific' : 'standard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              mode === 'scientific'
                ? 'bg-violet-500/25 text-violet-300 border-violet-500/40 shadow-md'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/15'
            }`}
          >
            {mode} Mode
          </button>

          <button
            onClick={clear}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/10"
            title="Clear Expression"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Keypad vs History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left Side: Display & Keypad */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-4">
          {/* Display Output Card */}
          <div className="p-4 rounded-2xl glass-panel border border-white/15 shadow-inner bg-black/20 text-right">
            <div className="text-xs font-mono text-gray-400 h-5 overflow-hidden truncate">
              {expression || '0'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Answer'}</span>
              </button>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                {result}
              </div>
            </div>
          </div>

          {/* Keypad Grid */}
          <div className={`grid ${mode === 'scientific' ? 'grid-cols-5 gap-2' : 'grid-cols-4 gap-2.5'} flex-1`}>
            {buttons.flat().map((btn, idx) => {
              const isOperator = ['÷', '×', '-', '+', '='].includes(btn);
              const isControl = ['C', '⌫'].includes(btn);
              return (
                <button
                  key={`${btn}-${idx}`}
                  onClick={() => handleButtonClick(btn)}
                  className={`rounded-2xl font-bold font-mono text-sm sm:text-base transition-all duration-150 flex items-center justify-center ${
                    btn === '='
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl hover:brightness-110 active:scale-95'
                      : isOperator
                      ? 'bg-violet-500/25 text-violet-300 hover:bg-violet-500/40 border border-violet-500/40'
                      : isControl
                      ? 'bg-pink-500/25 text-pink-300 hover:bg-pink-500/40 border border-pink-500/40'
                      : 'bg-white/5 hover:bg-white/15 text-white border border-white/10'
                  }`}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Calculation History Panel */}
        <div className="p-4 rounded-2xl glass-panel border border-white/15 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-400" /> Calculation History
            </span>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-xs">
                <CalcIcon className="w-8 h-8 mb-2 opacity-30 text-violet-400" />
                <p>History will appear here</p>
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setExpression(h.result)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 cursor-pointer text-right border border-white/10 transition-all group"
                >
                  <div className="text-xs text-gray-400 font-mono truncate">{h.expression}</div>
                  <div className="text-sm font-bold text-white font-mono truncate group-hover:text-violet-300">
                    = {h.result}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
