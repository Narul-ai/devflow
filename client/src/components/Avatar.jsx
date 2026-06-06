import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { getAvatarFallback } from '../utils/avatarHelper';

/**
 * Универсальный прокачанный компонент Аватарки для DevFlow
 * @param {string} username - Имя пользователя для генерации уникального градиента и буквы
 * @param {string} avatarUrl - Ссылка на изображение (если есть)
 * @param {string} size - Размер аватара: 'sm' (комменты), 'md' (шапка/посты), 'lg' (профиль)
 * @param {string} className - Дополнительные кастомные Tailwind-классы
 */
const Avatar = ({ username, avatarUrl, size = 'md', className = '' }) => {
  // Состояние для отслеживания битых ссылок
  const [imgError, setImgError] = useState(false);

  // Если ссылка на аватарку изменится (например, при редактировании профиля), сбрасываем ошибку
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  // Конфигурация размеров кружка
  const sizeClasses = {
    sm: 'w-5 h-5 text-[9px] border border-white/10',
    md: 'w-10 h-10 text-xs border border-white/10 shadow-lg shadow-blue-500/10',
    lg: 'w-24 h-24 text-2xl border-2 border-white/15 shadow-xl shadow-indigo-500/10'
  };

  // Размеры дефолтной иконки Lucide
  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 32
  };

  const firstLetter = username ? username.charAt(0).toUpperCase() : null;
  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // 1. ЕСЛИ КАРТИНКА ЕСТЬ И ОНА НЕ СЛОМАЛАСЬ
  if (avatarUrl && !imgError) {
    return (
      <div className={`rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-slate-900 ${currentSizeClass} ${className}`}>
        <img 
          src={avatarUrl} 
          alt={username || "Avatar"} 
          className="w-full h-full object-cover"
          onError={() => setImgError(true)} // Если ссылка битая, триггерим фоллбек
        />
      </div>
    );
  }

  // 2. ЕСЛИ КАРТИНКИ НЕТ ИЛИ ОНА УПАЛА С ОШИБКОЙ — СТРОИМ ДИНАМИЧЕСКИЙ ГРАДИЕНТ
  return (
    <div 
      className={`
        rounded-full 
        flex items-center justify-center 
        font-black text-white uppercase 
        select-none flex-shrink-0
        ${currentSizeClass} 
        ${className}
      `}
    >
      {/* Вызываем твой хелпер динамических градиентов. 
        Передаем null вместо ссылки, чтобы он сгенерировал уникальный фоновый цвет по юзернейму
      */}
      {getAvatarFallback(username || "User", null)}
    </div>
  );
};

export default Avatar;