import React, { useEffect, useState } from 'react';
import { Trophy, Star } from 'lucide-react';
import axios from 'axios'; 
// 🔥 Импортируем твой кастомный хелпер аватарок
import { getAvatarFallback } from '../utils/avatarHelper';

const LeaderboardWidget = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/auth/leaderboard');
        
        if (res.data?.status === 'success' && res.data?.data?.users) {
          // Берём первые 5 человек из топ-20, чтобы виджет был компактным
          setLeaders(res.data.data.users.slice(0, 5));
        }
      } catch (error) {
        console.error('Ошибка загрузки лидерборда:', error);
      } finally {
        loading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Стили для выделения призовых мест (Топ-3)
  const placeStyles = [
    { text: 'text-amber-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]', bg: 'bg-amber-400/10 border-amber-400/20' }, // 1 место
    { text: 'text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]', bg: 'bg-slate-300/10 border-slate-300/20' }, // 2 место
    { text: 'text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]', bg: 'bg-amber-600/10 border-amber-600/20' },  // 3 место
  ];

  return (
    <div className="bg-[#0f172a]/20 p-5 rounded-3xl border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden group">
      {/* Мягкое фоновое свечение при наведении */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500"></div>

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Trophy size={15} className="text-blue-400 animate-pulse" />
        <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
          Рейтинг авторов
        </h3>
      </div>

      <div className="space-y-2.5 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : leaders.length > 0 ? (
          leaders.map((leader, index) => {
            const isTop3 = index < 3;
            const currentStyle = isTop3 ? placeStyles[index] : { text: 'text-slate-500', bg: 'bg-slate-900/40 border-white/5' };
            const leaderAvatar = leader.avatarUrl || leader.avatar;
            const displayName = leader.username || leader.name || "User";

            return (
              <div 
                key={leader._id || index}
                className="flex items-center justify-between p-2 rounded-2xl bg-slate-950/20 border border-white/[0.02] hover:border-white/5 hover:bg-slate-950/40 transition-all duration-300"
              >
                <div className="flex items-center gap-2.5">
                  {/* Место */}
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-black ${currentStyle.bg} ${currentStyle.text}`}>
                    {index + 1}
                  </div>

                  {/* ⚡ ВЫЗОВ ТВОЕГО ГЛОБАЛЬНОГО ХЕЛПЕРА АВАТАРОК */}
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 shadow-md shrink-0 relative">
                    {getAvatarFallback(displayName, leaderAvatar)}
                  </div>

                  {/* Юзернейм */}
                  <div className="max-w-[110px] truncate">
                    <span className="text-xs font-bold text-slate-300 hover:text-blue-400 cursor-pointer transition-colors block truncate">
                      {displayName}
                    </span>
                  </div>
                </div>

                {/* Репутация */}
                <div className="flex items-center gap-1 bg-amber-500/5 px-2 py-1 rounded-xl border border-amber-500/10">
                  <Star size={10} className="text-amber-400" fill="currentColor" />
                  <span className="text-[10px] font-mono font-black text-amber-300">
                    {leader.reputation || 0}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-3 text-[11px] font-mono text-slate-600">
            Здесь пока пусто...
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardWidget;