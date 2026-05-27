import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Home, Zap, Award, Search } from 'lucide-react';
import { useAuth } from '../App';
import toast from 'react-hot-toast';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Вы успешно вышли из системы');
    navigate('/auth');
  };

  return (
    <nav className="border-b border-white/5 bg-[#0f172a]/60 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 w-full box-border">
      {/* Главный контейнер: на мобилках меняем h-16 на flex-col с внутренними отступами */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 min-h-[4rem] flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 py-2.5 md:py-0 box-border w-full">
        
        {/* Верхняя строка для мобилок / Единая строка для десктопа */}
        <div className="flex items-center justify-between w-full md:w-auto shrink-0 gap-3 box-border">
          
          {/* Логотип со спецэффектом при наведении */}
          <Link to="/" className="group text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-1.5 transition-all duration-300 shrink-0">
            <Zap 
              fill="currentColor" 
              size={20} 
              className="text-blue-400 transform group-hover:scale-110 group-hover:rotate-12 group-hover:animate-pulse transition-all duration-300 ease-out shrink-0"
            /> 
            <span className="tracking-tight group-hover:opacity-90 transition-opacity">DevFlow</span>
          </Link>

          {/* Контейнер навигации на мобилках дублируется в верхнюю строку справа */}
          <div className="flex items-center gap-2 sm:gap-4 md:hidden">
            {token ? (
              <>
                {/* Ссылка на Главную */}
                <Link 
                  to="/" 
                  className="hover:text-blue-400 transition-all duration-300 text-slate-400 hover:-translate-y-0.5 active:translate-y-0 p-1 shrink-0" 
                  title="Главная лента"
                >
                  <Home size={20}/>
                </Link>

                {/* Профиль и репутация (Адаптировано под 375px: текст скрыт на мобилках) */}
                <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-900/60 border border-white/5 pl-2 sm:pl-3 pr-2 sm:pr-4 py-1 rounded-full hover:scale-[1.02] hover:border-blue-500/20 transition-all duration-300 backdrop-blur-sm group/profile shrink-0">
                  {user && (
                    <>
                      <div className="flex items-center gap-0.5 text-xs font-bold text-amber-400" title="Репутация в DevFlow">
                        <Award size={13} fill="currentColor" className="shrink-0"/>
                        <span className="text-[11px] sm:text-xs">{user.reputation ?? 0}</span>
                      </div>
                      {/* Скрываем никнейм на экранах меньше 640px, чтобы не взрывать адаптив */}
                      <span className="hidden sm:inline text-sm font-semibold text-slate-300 border-l border-white/10 pl-2 truncate max-w-[90px]">
                        {user.username}
                      </span>
                    </>
                  )}
                  <Link to="/profile" className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 p-0.5 shrink-0" title="В профиль">
                    <User size={15} className="transform group-hover/profile:rotate-6 transition-transform"/>
                  </Link>
                </div>

                {/* Кнопка Выхода */}
                <button 
                  onClick={handleLogout} 
                  className="text-slate-500 hover:text-red-400 hover:rotate-12 hover:scale-105 transition-all duration-300 p-1 shrink-0" 
                  title="Выйти из аккаунта"
                >
                  <LogOut size={20}/>
                </button>
              </>
            ) : (
              <Link to="/auth" className="relative inline-flex items-center justify-center bg-blue-600 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all duration-300 shrink-0">
                Войти
              </Link>
            )}
          </div>
        </div>
        
        {/* УЛЬТРА-СОВРЕМЕННЫЙ ИНТЕРАКТИВНЫЙ ПОИСК */}
        {token && (
          <div className="w-full md:flex-1 md:max-w-sm md:mx-4 relative group animate-in fade-in zoom-in-95 duration-500 box-border">
            {/* Скрытый неоновый бэкграунд-свечение */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            {/* Оболочка инпута */}
            <div className="relative flex items-center bg-slate-950/40 border border-white/5 focus-within:border-blue-500/40 rounded-xl px-3 py-1.5 md:py-1.5 transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(56,189,248,0.12)] focus-within:bg-slate-950/80 box-border w-full">
              <Search size={15} className="text-slate-500 group-hover:text-cyan-400 focus-within:text-blue-400 transition-colors duration-300 shrink-0" />
              <input
                type="text"
                data-search-input 
                placeholder="Поиск публикаций..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none pl-2 pr-14 md:pr-10 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:ring-0 font-medium m-0 h-5"
              />
              {/* Хоткей-виджет (скрывается на мобильных, так как Ctrl+K там не нажать) */}
              <kbd className="hidden md:inline-block absolute right-3 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-slate-900 border border-white/10 rounded-md shadow-sm pointer-events-none group-focus-within:opacity-0 group-focus-within:translate-x-2 transition-all duration-300 ease-out">
                Ctrl K
              </kbd>
            </div>
          </div>
        )}

        {/* Навигация / Контекстное меню для ДЕСКТОПА (скрывается на мобилках) */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          {token ? (
            <>
              {/* Ссылка на Главную */}
              <Link 
                to="/" 
                className="hover:text-blue-400 transition-all duration-300 text-slate-400 hover:-translate-y-0.5 active:translate-y-0" 
                title="Главная лента"
              >
                <Home size={22}/>
              </Link>

              {/* Профиль и репутация */}
              <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 pl-3 pr-4 py-1.5 rounded-full hover:scale-[1.03] hover:border-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.08)] transition-all duration-300 backdrop-blur-sm group/profile">
                {user && (
                  <>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400" title="Репутация в DevFlow">
                      <Award size={14} fill="currentColor"/>
                      <span>{user.reputation ?? 0}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-300 border-l border-white/10 pl-2 group-hover/profile:text-slate-100 transition-colors">
                      {user.username}
                    </span>
                  </>
                )}
                <Link to="/profile" className="text-slate-400 hover:text-cyan-400 transition-colors duration-200" title="В профиль">
                  <User size={18} className="transform group-hover/profile:rotate-6 transition-transform"/>
                </Link>
              </div>

              {/* Кнопка Выхода */}
              <button 
                onClick={handleLogout} 
                className="text-slate-500 hover:text-red-400 hover:rotate-12 hover:scale-105 transition-all duration-300" 
                title="Выйти из аккаунта"
              >
                <LogOut size={22}/>
              </button>
            </>
          ) : (
            <Link to="/auth" className="relative inline-flex items-center justify-center bg-blue-600 px-6 py-2 rounded-full text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300">
              Войти
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;