import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import '../styles/auth.css'
import ThemeToggle from "../components/ThemeToggle.jsx";
import Logo from "../components/Logo.jsx";

export default function Register() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const update = field => e => {
        setForm(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await api('/auth/register', {
                method: 'POST',
                body: form
            })

            navigate('/login')
        } catch (err) {
            setError(
                err.message || 'Não foi possível criar sua conta. Tente novamente.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <ThemeToggle className="is-floating" />

            <Link to="/login" className="brand" aria-label="a fazer - início">
                <Logo />
                <span>A fazer.</span>
            </Link>

            <section className="auth-card">
                <p className="auth-eyebrow">Comece por aqui</p>

                <h1 className="auth-title">Crie sua conta.</h1>

                <p className="auth-description">
                    Um espaço simples para organizar suas tarefas e
                    acompanhar seu progresso.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label className="form-label" htmlFor="name">
                            Nome de usuário
                        </label>

                        <input
                            className="form-input"
                            id="name"
                            type="text"
                            placeholder="Como podemos te chamar?"
                            autoComplete="name"
                            value={form.name}
                            onChange={update('name')}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label className="form-label" htmlFor="email">
                            E-mail
                        </label>

                        <input
                            className="form-input"
                            id="email"
                            type="email"
                            placeholder="voce@exemplo.com"
                            autoComplete="email"
                            value={form.email}
                            onChange={update('email')}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label className="form-label" htmlFor="password">
                            Senha
                        </label>

                        <input
                            className="form-input"
                            id="password"
                            type="password"
                            placeholder="Mínimo de 6 caracteres"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={update('password')}
                            minLength={6}
                            required
                        />
                    </div>

                    {error && (
                        <p className="auth-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="primary-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Criando conta...' : 'Criar minha conta'}
                        {!loading && <span aria-hidden="true">→</span>}
                    </button>
                </form>

                <p className="auth-footer">
                    Já tem uma conta?{' '}
                    <Link className="auth-link" to="/login">
                        Entrar
                    </Link>
                </p>
            </section>

            <p className="auth-legal">
                Comece com o essencial. Evolua no seu ritmo.
            </p>
        </main>
    )
}