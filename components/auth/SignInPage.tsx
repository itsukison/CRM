'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants';
import { AuthNavBar } from './AuthNavBar';

export const SignInPage: React.FC = () => {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
            setError(signInError.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    }

    return (
        <>
            <AuthNavBar />
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: COLORS.GRAY_0,
                paddingTop: '4rem',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    padding: '2rem',
                }}>
                {/* Logo/Title */}
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: COLORS.GRAY_100,
                        marginBottom: '0.5rem',
                        fontFamily: 'Inter, sans-serif',
                    }}>
                        Flowly
                    </h1>
                    <p style={{
                        fontSize: '0.875rem',
                        color: COLORS.GRAY_50,
                        fontFamily: 'JetBrains Mono, monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}>
                        Sign In
                    </p>
                </div>

                {/* Sign In Form */}
                <form onSubmit={handleSubmit} style={{
                    border: `1px solid ${COLORS.GRAY_15}`,
                    padding: '2rem',
                    background: COLORS.WHITE,
                }}>
                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1.5rem',
                            border: `2px solid ${COLORS.RED}`,
                            background: `${COLORS.RED}10`,
                            color: COLORS.RED,
                            fontSize: '0.875rem',
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.75rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: COLORS.GRAY_60,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: `1px solid ${COLORS.GRAY_15}`,
                                fontSize: '1rem',
                                fontFamily: 'Inter, sans-serif',
                                color: COLORS.GRAY_100,
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = COLORS.BLUE}
                            onBlur={(e) => e.target.style.borderColor = COLORS.GRAY_15}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.75rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: COLORS.GRAY_60,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: `1px solid ${COLORS.GRAY_15}`,
                                fontSize: '1rem',
                                fontFamily: 'Inter, sans-serif',
                                color: COLORS.GRAY_100,
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = COLORS.BLUE}
                            onBlur={(e) => e.target.style.borderColor = COLORS.GRAY_15}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: loading ? COLORS.GRAY_30 : COLORS.BLUE,
                            color: COLORS.WHITE,
                            border: 'none',
                            fontSize: '0.875rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.currentTarget.style.background = COLORS.CERULEAN;
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.currentTarget.style.background = COLORS.BLUE;
                        }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: `1px solid ${COLORS.GRAY_15}`,
                        textAlign: 'center',
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: COLORS.GRAY_50,
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            アカウントをお持ちでないですか？{' '}
                            <Link
                                href="/signup"
                                style={{
                                    color: COLORS.BLUE,
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                サインアップ
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};
