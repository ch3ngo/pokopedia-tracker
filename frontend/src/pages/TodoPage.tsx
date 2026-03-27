import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Plus } from "lucide-react";
import { useTodoStore } from "../store";

export function TodoPage() {
  const { t } = useTranslation();
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodoStore();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    addTodo(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  const remaining = todos.filter((t) => !t.done).length;
  const hasCompleted = todos.some((t) => t.done);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-pixel text-lg text-gray-900 dark:text-white mb-1">{t("todo.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("todo.subtitle")}</p>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 200))}
          onKeyDown={handleKeyDown}
          placeholder={t("todo.placeholder")}
          className="flex-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:focus:border-brand-400 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("todo.add")}
        </button>
      </div>

      {/* List */}
      {todos.length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 italic py-12">
          {t("todo.empty")}
        </p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                className="w-4 h-4 accent-brand-500 cursor-pointer shrink-0"
              />
              <span
                className={`flex-1 text-sm ${
                  todo.done
                    ? "line-through text-gray-400 dark:text-gray-500"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {todos.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-400 dark:text-gray-500">
          <span>{remaining} {t("todo.itemsLeft")}</span>
          {hasCompleted && (
            <button
              onClick={clearCompleted}
              className="hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              {t("todo.clearCompleted")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
