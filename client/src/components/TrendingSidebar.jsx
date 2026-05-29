import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flame, Eye, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Подключаем хук

const TrendingSidebar = () => {
  const { t } = useTranslation(); // Инициализируем перевод
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('/posts/trending');
        const postsData = res.data.data?.posts || res.data.posts || res.data;
        setTrending(Array.isArray(postsData) ? postsData : []);
      } catch (err) {
        console.error('Ошибка при загрузке трендов:', err);
      } finally {
        loading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#0f172a]/40 border border-white/5 rounded-3xl p-6 space-y-4 animate-pulse">
        <div className="h-5 bg-slate-800 rounded w-1/3"></div>
        {[1, 2, 3].map(n => (
          <div key={n} className="space-y-2">
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            <div className="h-3 bg-slate-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (trending.length === 0) return null;

  return (
    <div className="bg-[#0f172a]/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-orange-500/20 transition-all duration-500 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Фоновый неоновый отсвет */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/10 transition-colors"></div>
      
      <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-5">
        <Flame size={18} className="text-orange-500 animate-pulse" />
        {t('trendingSidebar.title')}
      </h3>

      <div className="space-y-4">
        {trending.map((post, index) => (
          <div 
            key={post._id} 
            className="relative pl-7 pb-4 border-b border-white/5 last:border-none last:pb-0 group/item"
          >
            {/* Порядковый номер */}
            <span className="absolute left-0 top-0 text-xs font-black text-slate-600 group-hover/item:text-orange-400 transition-colors font-mono">
              0{index + 1}
            </span>

            {/* Заголовок */}
            <h4 className="text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors line-clamp-2 cursor-pointer leading-relaxed">
              {post.title}
            </h4>

            {/* Мета-данные */}
            <div className="flex items-center gap-3 mt-1.5 text-[11px] font-medium text-slate-500">
              <span className="text-blue-400">@{post.author?.username || t('trendingSidebar.authorFallback')}</span>
              <span className="flex items-center gap-1">
                <Eye size={12} /> {post.views || 0}
              </span>
              <span className="flex items-center gap-1 text-slate-400 group-hover/item:text-orange-400/80 transition-colors">
                <ThumbsUp size={11} /> {post.upvotes?.length || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSidebar;