import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, CheckSquare } from 'lucide-react';
import { useGoalsStore } from '../../store/useGoalsStore';

export function TodayGoals() {
  const { goals, loadGoals, addGoal, toggleGoal, deleteGoal, clearCompleted } = useGoalsStore();
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      await addGoal(newTitle.trim());
      setNewTitle('');
    }
  };

  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <div className="glass-panel p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Today's Goals</h4>
            <p className="text-[10px] text-gray-400">
              {completedCount} of {goals.length} completed
            </p>
          </div>
        </div>

        {completedCount > 0 && (
          <button
            onClick={clearCompleted}
            className="text-[10px] text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear Done
          </button>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a goal for today..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          data-magnetic
          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Goals List */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {goals.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No goals added yet for today.</p>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                goal.completed
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-gray-400 line-through'
                  : 'bg-white/5 border-white/5 text-gray-200 hover:bg-white/10'
              }`}
            >
              <div
                onClick={() => toggleGoal(goal.id)}
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                {goal.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-500 shrink-0" />
                )}
                <span className="truncate">{goal.title}</span>
              </div>

              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-gray-500 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
