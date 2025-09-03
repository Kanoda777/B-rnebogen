import React, { createContext, useState, useEffect, useContext } from 'react';
import { Child } from '@/api/entities';

const ProfileContext = createContext(null);

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [activeChild, setActiveChild] = useState(null);
    const [activeChildId, setActiveChildId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Safely get from localStorage without triggering any API calls
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                const storedId = localStorage.getItem('activeChildId');
                // Only set if it's a valid string and not null/undefined
                if (storedId && storedId !== 'null' && storedId !== 'undefined') {
                    setActiveChildId(storedId);
                }
            }
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
        }
    }, []);

    // Only fetch child data when we have a valid ID
    useEffect(() => {
        const fetchChildData = async () => {
            // Triple check we have a valid ID before making any API calls
            if (!activeChildId || activeChildId === 'null' || activeChildId === 'undefined') {
                setActiveChild(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const children = await Child.list();
                const foundChild = children.find(child => child.id === activeChildId);
                
                if (foundChild) {
                    setActiveChild(foundChild);
                } else {
                    // Clear invalid ID
                    clearActiveChild();
                }
            } catch (error) {
                console.error("Failed to fetch active child profile:", error);
                clearActiveChild();
            }
            setIsLoading(false);
        };

        fetchChildData();
    }, [activeChildId]);

    const selectActiveChild = (childId) => {
        // Validate childId before setting
        if (!childId || childId === 'null' || childId === 'undefined') {
            console.warn('Attempted to select invalid child ID:', childId);
            return;
        }

        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('activeChildId', childId);
            }
            setActiveChildId(childId);
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    };

    const clearActiveChild = () => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('activeChildId');
            }
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
        setActiveChildId(null);
        setActiveChild(null);
    };

    const value = {
        activeChild,
        activeChildId,
        selectActiveChild,
        clearActiveChild,
        isLoadingProfile: isLoading,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};