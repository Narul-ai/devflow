import React from 'react';

export const getAvatarFallback = (name, avatarUrl) => {
  // 1. Если у пользователя есть аватарка, возвращаем её
  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={name} 
        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
      />
    );
  }

  // 2. Если аватарки нет, берём первую букву имени (или '?' если имя пустое)
  const firstLetter = name ? name.trim().charAt(0).toUpperCase() : '?';
  
  // 3. Список сочных градиентов
  const gradients = [
    'linear-gradient(135deg, #fd746c, #ff9068)', // Коралловый
    'linear-gradient(135deg, #11998e, #38ef7d)', // Зелёный
    'linear-gradient(135deg, #00c6ff, #0072ff)', // Синий
    'linear-gradient(135deg, #7f00ff, #e100ff)', // Фиолетовый
    'linear-gradient(135deg, #ff416c, #ff4b2b)'  // Розово-красный
  ];

  // Магический трюк: привязываем цвет к длине имени, чтобы у одного юзера цвет не менялся при перезагрузке
  const gradientIndex = name ? name.length % gradients.length : 0;
  const selectedGradient = gradients[gradientIndex];

  return (
    <div 
      style={{
        background: selectedGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: '900',
        borderRadius: '50%',
        width: '100%',
        height: '100%',
        fontSize: '14px',
        textShadow: '0px 2px 4px rgba(0,0,0,0.25)',
        userSelect: 'none'
      }}
    >
      {firstLetter}
    </div>
  );
};