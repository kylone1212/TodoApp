'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './page.module.css';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className={styles.checkIcon}>
      <polyline points="1.5,6 4.5,9 10.5,3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,3.5 13,3.5" />
      <path d="M4.5,3.5V2.5a1,1,0,0,1,1-1h3a1,1,0,0,1,1,1v1" />
      <path d="M5.5,6.5v4M8.5,6.5v4" />
      <path d="M2.5,3.5l0.7,8.3a1,1,0,0,0,1,0.7h5.6a1,1,0,0,0,1-0.7l0.7-8.3" />
    </svg>
  );
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('shizuka-todos');
      if (saved) setTodos(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('shizuka-todos', JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const addTodo = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const newTodo: Todo = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      completed: false,
    };
    setTodos(prev => [newTodo, ...prev]);
    setInput('');
    inputRef.current?.focus();
  }, [input]);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const removeTodo = useCallback((id: string) => {
    setRemovingIds(prev => new Set([...prev, id]));
    setTimeout(() => {
      setTodos(prev => prev.filter(t => t.id !== id));
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 280);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTodo();
  };

  const active = todos.filter(t => !t.completed);
  const completed = todos.filter(t => t.completed);
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.kana}>タスク管理</span>
          <h1 className={styles.title}>静</h1>
          <p className={styles.date}>{today}</p>
          {mounted && todos.length > 0 && (
            <div className={styles.stats}>
              <span className={styles.statItem}>
                <span className={styles.statDot} />
                残り {active.length} 件
              </span>
              <span className={styles.statItem}>
                <span className={`${styles.statDot} ${styles.done}`} />
                完了 {completed.length} 件
              </span>
            </div>
          )}
        </header>

        <div className={styles.inputArea}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="新しいタスクを入力..."
            maxLength={200}
            aria-label="新しいタスク"
          />
          <button
            className={styles.addButton}
            onClick={addTodo}
            disabled={!input.trim()}
            aria-label="タスクを追加"
          >
            <span className={styles.addIcon}>＋</span>
            追加
          </button>
        </div>

        <div className={styles.taskList} role="list" aria-label="タスク一覧">
          {!mounted ? null : todos.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🌿</span>
              <p className={styles.emptyTitle}>タスクはありません</p>
              <p className={styles.emptyDesc}>上の入力欄からタスクを追加しましょう</p>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <>
                  {completed.length > 0 && (
                    <p className={styles.sectionLabel}>未完了</p>
                  )}
                  {active.map(todo => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      removing={removingIds.has(todo.id)}
                      onToggle={toggleTodo}
                      onRemove={removeTodo}
                      styles={styles}
                    />
                  ))}
                </>
              )}

              {completed.length > 0 && (
                <>
                  {active.length > 0 && <div className={styles.divider} />}
                  <p className={styles.sectionLabel}>完了済み</p>
                  {completed.map(todo => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      removing={removingIds.has(todo.id)}
                      onToggle={toggleTodo}
                      onRemove={removeTodo}
                      styles={styles}
                    />
                  ))}
                </>
              )}

              {active.length === 0 && completed.length > 0 && (
                <div className={styles.allDone}>
                  ✦ すべてのタスクが完了しました
                </div>
              )}
            </>
          )}
        </div>

        <footer className={styles.footer}>
          <p>静 — シンプルなタスク管理</p>
        </footer>
      </div>
    </div>
  );
}

type TodoItemProps = {
  todo: Todo;
  removing: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  styles: Record<string, string>;
};

function TodoItem({ todo, removing, onToggle, onRemove, styles }: TodoItemProps) {
  return (
    <div
      role="listitem"
      className={[
        styles.taskItem,
        todo.completed ? styles.completed : '',
        removing ? styles.removing : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        className={styles.checkButton}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'タスクを未完了にする' : 'タスクを完了にする'}
        aria-pressed={todo.completed}
      >
        {todo.completed && <CheckIcon />}
      </button>

      <span className={styles.taskText}>{todo.text}</span>

      <button
        className={styles.deleteButton}
        onClick={() => onRemove(todo.id)}
        aria-label="タスクを削除"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
