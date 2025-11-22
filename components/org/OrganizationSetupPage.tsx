'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { createOrganization } from '../../services/organizationService';
import { acceptInvitation } from '../../services/invitationService';
import { COLORS } from '../../constants';

type SetupMode = 'create' | 'join';

export const OrganizationSetupPage: React.FC = () => {
    const router = useRouter();
    const { user, loading, refreshOrganizations } = useAuth();
    
    // Redirect to signin if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/signin');
        }
    }, [user, loading, router]);
    const [mode, setMode] = useState<SetupMode>('create');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Create organization state
    const [orgName, setOrgName] = useState('');
    const [orgDescription, setOrgDescription] = useState('');

    // Join organization state
    const [invitationToken, setInvitationToken] = useState('');

    async function handleCreateOrganization(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!orgName.trim()) {
            setError('組織名を入力してください');
            return;
        }

        setSubmitting(true);

        const { organization, error: createError } = await createOrganization(
            orgName,
            orgDescription || undefined
        );

        if (createError) {
            setError(createError.message);
            setSubmitting(false);
        } else if (organization) {
            await refreshOrganizations();
            router.push('/dashboard');
        }
    }

    async function handleJoinOrganization(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!invitationToken.trim()) {
            setError('招待トークンを入力してください');
            return;
        }

        setSubmitting(true);

        const { orgId, error: joinError } = await acceptInvitation(invitationToken);

        if (joinError) {
            setError(joinError.message);
            setSubmitting(false);
        } else if (orgId) {
            await refreshOrganizations();
            router.push('/dashboard');
        }
    }

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: COLORS.GRAY_0,
            }}>
                <div style={{
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 1rem',
                        border: `3px solid ${COLORS.GRAY_15}`,
                        borderTopColor: COLORS.BLUE,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                    <p style={{
                        fontSize: '0.875rem',
                        color: COLORS.GRAY_60,
                    }}>
                        読み込み中...
                    </p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!user) {
        return null;
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: COLORS.GRAY_0,
        }}>
            <div style={{
                width: '100%',
                maxWidth: '500px',
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
                        組織のセットアップ
                    </h1>
                    <p style={{
                        fontSize: '0.875rem',
                        color: COLORS.GRAY_50,
                        fontFamily: 'Inter, sans-serif',
                        marginTop: '0.5rem',
                    }}>
                        新しい組織を作成するか、既存の組織に参加してください
                    </p>
                </div>

                {/* Mode Toggle */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                    border: `1px solid ${COLORS.GRAY_15}`,
                    background: COLORS.WHITE,
                }}>
                    <button
                        onClick={() => setMode('create')}
                        style={{
                            flex: 1,
                            padding: '0.875rem',
                            background: mode === 'create' ? COLORS.BLUE : 'transparent',
                            color: mode === 'create' ? COLORS.WHITE : COLORS.GRAY_60,
                            border: 'none',
                            fontSize: '0.875rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        新規作成
                    </button>
                    <button
                        onClick={() => setMode('join')}
                        style={{
                            flex: 1,
                            padding: '0.875rem',
                            background: mode === 'join' ? COLORS.BLUE : 'transparent',
                            color: mode === 'join' ? COLORS.WHITE : COLORS.GRAY_60,
                            border: 'none',
                            fontSize: '0.875rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        参加する
                    </button>
                </div>

                {/* Form Container */}
                <div style={{
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

                    {mode === 'create' ? (
                        <form onSubmit={handleCreateOrganization}>
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
                                    組織名 *
                                </label>
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    required
                                    placeholder="例: Acme Inc."
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
                                    説明（任意）
                                </label>
                                <textarea
                                    value={orgDescription}
                                    onChange={(e) => setOrgDescription(e.target.value)}
                                    placeholder="組織の説明を入力してください"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: `1px solid ${COLORS.GRAY_15}`,
                                        fontSize: '1rem',
                                        fontFamily: 'Inter, sans-serif',
                                        color: COLORS.GRAY_100,
                                        outline: 'none',
                                        resize: 'vertical',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = COLORS.BLUE}
                                    onBlur={(e) => e.target.style.borderColor = COLORS.GRAY_15}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: submitting ? COLORS.GRAY_30 : COLORS.BLUE,
                                    color: COLORS.WHITE,
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (!submitting) e.currentTarget.style.background = COLORS.CERULEAN;
                                }}
                                onMouseLeave={(e) => {
                                    if (!submitting) e.currentTarget.style.background = COLORS.BLUE;
                                }}
                            >
                                {loading ? '作成中...' : '組織を作成'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinOrganization}>
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
                                    招待トークン
                                </label>
                                <input
                                    type="text"
                                    value={invitationToken}
                                    onChange={(e) => setInvitationToken(e.target.value)}
                                    required
                                    placeholder="招待トークンを入力してください"
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
                                <p style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: COLORS.GRAY_50,
                                    fontFamily: 'Inter, sans-serif',
                                }}>
                                    組織の管理者から送信された招待トークンを入力してください
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: submitting ? COLORS.GRAY_30 : COLORS.BLUE,
                                    color: COLORS.WHITE,
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (!submitting) e.currentTarget.style.background = COLORS.CERULEAN;
                                }}
                                onMouseLeave={(e) => {
                                    if (!submitting) e.currentTarget.style.background = COLORS.BLUE;
                                }}
                            >
                                {loading ? '参加中...' : '組織に参加'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Skip Option - for users who want to go back */}
                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                }}>
                    <button
                        onClick={() => router.push('/signin')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: COLORS.GRAY_50,
                            fontSize: '0.875rem',
                            fontFamily: 'Inter, sans-serif',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                    >
                        サインインに戻る
                    </button>
                </div>
            </div>
        </div>
    );
};

