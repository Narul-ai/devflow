import React from 'react';
import { User } from 'lucide-react';

/**
 * Универсальный компонент Аватарки для DevFlow
 * @param {string} username - Имя пользователя для генерации буквы
 * @param {string} avatarUrl - Ссылка на изображение (если есть)
 * @param {string} size - Размер аватара: 'sm' (комменты), 'md' (шапка/посты), 'lg' (профиль)
 * @param {string} className - Дополнительные кастомные Tailwind-классы
 */
const Avatar = ({ username, avatarUrl, size = 'md', className = '' }) => {
  
  // Храним конфигурацию размеров в одном месте для удобной поддержки
  const sizeClasses = {
    sm: 'w-5 h-5 text-[9px] border border-white/10',
    md: 'w-10 h-10 text-xs border border-white/10 shadow-lg shadow-blue-500/10',
    lg: 'w-24 h-24 text-2xl border-2 border-white/15 shadow-xl shadow-indigo-500/10' // Размер под твой профиль
  };

  // Иконки Lucide тоже должны масштабироваться в зависимости от размера кружка
  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 32
  };

  // Получаем первую букву юзернейма, если он передан
  const firstLetter = username ? username.charAt(0).toUpperCase() : null;

  return (
    <div 
      className={`
        rounded-full 
        bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 
        flex items-center justify-center 
        font-black text-white uppercase 
        select-none flex-shrink-0
        ${sizeClasses[size] || sizeClasses.md} 
        ${className}
      `}
    >
      {avatarUrl ? (
        // Если в базе сохранен URL картинки — рендерим её
        <img 
          src={avatarUrl} 
          alt={username || "Avatar"} 
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // Защита на случай, если ссылка "битая" или сгорела — сбрасываем на букву/иконку
            e.target.style.display = 'none';
          }}
        />
      ) : firstLetter ? (
        // Если картинки нет, но есть имя — выводим красивую букву
        <span>{firstLetter}</span>
      ) : (
        // Если вообще ничего нет — дефолтный человечек
        <User size={iconSizes[size] || 14} />
      )}
    </div>
  );
};

export default Avatar;