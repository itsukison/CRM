import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '@/config/constants';
import { IconChevronRight } from './Icons';

export const OrganizationSwitcher: React.FC = () => {
    const { organizations, currentOrganization, setCurrentOrganization } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!currentOrganization || organizations.length === 0) {
        return null;
    }

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: COLORS.WHITE,
                    border: `1px solid ${COLORS.GRAY_15}`,
                    color: COLORS.GRAY_100,
                    fontSize: '0.875rem',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.BLUE;
                    e.currentTarget.style.background = COLORS.GRAY_10;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.GRAY_15;
                    e.currentTarget.style.background = COLORS.WHITE;
                }}
            >
                <span>{currentOrganization.name}</span>
                <div style={{
                    width: '14px',
                    height: '14px',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <IconChevronRight />
                </div>
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        minWidth: '200px',
                        background: COLORS.WHITE,
                        border: `1px solid ${COLORS.GRAY_15}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                    }}
                >
                    {organizations.map((org) => (
                        <button
                            key={org.id}
                            onClick={() => {
                                setCurrentOrganization(org);
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: org.id === currentOrganization.id ? COLORS.GRAY_10 : COLORS.WHITE,
                                border: 'none',
                                borderBottom: `1px solid ${COLORS.GRAY_15}`,
                                color: COLORS.GRAY_100,
                                fontSize: '0.875rem',
                                fontFamily: 'Inter, sans-serif',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = COLORS.GRAY_10;
                            }}
                            onMouseLeave={(e) => {
                                if (org.id !== currentOrganization.id) {
                                    e.currentTarget.style.background = COLORS.WHITE;
                                }
                            }}
                        >
                            <div style={{ fontWeight: '600' }}>{org.name}</div>
                            {org.description && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: COLORS.GRAY_50,
                                    marginTop: '0.25rem',
                                }}>
                                    {org.description}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
