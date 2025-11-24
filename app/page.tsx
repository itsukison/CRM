'use client';

import { useRouter } from 'next/navigation';
import { LandingPage } from '@/src/features/landing/LandingPage';

export default function HomePage() {
    const router = useRouter();

    const handleEnter = () => {
        router.push('/dashboard');
    };

    return <LandingPage onEnter={handleEnter} />;
}
