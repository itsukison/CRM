'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '../components/LandingPage';

const HomePage: React.FC = () => {
    const router = useRouter();

    const handleEnter = () => {
        router.push('/dashboard');
    };

    return <LandingPage onEnter={handleEnter} />;
};

export default HomePage;
