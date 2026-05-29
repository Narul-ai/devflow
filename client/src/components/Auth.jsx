import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../api/index'; 
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next'; // Импорт уже на месте

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // <-- Активируем хук перевода
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    username: '', 
    passwordConfirm: '' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Клиентская валидация перед отправкой
    if (!isLogin) {
      if (formData.username.trim().length < 3) {
        toast.error(t('auth.validation.username')); // Локализовано
        setLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        toast.error(t('auth.validation.passwordLength')); // Локализовано
        setLoading(false);
        return;
      }
      if (formData.password !== formData.passwordConfirm) {
        toast.error(t('auth.validation.passwordMatch')); // Локализовано
        setLoading(false);
        return;
      }
    }

    const endpoint = isLogin ? '/auth/login' : '/auth/signup'; 
    
    try {
      const res = await api.post(endpoint, formData);
      
      if (res.data.status === 'success') {
        login(res.data.token, res.data.data.user);
        
        // Динамическое приветствие с сохранением имени пользователя
        toast.success(
          isLogin 
            ? t('auth.toast.welcome', { username: res.data.data.user.username }) 
            : t('auth.toast.success')
        );
        navigate('/');
      }
    } catch (err) {
      console.error("ОШИБКА АВТОРИЗАЦИИ:", err.response?.data);
      const errorMessage = err.response?.data?.message || t('auth.toast.error');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-[#0f172a] border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
      
      {/* Декоративный неоновый градиент на фоне */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <h2 className="text-3xl font-black mb-2 text-center text-white tracking-tight">
        {isLogin ? t('auth.login.title') : t('auth.register.title')}
      </h2>
      <p className="text-slate-400 text-sm text-center mb-8">
        {isLogin ? t('auth.login.subtitle') : t('auth.register.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        
        {/* Поле Никнейма (только при регистрации) */}
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">
              {t('auth.fields.username')}
            </label>
            <input 
              type="text" 
              name="username"
              placeholder="developer_name" 
              value={formData.username}
              className="w-full bg-[#020617] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-white transition-colors disabled:opacity-50"
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        )}

        {/* Поле Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">
            {t('auth.fields.email')}
          </label>
          <input 
            type="email" 
            name="email"
            placeholder="you@example.com" 
            value={formData.email}
            className="w-full bg-[#020617] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-white transition-colors disabled:opacity-50"
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        {/* Поле Пароля */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">
            {t('auth.fields.password')}
          </label>
          <input 
            type="password" 
            name="password"
            placeholder="••••••••" 
            value={formData.password}
            className="w-full bg-[#020617] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-white transition-colors disabled:opacity-50"
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        {/* Поле Подтверждения Пароля (только при регистрации) */}
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">
              {t('auth.fields.passwordConfirm')}
            </label>
            <input 
              type="password" 
              name="passwordConfirm"
              placeholder="••••••••" 
              value={formData.passwordConfirm}
              className="w-full bg-[#020617] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-white transition-colors disabled:opacity-50"
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        )}

        {/* Кнопка отправки с лоадером */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 py-4 mt-4 rounded-2xl font-bold hover:bg-blue-500 transition-all text-white shadow-lg shadow-blue-600/10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            isLogin ? t('auth.buttons.login') : t('auth.buttons.register')
          )}
        </button>
      </form>

      {/* Переключатель режимов */}
      <button 
        onClick={() => !loading && setIsLogin(!isLogin)} 
        disabled={loading}
        className="w-full mt-6 text-sm text-slate-400 hover:text-white transition-colors text-center block disabled:opacity-50"
      >
        {isLogin ? t('auth.switch.toRegister') : t('auth.switch.toLogin')}
      </button>
    </div>
  );
};

export default Auth;