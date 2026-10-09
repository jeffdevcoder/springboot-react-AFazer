import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

const OPTIONS = [
    ['ONCE', 'Uma vez'],
    ['DAILY', 'Diária'],
    ['WEEKLY', 'Semanal'],
    ['MONTHLY', 'Mensal'],
    ['YEARLY', 'Anual'],
]

export default function TaskModal({ open, task, onClose, onSaved, onDeleted }) {
    const editing = Boolean(task)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [recurrence, setRecurrence] = useState('ONCE')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [wasOpen, setWasOpen] = useState(false)
    const titleRef = useRef(null)

    // preenche o formulário toda vez que o pop-up abre
    if (open !== wasOpen) {
        setWasOpen(open)
        if (open) {
            setTitle(task?.title ?? '')
            setDescription(task?.description ?? '')
            setRecurrence(task?.recurrence ?? 'ONCE')
            setError('')
            setConfirmDelete(false)
        }
    }

    useEffect(() => {
        if (!open) return
        const timer = setTimeout(() => {
            if (!editing) titleRef.current?.focus()
        }, 80)
        const onKey = e => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('keydown', onKey)
        }
    }, [open, editing, onClose])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            const body = { title, description, recurrence }
            const saved = editing
                ? await api(`/tasks/${task.id}`, { method: 'PUT', body })
                : await api('/tasks', { method: 'POST', body })
            onSaved(saved)
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true)
            return
        }
        try {
            await api(`/tasks/${task.id}`, { method: 'DELETE' })
            onDeleted(task.id)
            onClose()
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className={`task-overlay ${open ? 'is-open' : ''}`} onMouseDown={onClose}>
            <form className="task-modal" onSubmit={handleSubmit} onMouseDown={e => e.stopPropagation()}>
                <h2>{editing ? 'Tarefa' : 'Nova tarefa'}</h2>

                <input
                    ref={titleRef}
                    placeholder="Nome da tarefa"
                    value={title}
                    maxLength={100}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Descrição (opcional)"
                    value={description}
                    maxLength={500}
                    rows={3}
                    onChange={e => setDescription(e.target.value)}
                />

                <div className="task-options" role="radiogroup" aria-label="Repetição">
                    {OPTIONS.map(([value, label]) => (
                        <label key={value}>
                            <input
                                type="radio"
                                name="recurrence"
                                value={value}
                                checked={recurrence === value}
                                onChange={() => setRecurrence(value)}
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>

                {error && <p className="task-error">{error}</p>}

                <div className="task-actions">
                    {editing && (
                        <button type="button" className="task-btn is-danger" onClick={handleDelete}>
                            {confirmDelete ? 'Confirmar exclusão?' : 'Excluir'}
                        </button>
                    )}
                    <button type="button" className="task-btn" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="task-btn is-primary" disabled={saving || !title.trim()}>
                        {editing ? 'Salvar' : 'Adicionar'}
                    </button>
                </div>
            </form>
        </div>
    )
}