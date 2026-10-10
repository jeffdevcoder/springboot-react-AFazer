import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { api } from '../api'
import TaskModal from '../components/TaskModal'
import '../styles/auth.css'
import '../styles/tasks.css'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

const LABELS = {
    ONCE: 'Uma vez',
    DAILY: 'Diária',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
    YEARLY: 'Anual',
}

export default function Today() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [tasks, setTasks] = useState([])
    const [modal, setModal] = useState({ open: false, task: null })
    const [error, setError] = useState('')

    const closeModal = useCallback(() => setModal(m => ({ ...m, open: false })), [])

    useEffect(() => {
        api('/tasks/today').then(setTasks).catch(err => setError(err.message))
    }, [])

    async function toggle(task) {
        const done = !task.done
        const mark = value =>
            setTasks(list => list.map(t => (t.id === task.id ? { ...t, done: value } : t)))

        mark(done)
        try {
            await api(`/tasks/${task.id}/complete`, { method: done ? 'POST' : 'DELETE' })
            if (done && task.recurrence === 'ONCE') {
                setTimeout(() => setTasks(list => list.filter(t => t.id !== task.id)), 600)
            }
        } catch (err) {
            mark(!done)
            setError(err.message)
        }
    }

    function handleSaved(saved) {
        setTasks(list =>
            list.some(t => t.id === saved.id)
                ? list.map(t => (t.id === saved.id ? saved : t))
                : [...list, saved]
        )
    }

    function handleDeleted(id) {
        setTasks(list => list.filter(t => t.id !== id))
    }

    async function handleLogout() {
        await logout()
        navigate('/login')
    }

    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <a href="/today" className="brand">
                    <Logo />
                    <span>A fazer.</span>
                </a>

                <div className="user-area">
                    <span className="user-email">{user?.name}</span>
                    <ThemeToggle />
                    <button className="logout-button" type="button" onClick={handleLogout}>
                        Sair ↗
                    </button>
                </div>
            </header>

            <section className="dashboard-content">
                <div className="dashboard-heading">
                    <p className="dashboard-date">Seu espaço pessoal</p>

                    <h1 className="dashboard-title">
                        Checklist de hoje.
                    </h1>

                    <p className="dashboard-subtitle">
                        Um passo de cada vez. Organize o que importa
                        e mantenha o foco no seu dia.
                    </p>
                </div>

                <section className="dashboard-panel">
                    <div className="panel-header">
                        <div>
                            <h2 className="panel-title">
                                Minhas tarefas
                            </h2>

                            <p className="panel-description">
                                Tudo começa com uma pequena ação.
                            </p>
                        </div>

                        <button
                            className="task-add"
                            type="button"
                            onClick={() => setModal({ open: true, task: null })}
                        >
                            + Nova tarefa
                        </button>
                    </div>

                    {error && <p className="task-error">{error}</p>}

                    {tasks.length > 0 ? (
                        <ul className="task-list">
                            {tasks.map(task => (
                                <li key={task.id} className={`task-item ${task.done ? 'is-done' : ''}`}>
                                    <input
                                        className="task-check"
                                        type="checkbox"
                                        checked={task.done}
                                        onChange={() => toggle(task)}
                                        aria-label={`Marcar "${task.title}" como feita`}
                                    />
                                    <button
                                        className="task-body"
                                        type="button"
                                        onClick={() => setModal({ open: true, task })}
                                    >
                                        <span className="task-text">
                                            <span className="task-title">{task.title}</span>
                                            {task.description && (
                                                <small className="task-desc">{task.description}</small>
                                            )}
                                        </span>
                                        <span className="task-tag">{LABELS[task.recurrence]}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon" aria-hidden="true">
                                ✓
                            </div>

                            <h3 className="empty-title">
                                Seu dia começa aqui
                            </h3>

                            <p className="empty-description">
                                Este espaço está pronto para receber suas
                                tarefas e ajudar você a acompanhar o que
                                precisa ser feito.
                            </p>
                        </div>
                    )}
                </section>

                <p className="dashboard-footer">
                    Feito para manter as coisas simples.
                </p>
            </section>

            <TaskModal
                open={modal.open}
                task={modal.task}
                onClose={closeModal}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
            />
        </main>
    )
}