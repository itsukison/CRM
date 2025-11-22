'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants';
import { AuthNavBar } from './AuthNavBar';

export const SignUpPage: React.FC = () => {
    const router = useRouter();
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        if (password.length < 6) {
            setError('パスワードは6文字以上である必要があります');
            return;
        }

        setLoading(true);

        const { error: signUpError } = await signUp(email, password);

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            // Redirect directly to org-setup (no email verification required)
            router.push('/org-setup');
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
                        BaseCRM
                    </h1>
                    <p style={{
                        fontSize: '0.875rem',
                        color: COLORS.GRAY_50,
                        fontFamily: 'JetBrains Mono, monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}>
                        Sign Up
                    </p>
                </div>

                {/* Sign Up Form */}
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
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
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
                            パスワード（確認）
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
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
                            すでにアカウントをお持ちですか？{' '}
                            <Link
                                href="/signin"
                                style={{
                                    color: COLORS.BLUE,
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                サインイン
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};
