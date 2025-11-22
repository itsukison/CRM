'use client';

import React from 'react';
import Link from 'next/link';
import { COLORS } from '../../constants';

export const AuthNavBar: React.FC = () => {
    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            padding: '1rem 2rem',
            borderBottom: `1px solid ${COLORS.GRAY_15}`,
            background: COLORS.WHITE,
            zIndex: 1000,
        }}>
            <Link
                href="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
                <div
                    style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: COLORS.BLUE,
                    }}
                />
                <span style={{
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: COLORS.GRAY_100,
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '-0.01em',
                }}>
                    BaseCRM
                </span>
            </Link>
        </nav>
    );
};

