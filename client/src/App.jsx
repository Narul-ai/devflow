import React, { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

// Настройка базового URL для Axios (Переключено на живой бэкенд в Render)
axios.defaults.baseURL = 'https://devflow-backend-l85l.onrender.com/api/v1';

// ДИНАМИЧЕСКИЙ ИМПОРТ (Lazy Loading) компонентов
const Navbar = lazy(() => import('./components/Navbar'));
const Feed = lazy(() => import('./components/Feed'));
const Profile = lazy(() => import('./components/Profile'));
const Auth = lazy(() => import('./components/Auth'));

// Создаем глобальный контекст авторизации
const AuthContext = createContext(null);

// Премиальный лоадер с эффектом расходящегося неонового импульса
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 relative overflow-hidden">
    <div className="relative w-20 h-20 flex items-center justify-center">
      {/* Пульсирующие внешние кольца */}
      <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-ping duration-1000"></div>
      <div className="absolute inset-2 border border-cyan-500/20 rounded-full animate-pulse duration-750"></div>
      {/* Главный спиннер */}
      <div className="absolute inset-0 border-2 border-slate-800 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-t-blue-500 border-r-cyan-400 rounded-full animate-spin"></div>
      {/* Внутреннее ядро */}
      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-lg shadow-blue-500/50 animate-bounce"></div>
    </div>
    <div className="flex flex-col items-center space-y-1">
      <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">
        Синхронизация блоков
      </p>
      <span className="text-[10px] text-slate-500 font-mono tracking-wider">DEVFLOW_CORE_INITIALIZING...</span>
    </div>
  </div>
);

// ГЛОБАЛЬНЫЙ ПРОВАЙДЕР АВТОРИЗАЦИИ + БИЗНЕС-ЛОГИКА СЕТИ
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // ФИЧА: Обновление данных юзера (включая аватарку)
  const refreshUser = React.useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        const userData = response.data.data?.user || response.data.user;
        setUser(userData);
      }
    } catch (err) {
      console.error('Ошибка обновления профиля:', err.message);
    }
  }, [token]);

  // ФИЧА: Подписка/отписка (Интегрирована в контекст)
  const handleFollow = React.useCallback(async (authorId) => {
    if (!token) return;
    try {
      const response = await axios.patch(`/users/follow/${authorId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setUser(prevUser => {
          if (!prevUser) return null;
          const hasFollowingField = prevUser.following || [];
          const isAlreadyFollowing = hasFollowingField.includes(authorId);
          
          const updatedFollowing = isAlreadyFollowing
            ? hasFollowingField.filter(id => id.toString() !== authorId.toString())
            : [...hasFollowingField, authorId];

          return { ...prevUser, following: updatedFollowing };
        });
      }
    } catch (error) {
      console.error("Ошибка при обработке подписки:", error);
    }
  }, [token]);

  // МОНИТОРИНГ ИНТЕРНЕТ-СОЕДИНЕНИЯ
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Соединение восстановлено. Сессия синхронизирована!', {
        icon: '⚡️',
        style: { border: '1px solid rgba(34,197,94,0.2)', background: '#022c22', color: '#34d399' }
      });
      refreshUser();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Протокол сети разорван. Переход в автономный режим.', {
        icon: '🚨',
        style: { border: '1px solid rgba(239,68,68,0.2)', background: '#450a0a', color: '#f87171' }
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshUser]);

  // Axios-интерцептор для автовыхода при 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          toast.error('Срок действия сессии истек. Переавторизуйтесь.', { id: 'auth-expired' });
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  // ВЕРИФИКАЦИЯ СЕССИИ ПРИ ЗАГРУЗКЕ
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status === 'success') {
          const userData = response.data.data?.user || response.data.user;
          setUser(userData);
        }
      } catch (err) {
        console.error('Сессия устарела:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, user, loading, isOnline, login, logout, refreshUser, handleFollow }}>
      {children}
    </AuthContext.Provider>
  );
};

// Безопасный хук использования контекста с защитой от возврата null
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || { token: null, user: null, loading: false, isOnline: true, login: () => {}, logout: () => {}, refreshUser: () => {}, handleFollow: () => {} };
};

// РОУТ ГАРДЫ
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <PageLoader />;
  return token ? children : <Navigate to="/auth" replace />;
};

const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <PageLoader />;
  // ИСПРАВЛЕНО: Теперь авторизованного пользователя перенаправляет на Главную ленту, а не закольцовывает на /auth
  return !token ? children : <Navigate to="/" replace />;
};

// ВНУТРЕННИЙ КОМПОНЕНТ ДЛЯ КОРРЕКТНОЙ РАБОТЫ ХУКОВ РОУТЕРА
const AppContent = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log(
      '%c🚀 DEVFLOW %c v1.0.4 %c\nДобро пожаловать в панель управления разработчика. Среда выполнения готова к деплою.',
      'background: #2563eb; color: #fff; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
      'background: #0f172a; color: #38bdf8; font-size: 14px; padding: 4px 8px; border-radius: 0 4px 4px 0; border: 1px solid #1e293b;',
      'color: #94a3b8; font-size: 12px; font-style: italic; line-height: 2;'
    );

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input]');
        if (searchInput) searchInput.focus();
      }
      
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        navigate('/profile');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-w-0 min-h-screen bg-[#020617] text-slate-200 antialiased selection:bg-blue-500/30 selection:text-blue-200 relative">
      
      {/* ================= INJECTED CUSTOM PREMIUM CSS ANIMATIONS ================= */}
      <style>{`
        @keyframes drift-slow {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -60px) scale(1.15); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift-reverse {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-50px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1.1); }
        }
        .animate-drift-1 { animation: drift-slow 20s infinite ease-in-out; }
        .animate-drift-2 { animation: drift-reverse 25s infinite ease-in-out; }
      `}</style>

      {/* Фоновые слои */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.12]"></div>
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/10 to-indigo-500/5 rounded-full blur-[140px] animate-drift-1"></div>
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 rounded-full blur-[120px] animate-drift-2"></div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-slate-950/80 backdrop-blur-xl text-slate-100 border border-white/10 rounded-2xl shadow-2xl',
          duration: 4000,
          style: {
            background: 'rgba(10, 15, 30, 0.85)',
            color: '#f1f5f9',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)',
            padding: '12px 20px',
            borderRadius: '16px'
          }
        }}
      />

      <Suspense fallback={<div className="h-16 w-full bg-[#020617]/50 backdrop-blur-md border-b border-white/5"></div>}>
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </Suspense>

      {/* Контентная область */}
      <main className="max-w-5xl mx-auto px-6 py-10 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Feed searchQuery={searchQuery} />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

// ОСНОВНОЙ КОРНЕВОЙ КОМПОНЕНТ APP
const App = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AuthProvider>
      <Router>
        <AppContent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </Router>
    </AuthProvider>
  );
};

export default App;