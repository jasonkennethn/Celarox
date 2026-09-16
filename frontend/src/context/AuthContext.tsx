import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/endpoints';
import { User, Workspace } from '../types';

interface AuthContextType {
  user: User | null;
  activeWorkspace: Workspace | null;
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; company_name?: string }) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from AsyncStorage on boot
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@celarox_user');
        const accessToken = await AsyncStorage.getItem('@celarox_access_token');
        const storedWorkspace = await AsyncStorage.getItem('@celarox_active_workspace');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          if (storedWorkspace) {
            setActiveWorkspaceState(JSON.parse(storedWorkspace));
          }
          // Fetch fresh user profile & workspaces in background
          try {
            const [profileRes, wsRes] = await Promise.all([
              api.auth.getProfile(),
              api.workspaces.list(),
            ]);
            setUser(profileRes.data);
            setWorkspaces(wsRes.data);
            await AsyncStorage.setItem('@celarox_user', JSON.stringify(profileRes.data));

            if (wsRes.data.length > 0) {
              const currentWs = storedWorkspace
                ? wsRes.data.find((w) => w.id === JSON.parse(storedWorkspace).id) || wsRes.data[0]
                : wsRes.data[0];
              setActiveWorkspaceState(currentWs);
              await AsyncStorage.setItem('@celarox_active_workspace', JSON.stringify(currentWs));
              await AsyncStorage.setItem('@celarox_active_workspace_id', currentWs.id);
            }
          } catch (e) {
            console.warn('Silent refresh error:', e);
          }
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.auth.login(credentials);
    const { user: authedUser, tokens } = res.data;

    await AsyncStorage.setItem('@celarox_access_token', tokens.access);
    await AsyncStorage.setItem('@celarox_refresh_token', tokens.refresh);
    await AsyncStorage.setItem('@celarox_user', JSON.stringify(authedUser));
    setUser(authedUser);

    // Fetch user workspaces
    const wsRes = await api.workspaces.list();
    setWorkspaces(wsRes.data);
    if (wsRes.data.length > 0) {
      const defaultWs = wsRes.data[0];
      setActiveWorkspaceState(defaultWs);
      await AsyncStorage.setItem('@celarox_active_workspace', JSON.stringify(defaultWs));
      await AsyncStorage.setItem('@celarox_active_workspace_id', defaultWs.id);
    }
  };

  const register = async (data: { email: string; password: string; first_name: string; last_name: string; company_name?: string }) => {
    const res = await api.auth.register(data);
    const { user: registeredUser, tokens, workspace } = res.data;

    await AsyncStorage.setItem('@celarox_access_token', tokens.access);
    await AsyncStorage.setItem('@celarox_refresh_token', tokens.refresh);
    await AsyncStorage.setItem('@celarox_user', JSON.stringify(registeredUser));
    setUser(registeredUser);

    if (workspace) {
      setWorkspaces([workspace]);
      setActiveWorkspaceState(workspace);
      await AsyncStorage.setItem('@celarox_active_workspace', JSON.stringify(workspace));
      await AsyncStorage.setItem('@celarox_active_workspace_id', workspace.id);
    }
  };

  const googleLogin = async (token: string) => {
    const res = await api.auth.googleLogin(token);
    const { user: authedUser, tokens } = res.data;

    await AsyncStorage.setItem('@celarox_access_token', tokens.access);
    await AsyncStorage.setItem('@celarox_refresh_token', tokens.refresh);
    await AsyncStorage.setItem('@celarox_user', JSON.stringify(authedUser));
    setUser(authedUser);

    const wsRes = await api.workspaces.list();
    setWorkspaces(wsRes.data);
    if (wsRes.data.length > 0) {
      setActiveWorkspaceState(wsRes.data[0]);
      await AsyncStorage.setItem('@celarox_active_workspace', JSON.stringify(wsRes.data[0]));
      await AsyncStorage.setItem('@celarox_active_workspace_id', wsRes.data[0].id);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      '@celarox_access_token',
      '@celarox_refresh_token',
      '@celarox_user',
      '@celarox_active_workspace',
      '@celarox_active_workspace_id',
    ]);
    setUser(null);
    setActiveWorkspaceState(null);
    setWorkspaces([]);
  };

  const setActiveWorkspace = async (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    await AsyncStorage.setItem('@celarox_active_workspace', JSON.stringify(workspace));
    await AsyncStorage.setItem('@celarox_active_workspace_id', workspace.id);
  };

  const refreshUserProfile = async () => {
    const res = await api.auth.getProfile();
    setUser(res.data);
    await AsyncStorage.setItem('@celarox_user', JSON.stringify(res.data));
  };

  const refreshWorkspaces = async () => {
    const res = await api.workspaces.list();
    setWorkspaces(wsRes => res.data);
    if (!activeWorkspace && res.data.length > 0) {
      await setActiveWorkspace(res.data[0]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeWorkspace,
        currentWorkspace: activeWorkspace,
        workspaces,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        logout,
        setActiveWorkspace,
        refreshUserProfile,
        refreshWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
