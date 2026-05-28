import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../api/index'; // Стало (проверь путь до папки api относительно Auth.jsx)
import toast from 'react-hot-toast';

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
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

    // 1. Клиентская валидация перед отправкой (под модель Mongoose)
    if (!isLogin) {
      if (formData.username.trim().length < 3) {
        toast.error('Никнейм должен быть не короче 3 символов');
        setLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        toast.error('Пароль должен содержать минимум 8 символов');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.passwordConfirm) {
        toast.error('Введенные пароли не совпадают');
        setLoading(false);
        return;
      }
    }

    const endpoint = isLogin ? '/auth/login' : '/auth/signup'; 
    
    try {
      // Работаем через глобальный axios, настроенный в App.jsx
      // Стало:
const res = await api.post(endpoint, formData);
      
      if (res.data.status === 'success') {
        // Записываем сессию в наш глобальный контекст
        login(res.data.token, res.data.data.user);
        
        toast.success(isLogin ? `С возвращением, ${res.data.data.user.username}!` : 'Аккаунт успешно создан!');
        navigate('/');
      }
    } catch (err) {
      console.error("ОШИБКА АВТОРИЗАЦИИ:", err.response?.data);
      // Вытаскиваем точную ошибку валидации от Mongoose
      const errorMessage = err.response?.data?.message || "Ошибка доступа. Проверьте данные.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-[#0f172a] border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
      
      {/* Декоративный неоновый градиент на фоне как у топовых лендингов */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <h2 className="text-3xl font-black mb-2 text-center text-white tracking-tight">
        {isLogin ? 'Вход в систему' : 'Регистрация'}
      </h2>
      <p className="text-slate-400 text-sm text-center mb-8">
        {isLogin ? 'Рады видеть тебя снова в DevFlow' : 'Присоединяйся к комьюнити разработчиков'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        
        {/* Поле Никнейма (только при регистрации) */}
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">Никнейм</label>
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">Email адрес</label>
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">Пароль</label>
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">Подтверждение пароля</label>
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
            isLogin ? 'Авторизоваться' : 'Создать аккаунт'
          )}
        </button>
      </form>

      {/* Переключатель режимов */}
      <button 
        onClick={() => !loading && setIsLogin(!isLogin)} 
        disabled={loading}
        className="w-full mt-6 text-sm text-slate-400 hover:text-white transition-colors text-center block disabled:opacity-50"
      >
        {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
      </button>
    </div>
  );
};

export default Auth;