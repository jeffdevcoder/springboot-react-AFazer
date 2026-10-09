import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import '../styles/auth.css'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(email, password)
            navigate('/today')
        } catch (err) {
            setError(err.message || 'Não foi possível entrar. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <Link to="/login" className="brand" aria-label="a fazer - início">
                <img className="brand-logo" src="/logo.png" alt="" />
                <span>A fazer.</span>
            </Link>

            <section className="auth-card">
                <p className="auth-eyebrow">Bem-vindo de volta</p>

                <h1 className="auth-title">Entre na sua conta.</h1>

                <p className="auth-description">
                    Organize suas pendências e continue de onde parou.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
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
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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
                            placeholder="Digite sua senha"
                            autoComplete="current-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
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
                        {loading ? 'Entrando...' : 'Entrar na conta'}
                        {!loading && <span aria-hidden="true">→</span>}
                    </button>
                </form>

                <p className="auth-footer">
                    Ainda não tem uma conta?{' '}
                    <Link className="auth-link" to="/register">
                        Criar conta
                    </Link>
                </p>
            </section>

            <p className="auth-legal">
                Simplicidade para organizar o seu dia.
            </p>
        </main>
    )
}