import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderTasks } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import {
    createTask,
    deleteTask,
    deleteTasksByStatus,
    getTasks,
    updateTask,
} from '../services/taskService';
import './TodoPage.css';

function SortableTaskItem({ task, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={isDragging ? 'task-item task-item-dragging' : 'task-item'}
        >
            <button
                type="button"
                className="task-drag-handle"
                aria-label="Drag task to reorder"
                {...attributes}
                {...listeners}
            >
                ⋮⋮
            </button>

            {children}
        </li>
    );
}

export function TodoPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const todoTasks = useMemo(
        () => tasks.filter((task) => !task.done),
        [tasks]
    );

    const doneTasks = useMemo(
        () => tasks.filter((task) => task.done),
        [tasks]
    );

    async function loadTasks() {
        try {
            setIsLoading(true);
            setError('');

            const response = await getTasks();
            setTasks(response.tasks);
        } catch (err) {
            setError(err.message || 'Error loading tasks');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadTasks();
    }, []);

    function handleLogout() {
        logout();
        navigate('/');
    }

    async function handleCreateTask(event) {
        event.preventDefault();

        if (!newTaskTitle.trim()) {
            return;
        }

        try {
            const response = await createTask(newTaskTitle);
            setTasks((currentTasks) => [...currentTasks, response.task]);
            setNewTaskTitle('');
        } catch (err) {
            setError(err.message || 'Error creating task');
        }
    }

    async function handleToggleTask(task) {
        try {
            const response = await updateTask(task.id, {
                done: !task.done,
            });

            setTasks((currentTasks) =>
                currentTasks.map((currentTask) =>
                    currentTask.id === task.id ? response.task : currentTask
                )
            );
        } catch (err) {
            setError(err.message || 'Error updating task');
        }
    }

    function handleStartEditing(task) {
        setEditingTaskId(task.id);
        setEditingTitle(task.title);
    }

    async function handleSaveEditing(task) {
        if (!editingTitle.trim()) {
            setEditingTaskId(null);
            setEditingTitle('');
            return;
        }

        if (editingTitle.trim() === task.title) {
            setEditingTaskId(null);
            setEditingTitle('');
            return;
        }

        try {
            const response = await updateTask(task.id, {
                title: editingTitle,
            });

            setTasks((currentTasks) =>
                currentTasks.map((currentTask) =>
                    currentTask.id === task.id ? response.task : currentTask
                )
            );
        } catch (err) {
            setError(err.message || 'Error editing task');
        } finally {
            setEditingTaskId(null);
            setEditingTitle('');
        }
    }

    function handleEditingKeyDown(event, task) {
        if (event.key === 'Enter') {
            handleSaveEditing(task);
        }

        if (event.key === 'Escape') {
            setEditingTaskId(null);
            setEditingTitle('');
        }
    }

    async function handleDeleteTask(taskId) {
        try {
            await deleteTask(taskId);

            setTasks((currentTasks) =>
                currentTasks.filter((task) => task.id !== taskId)
            );
        } catch (err) {
            setError(err.message || 'Error deleting task');
        }
    }

    async function handleEraseAll(done) {
        try {
            await deleteTasksByStatus(done);

            setTasks((currentTasks) =>
                currentTasks.filter((task) => task.done !== done)
            );
        } catch (err) {
            setError(err.message || 'Error deleting tasks');
        }
    }

    async function handleDragEnd(event) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = todoTasks.findIndex((task) => task.id === active.id);
        const newIndex = todoTasks.findIndex((task) => task.id === over.id);

        const reorderedTodoTasks = arrayMove(todoTasks, oldIndex, newIndex);
        const doneTasksCurrent = tasks.filter((task) => task.done);

        const updatedTasks = [...reorderedTodoTasks, ...doneTasksCurrent];

        setTasks(updatedTasks);

        try {
            await reorderTasks(reorderedTodoTasks.map((task) => task.id));
        } catch (err) {
            setError(err.message || 'Error reordering tasks');
            loadTasks();
        }
    }

    function renderTask(task, isSortable = false) {
        const isEditing = editingTaskId === task.id;

        const content = (
            <>
                <button
                    type="button"
                    className={task.done ? 'task-check task-check-done' : 'task-check'}
                    onClick={() => handleToggleTask(task)}
                    aria-label={task.done ? 'Mark as pending' : 'Mark as done'}
                >
                    {task.done ? '✓' : ''}
                </button>

                {isEditing ? (
                    <input
                        className="task-edit-input"
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        onBlur={() => handleSaveEditing(task)}
                        onKeyDown={(event) => handleEditingKeyDown(event, task)}
                        autoFocus
                    />
                ) : (
                    <button
                        type="button"
                        className={task.done ? 'task-title task-title-done' : 'task-title'}
                        onClick={() => handleStartEditing(task)}
                    >
                        {task.title}
                    </button>
                )}

                <button
                    type="button"
                    className="task-delete"
                    onClick={() => handleDeleteTask(task.id)}
                >
                    delete
                </button>
            </>
        );

        if (isSortable) {
            return (
                <SortableTaskItem key={task.id} task={task}>
                    {content}
                </SortableTaskItem>
            );
        }

        return (
            <li className="task-item" key={task.id}>
                <span aria-hidden="true"></span>
                {content}
            </li>
        );
    }

    return (
        <main className="todo-page">
            <header className="todo-header">
                <strong className="todo-logo">coopers</strong>

                <div className="todo-user-area">
                    <span>{user?.name}</span>

                    <button type="button" onClick={handleLogout}>
                        sair
                    </button>
                </div>
            </header>

            <section className="todo-hero">
                <h1>To-do List</h1>
                <p>Organize your priorities and mark what is done.</p>
            </section>

            <section className="todo-board" aria-label="Task board">
                <article className="task-card task-card-todo">
                    <div className="task-card-bar task-card-bar-orange"></div>

                    <h2>To-do</h2>
                    <p>Take a breath. Start doing.</p>

                    <form className="task-form" onSubmit={handleCreateTask}>
                        <input
                            value={newTaskTitle}
                            onChange={(event) => setNewTaskTitle(event.target.value)}
                            placeholder="Add new task..."
                            aria-label="New task title"
                        />

                        <button type="submit">add</button>
                    </form>

                    {isLoading ? (
                        <p className="task-feedback">Loading tasks...</p>
                    ) : todoTasks.length > 0 ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={todoTasks.map((task) => task.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <ul className="task-list">
                                    {todoTasks.map((task) => renderTask(task, true))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <ul className="task-list">
                            <li className="task-empty">No pending tasks.</li>
                        </ul>
                    )}

                    <button
                        type="button"
                        className="erase-button"
                        onClick={() => handleEraseAll(false)}
                        disabled={todoTasks.length === 0}
                    >
                        erase all
                    </button>
                </article>

                <article className="task-card task-card-done">
                    <div className="task-card-bar task-card-bar-green"></div>

                    <h2>Done</h2>
                    <p>
                        Congratulations! <strong>You have done {doneTasks.length} tasks</strong>
                    </p>

                    <ul className="task-list">
                        {doneTasks.length > 0 ? (
                            doneTasks.map((task) => renderTask(task, false))
                        ) : (
                            <li className="task-empty">No completed tasks yet.</li>
                        )}
                    </ul>

                    <button
                        type="button"
                        className="erase-button"
                        onClick={() => handleEraseAll(true)}
                        disabled={doneTasks.length === 0}
                    >
                        erase all
                    </button>
                </article>
            </section>

            {error && <p className="todo-error">{error}</p>}
        </main>
    );
}