/* src/context/AuthContext.jsx */
import React, { createContext, useState, useEffect } from 'react';

export const DEMO_USERS = [
  {
    id: 2,
    email: 'nurse@factwise.io',
    password: 'password123',
    role: 'nurse',
    name: 'Nurse Joy',
    title: 'Ward Nurse',
    description: 'Record daily patient temperatures & monitor fever status',
  },
  {
    id: 3,
    email: 'doctor@factwise.io',
    password: 'password123',
    role: 'doctor',
    name: 'Dr. House',
    title: 'Attending Physician',
    description: 'Review temperatures, log daily rounds & recommend discharges',
  },
  {
    id: 1,
    email: 'admin@factwise.io',
    password: 'password123',
    role: 'admin',
    name: 'Sarah Jenkins',
    title: 'Facility Administrator',
    description: 'Manage 74-bed admissions, process discharges & track mortality KPIs',
  },
];

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('factwise_auth_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('factwise_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('factwise_auth_user');
    }
  }, [user]);

  const login = (email, password) => {
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (found) {
      const userData = { id: found.id, email: found.email, role: found.role, name: found.name, title: found.title };
      setUser(userData);
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password. Use one of the demo role buttons below.' };
  };

  const quickLogin = (role) => {
    const found = DEMO_USERS.find((u) => u.role === role);
    if (found) {
      const userData = { id: found.id, email: found.email, role: found.role, name: found.name, title: found.title };
      setUser(userData);
      return { success: true };
    }
    return { success: false };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, quickLogin, logout, demoUsers: DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
};
