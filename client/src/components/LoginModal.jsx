import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginModal.css';

export function LoginModal({ isOpen, onClose, onSuccess }) {
    const { login, register } = useAuth();

    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoginMode = mode === 'login';

    useEffect(() => {
        function handleEsc(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setIsSubmitting(true);

        try {
            if (isLoginMode) {
                await login({
                    email: formData.email,
                    password: formData.password,
                });
            } else {
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Authentication error');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="auth-modal-overlay">
            <div
                className="auth-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
            >
                <button
                    className="auth-modal-close"
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    close
                </button>

                <div className="auth-modal-illustration" aria-hidden="true">
                    <div className="auth-figure"></div>
                </div>

                <div className="auth-modal-content">
                    <h2 id="auth-modal-title">
                        {isLoginMode ? 'Sign in' : 'Sign up'}
                    </h2>

                    <p className="auth-modal-subtitle">
                        {isLoginMode ? 'to access your list' : 'to create your account'}
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {!isLoginMode && (
                            <div className="form-field">
                                <label htmlFor="auth-name">Name:</label>
                                <input
                                    id="auth-name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={!isLoginMode}
                                />
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor="auth-email">User:</label>
                            <input
                                id="auth-email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="auth-password">Password:</label>
                            <input
                                id="auth-password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>

                        {error && <p className="auth-error">{error}</p>}

                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Please wait...'
                                : isLoginMode
                                    ? 'Sign in'
                                    : 'Create account'}
                        </button>
                    </form>

                    <button
                        className="auth-switch"
                        type="button"
                        onClick={() => {
                            setError('');
                            setMode(isLoginMode ? 'register' : 'login');
                        }}
                    >
                        {isLoginMode
                            ? "Don't have an account? Create one"
                            : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
}