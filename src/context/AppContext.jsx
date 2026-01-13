import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockService } from '../services/MockService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);
    const [truckNumber, setTruckNumber] = useState(localStorage.getItem('truckNumber') || null);
    const [notifications, setNotifications] = useState([]);

    // Load user from local storage if exists (simple persistence)
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const user = await mockService.login(username, password);
            setUser(user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(user));
            return true;
        } catch (e) {
            return false;
        }
    };

    const logout = async () => {
        await mockService.logout();
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('truckNumber');
        setTruckNumber(null);
    };

    const setDailyTruckNumber = async (number) => {
        await mockService.submitTruckNumber(number);
        setTruckNumber(number);
        localStorage.setItem('truckNumber', number);
    };

    const toggleOffline = () => {
        setIsOffline(prev => {
            const newState = !prev;
            console.log('Offline mode:', newState);
            mockService.setOffline(newState);
            return newState;
        });
    }

    return (
        <AppContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            isOffline,
            toggleOffline,
            currentJob,
            setCurrentJob,
            truckNumber,
            setDailyTruckNumber,
            notifications
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
