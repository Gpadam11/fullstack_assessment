'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  logout,
  getAccessToken,
  Task,
} from '@/lib/api';
import { useToast } from '@/lib/toast';

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();

  // Check authentication
  useEffect(() => {
    if (!getAccessToken()) {
      router.push('/login');
    }
  }, [router]);

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks(currentPage, 10, searchQuery, filterStatus);
      setTasks(data);
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to fetch tasks',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchQuery, filterStatus, currentPage]);

  // Create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      addToast('Task title is required', 'error');
      return;
    }

    try {
      await createTask(newTaskTitle, newTaskDesc);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setCurrentPage(1);
      addToast('Task created successfully', 'success');
      fetchTasks();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to create task',
        'error'
      );
    }
  };

  // Update task
  const handleUpdateTask = async (id: string) => {
    if (!editTitle.trim()) {
      addToast('Task title is required', 'error');
      return;
    }

    try {
      await updateTask(id, editTitle, editDesc);
      setEditingId(null);
      addToast('Task updated successfully', 'success');
      fetchTasks();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to update task',
        'error'
      );
    }
  };

  // Toggle task
  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id);
      addToast('Task status updated', 'success');
      fetchTasks();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to toggle task',
        'error'
      );
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(id);
      addToast('Task deleted successfully', 'success');
      fetchTasks();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to delete task',
        'error'
      );
    }
  };

  // Start editing
  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
  };

  // Logout
  const handleLogout = async () => {
    try {
      // We don't have userId here, but logout API should work without throwing
      await logout('');
    } catch (error) {
      console.error('Logout error:', error);
    }
    addToast('Logged out successfully', 'success');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Task Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Task description (optional)..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading && <p className="text-center text-gray-500">Loading tasks...</p>}

          {!loading && tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No tasks found</p>
              <p className="text-gray-400">Create a new task to get started!</p>
            </div>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              {editingId === task.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateTask(task.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.isCompleted}
                          onChange={() => handleToggleTask(task.id)}
                          className="w-5 h-5 rounded cursor-pointer"
                        />
                        <h3
                          className={`text-lg font-semibold ${
                            task.isCompleted
                              ? 'line-through text-gray-400'
                              : 'text-gray-800'
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                      {task.description && (
                        <p className="text-gray-600 mt-2 ml-8">{task.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(task)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 ml-8">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {tasks.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={tasks.length < 10}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
