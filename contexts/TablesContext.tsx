'use client';

import React, { createContext, useContext } from 'react';
import { TableData } from '@/types';

interface TablesContextType {
    tables: TableData[];
}

const TablesContext = createContext<TablesContextType | undefined>(undefined);

export const TablesProvider: React.FC<{ tables: TableData[]; children: React.ReactNode }> = ({ tables, children }) => {
    return (
        <TablesContext.Provider value={{ tables }}>
            {children}
        </TablesContext.Provider>
    );
};

export const useTables = () => {
    const context = useContext(TablesContext);
    if (context === undefined) {
        throw new Error('useTables must be used within a TablesProvider');
    }
    return context;
};
