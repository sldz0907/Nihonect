/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { View, Role, User, DEFAULT_AVATAR } from './types/index';
import LoginView from './pages/LoginView';
import SignupView from './pages/SignupView';
import ResetPasswordView from './pages/ResetPasswordView';
import FeedView from './pages/FeedView';
import BuddiesView from './pages/BuddiesView';
import MessagesView from './pages/MessagesView';
import EventsView from './pages/EventsView';
import ProfileSettingsView from './pages/ProfileSettingsView';
import AdminDashboardView from './pages/AdminDashboardView';
import ReportQueueView from './pages/ReportQueueView';
import BuddyProfileView from './pages/BuddyProfileView';
import ReviewView from './pages/ReviewView';
import AdminLayout from './pages/AdminLayout';
import NotificationsView from './pages/NotificationsView';
import { loginWithEmail, registerWithEmail } from './services/authApi';

type StoredAuth = { token: string; user: User };

function readStoredAuth(): StoredAuth | null {
  try {
    const token = localStorage.getItem('authToken');
    const rawUser = localStorage.getItem('authUser');
    if (!token || !rawUser) return null;
    return { token, user: JSON.parse(rawUser) as User };
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isTranslateOn, setIsTranslateOn] = useState(() => localStorage.getItem('isTranslateOn') === 'true');

  const toggleTranslate = () => {
    setIsTranslateOn(prev => {
      const next = !prev;
      localStorage.setItem('isTranslateOn', String(next));
      return next;
    });
  };

  useEffect(() => {
    const stored = readStoredAuth();
    if (stored?.user) {
      setUser(stored.user);
    }
  }, []);

  const authValue = useMemo(() => ({ user, setUser }), [user]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage auth={authValue} isTranslateOn={isTranslateOn} onToggleTranslate={toggleTranslate} />} />
      <Route path="/signup" element={<SignupPage isTranslateOn={isTranslateOn} onToggleTranslate={toggleTranslate} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage isTranslateOn={isTranslateOn} onToggleTranslate={toggleTranslate} />} />

      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            {user?.role === 'ADMIN' ? (
              <Navigate to="/admin" replace />
            ) : (
              <AppShell
                user={user!}
                onLogout={() => setUser(null)}
                onUpdateUser={setUser}
                isTranslateOn={isTranslateOn}
                onToggleTranslate={toggleTranslate}
              />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute user={user}>
            <AdminLayout user={user!} onLogout={() => setUser(null)} />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/') : '/login'} replace />} />
    </Routes>
  );
}

function ProtectedRoute({ user, children }: { user: User | null; children: ReactNode }) {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ user, children }: { user: User | null; children: ReactNode }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LoginPage({
  auth,
  isTranslateOn,
  onToggleTranslate
}: {
  auth: { user: User | null; setUser: (u: User | null) => void };
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage =
    (location.state as { successMessage?: string } | null)?.successMessage ?? null;

  useEffect(() => {
    if (auth.user) {
      if (auth.user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [auth.user, navigate]);

  const handleLogin = async (input: { email: string; password: string; role: Role }) => {
    const response = await loginWithEmail({ email: input.email, password: input.password });
    const role: Role = response.user.role === 'admin' ? 'ADMIN' : 'USER';
    const authenticatedUser: User = {
      id: response.user.id,
      name: response.user.fullName,
      email: response.user.email,
      role,
      profilePicture: response.user.profilePicture,
      avatar: response.user.profilePicture || DEFAULT_AVATAR,
      bio: response.user.bio,
      livingArea: response.user.livingArea,
      japaneseLevel: response.user.japaneseLevel,
      vietnameseLevel: response.user.vietnameseLevel,
      interests: response.user.interests,
      location: response.user.location,
      nationality: response.user.nationality,
      job: response.user.job,
      age: response.user.age,
    };
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('authUser', JSON.stringify(authenticatedUser));
    auth.setUser(authenticatedUser);
    
    if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <LoginView
            onLogin={handleLogin}
            onSignup={() => navigate('/signup')}
            onForgotPassword={() => navigate('/forgot-password')}
            successMessage={successMessage}
            isTranslateOn={isTranslateOn}
            onToggleTranslate={onToggleTranslate}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SignupPage({
  isTranslateOn,
  onToggleTranslate
}: {
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}) {
  const navigate = useNavigate();

  const handleSignup = async (input: { fullName: string; email: string; password: string }) => {
    await registerWithEmail(input);
    navigate('/login', {
      replace: true,
      state: { successMessage: '登録に成功しました。ログインしてください。' },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key="signup"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <SignupView
            onBack={() => navigate('/login')}
            onSignup={handleSignup}
            isTranslateOn={isTranslateOn}
            onToggleTranslate={onToggleTranslate}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ForgotPasswordPage({
  isTranslateOn,
  onToggleTranslate
}: {
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key="forgot-password"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <ResetPasswordView
            onBack={() => navigate('/login')}
            isTranslateOn={isTranslateOn}
            onToggleTranslate={onToggleTranslate}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AppShell({ 
  user, 
  initialView = View.FEED,
  onLogout,
  onUpdateUser,
  isTranslateOn,
  onToggleTranslate
}: { 
  user: User; 
  initialView?: View;
  onLogout?: () => void;
  onUpdateUser?: (user: User) => void;
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}) {
  const [currentView, setCurrentView] = useState<View>(initialView);
  const [selectedBuddyId, setSelectedBuddyId] = useState<string | null>(null);

  const navigateToBuddy = (id: string) => {
    setSelectedBuddyId(id);
    setCurrentView(View.BUDDY_PROFILE);
  };

  const navigateToChat = (id: string) => {
    setSelectedBuddyId(id);
    setCurrentView(View.MESSAGES);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {currentView === View.FEED && (
            <FeedView user={user} onNavigate={setCurrentView} onSelectBuddy={navigateToBuddy} onLogout={onLogout} isTranslateOn={isTranslateOn} onToggleTranslate={onToggleTranslate} />
          )}
          {currentView === View.BUDDIES && (
            <BuddiesView user={user} onNavigate={setCurrentView} onSelectBuddy={navigateToBuddy} onStartChat={navigateToChat} onLogout={onLogout} isTranslateOn={isTranslateOn} onToggleTranslate={onToggleTranslate} />
          )}
          {currentView === View.MESSAGES && <MessagesView user={user} onNavigate={setCurrentView} onLogout={onLogout} initialChatId={selectedBuddyId} isTranslateOnProp={isTranslateOn} onToggleTranslateProp={onToggleTranslate} />}
          {currentView === View.EVENTS && <EventsView user={user} onNavigate={setCurrentView} onLogout={onLogout} isTranslateOn={isTranslateOn} onToggleTranslate={onToggleTranslate} />}
          {currentView === View.NOTIFICATIONS && <NotificationsView />}
          {currentView === View.PROFILE_SETTINGS && (
            <ProfileSettingsView user={user} onNavigate={setCurrentView} onLogout={onLogout} onUpdateUser={onUpdateUser} isTranslateOn={isTranslateOn} onToggleTranslate={onToggleTranslate} />
          )}
          {currentView === View.BUDDY_PROFILE && selectedBuddyId && (
            <BuddyProfileView
              buddyId={selectedBuddyId}
              onBack={() => setCurrentView(View.FEED)}
              onNavigate={setCurrentView}
              onLogout={onLogout}
              isTranslateOn={isTranslateOn}
              onToggleTranslate={onToggleTranslate}
            />
          )}
          {currentView === View.REVIEW && (
            <ReviewView
              buddyId={selectedBuddyId!}
              onSuccess={() => setCurrentView(View.BUDDY_PROFILE)}
              onBack={() => setCurrentView(View.BUDDY_PROFILE)}
              isTranslateOn={isTranslateOn}
              onToggleTranslate={onToggleTranslate}
            />
          )}
          {currentView === View.ADMIN_DASHBOARD && (
            <AdminDashboardView user={user} onNavigate={setCurrentView} onLogout={onLogout} />
          )}
          {currentView === View.REPORT_QUEUE && (
            <ReportQueueView user={user} onNavigate={setCurrentView} onLogout={onLogout} />
          )}
        </div>
      </div>
    </div>
  );
}
