import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { 
  getUsers, 
  saveUser, 
  getCurrentUser, 
  setCurrentUser,
  initializeMockData 
} from '../utils/localStorage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeMockData();
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      setCurrentUser(foundUser);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
      return false; // User already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUser(users);
    setUser(newUser);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUser(users);
      setUser(updatedUser);
      setCurrentUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};