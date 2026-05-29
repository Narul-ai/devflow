import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusCircle, Tag, User, Layers, Sparkles, Compass,
  Trophy, Star, Terminal, Hash, RefreshCw, Menu, X, Target
} from 'lucide-react';
import { useAuth } from '../App';
import axios from 'axios';
import toast from 'react-hot-toast';
import TrendingSidebar from './TrendingSidebar';
import PostCard from './PostCard';

// ==========================================
// 💎 УЛЬТРА-ПРЕМИУМ ВИДЖЕТ: ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// ==========================================
const UserProfileWidget = ({ user }) => {
  const { t } = useTranslation();

  if (!user) return (
    <div className="df-widget relative overflow-hidden bg-[#070a13]/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] w-full box-border flex items-center justify-center min-h-[88px]">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-40 animate-pulse"></div>
      <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase m-0 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping"></span>
        {t('feed.userSessionEmpty')}
      </p>
    </div>
  );

  const userAvatar = user.avatarUrl || user.avatar || user.profilePicture || user.photo;

  return (
    <div className="df-widget relative overflow-hidden bg-[#070a13]/40 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.04] shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] group w-full box-border text-left transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:scale-125 group-hover:from-blue-500/15"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:scale-110"></div>

      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-transparent to-transparent transition-all duration-700 group-hover:from-transparent group-hover:via-blue-400/30 group-hover:to-transparent"></div>

      <div className="flex items-start gap-3 sm:gap-4 w-full box-border min-w-0 relative z-10">
        <div className="shrink-0 relative group/avatar">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-cyan-400 to-indigo-500 rounded-full blur-md opacity-20 transition-all duration-500 group-hover/avatar:opacity-80 group-hover/avatar:scale-105"></div>
          <div className="relative p-[1.5px] rounded-full bg-gradient-to-b from-white/10 to-white/[0.02] transition-all duration-500 group-hover/avatar:from-blue-500/40 group-hover/avatar:to-cyan-400/40 shadow-2xl">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={user.username || "avatar"}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover bg-slate-950 ring-1 ring-black/50"
              />
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 flex items-center justify-center text-xs font-black text-slate-300 uppercase ring-1 ring-black/50 shadow-inner">
                {user.username ? user.username.charAt(0) : <User size={14} className="text-slate-400" />}
              </div>
            )}
          </div>

          <span className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-[#070a13]"></span>
          </span>
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-widest shrink-0 shadow-[0_2px_10px_rgba(59,130,246,0.1)]">
                {t('feed.prodLabel')}
              </span>
              <span className="text-sm font-bold text-slate-200 truncate tracking-tight group-hover:text-white transition-colors duration-300">
                @{user.username}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-1 mb-3 leading-relaxed font-normal break-words whitespace-normal line-clamp-2 pr-1 font-sans">
            {user.bio || t('feed.profileBioFallback')}
          </p>

          <div className="flex items-center justify-between gap-2.5 sm:gap-3 border-t border-white/[0.03] pt-3 mt-1 w-full box-border">
            <div className="flex items-center gap-1.5 bg-slate-950/60 border border-white/[0.03] px-2.5 py-1 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <Star size={10} className="text-amber-400 shrink-0 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" fill="currentColor" />
              <span className="text-[10px] font-mono font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent tracking-tight">
                {user.reputation || 0}{' '}
                <span className="text-slate-600 text-[8px] font-normal font-sans ml-0.5">
                  {t('feed.xpLabel')}
                </span>
              </span>
            </div>

            <a
              href="/profile"
              className="group/btn text-[9px] font-black tracking-wider uppercase text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-1 bg-white/[0.01] hover:bg-blue-600 border border-white/[0.04] hover:border-blue-500 px-2.5 py-1.5 rounded-xl shadow-sm hover:shadow-[0_4px_20px_rgba(59,130,246,0.25)]"
            >
              <span>{t('feed.cabinet')}</span>
              <Compass size={10} className="text-slate-500 group-hover/btn:text-white transition-all group-hover/btn:rotate-45 duration-300 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 💎 УЛЬТРА-ПРЕМИУМ ВИДЖЕТ: ЛИДЕРБОРД
// ==========================================
const LeaderboardWidget = ({ getAuthConfig }) => {
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/users/leaderboard', getAuthConfig());
        if (res.data?.status === 'success' && res.data?.data?.users) {
          setLeaders(res.data.data.users.slice(0, 5));
        }
      } catch (error) {
        console.error(t('feed.errors.leaderboardConsole'), error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [getAuthConfig, t]);

  const topStyles = [
    { text: 'text-amber-400', bg: 'bg-amber-400/5 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]' },
    { text: 'text-slate-300', bg: 'bg-slate-300/5 border-slate-400/20' },
    { text: 'text-amber-600', bg: 'bg-amber-700/5 border-amber-800/20' }
  ];

  return (
    <div className="df-widget bg-[#070a13]/40 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.04] shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] w-full box-border text-left transition-all duration-500 hover:border-white/[0.1]">
      <div className="flex items-center gap-2 mb-3 sm:mb-4 w-full border-b border-white/[0.03] pb-2.5">
        <Trophy size={12} className="text-blue-400 shrink-0 filter drop-shadow-[0_0_6px_rgba(59,130,246,0.3)]" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0 font-mono">
          {t('feed.topContributors')}
        </h3>
      </div>

      <div className="space-y-1.5 w-full box-border min-w-0">
        {loading ? (
          <div className="flex items-center justify-center py-6 w-full">
            <div className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : leaders.length > 0 ? (
          leaders.map((leader, index) => {
            const isTop3 = index < 3;
            const currentStyle = isTop3 ? topStyles[index] : { text: 'text-slate-500', bg: 'bg-slate-950/40 border-white/[0.02]' };
            const leaderAvatar = leader.avatarUrl || leader.avatar;

            return (
              <div
                key={leader._id || index}
                className="flex items-center justify-between px-2 py-2 sm:p-2.5 rounded-xl bg-slate-950/20 border border-white/[0.01] hover:border-white/[0.05] hover:bg-slate-950/50 transition-all duration-200 w-full box-border min-w-0 gap-2 group/row"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center text-[9px] font-black font-mono ${currentStyle.bg} ${currentStyle.text}`}>
                    {index + 1}
                  </div>

                  {leaderAvatar ? (
                    <img src={leaderAvatar} alt="avatar" className="shrink-0 w-6 h-6 rounded-full object-cover border border-white/10 group-hover/row:border-white/20 transition-colors" />
                  ) : (
                    <div className="shrink-0 w-6 h-6 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">
                      {leader.username ? leader.username.charAt(0) : 'U'}
                    </div>
                  )}

                  <span className="text-xs font-medium text-slate-300 truncate flex-1 group-hover/row:text-slate-200 transition-colors">
                    @{leader.username}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-0.5 bg-amber-500/[0.02] border border-amber-500/10 px-1.5 py-0.5 rounded-lg">
                  <Star size={9} className="text-amber-400/80 shrink-0" fill="currentColor" />
                  <span className="text-[9px] font-mono font-black text-amber-400/90">{leader.reputation || 0}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-3 text-[9px] font-mono text-slate-600 w-full tracking-wider">
            {t('feed.noLeadersData')}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 💎 УЛЬТРА-ПРЕМИУМ ВИДЖЕТ: ПОПУЛЯРНЫЕ ТЕГИ
// ==========================================
const PopularTagsWidget = ({ tagCounts, availableTags, activeFilter, handleFilterChange }) => {
  const { t } = useTranslation();

  return (
    <div className="df-widget bg-[#070a13]/40 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.04] shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] w-full box-border text-left transition-all duration-500 hover:border-white/[0.1]">
      <div className="flex items-center gap-2 mb-3 sm:mb-4 w-full border-b border-white/[0.03] pb-2.5">
        <Hash size={12} className="text-cyan-400 shrink-0 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.3)]" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0 font-mono">
          {t('feed.trendingTags')}
        </h3>
      </div>

      <div className="df-tags flex flex-wrap gap-1.5 w-full box-border">
        {availableTags.slice(0, 12).map(tag => {
          const count = tagCounts[tag] || 0;
          const isActive = activeFilter === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleFilterChange(isActive ? 'all' : tag)}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all duration-300 flex items-center gap-1.5 box-border cursor-pointer normal-case shadow-sm ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-slate-950/20 text-slate-400 border-white/[0.02] hover:border-white/10 hover:bg-slate-950/60 hover:text-slate-200'
              }`}
            >
              <span className={isActive ? 'text-blue-400' : 'text-slate-600'}>#</span>
              <span className="truncate max-w-[140px]">{t(`feed.tags.${tag}`)}</span>
              {count > 0 && (
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                    isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 💎 УЛЬТРА-ПРЕМИУМ ВИДЖЕТ: СОВЕТЫ ДЕВАМ
// ==========================================
const DevTipWidget = () => {
  const { t } = useTranslation();

  const tips = t('feed.devTip.tips', { returnObjects: true });

  const [tip, setTip] = useState('');
  const rotateTip = useCallback(() => {
    const arr = Array.isArray(tips) ? tips : [];
    setTip(arr[Math.floor(Math.random() * Math.max(1, arr.length))] || '');
  }, [tips]);

  useEffect(() => { rotateTip(); }, [rotateTip]);

  return (
    <div className="df-widget bg-[#070a13]/40 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.04] shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden group w-full box-border text-left transition-all duration-500 hover:border-emerald-500/20">
      <div className="flex items-center justify-between mb-3 w-full gap-2 border-b border-white/[0.03] pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal size={12} className="text-emerald-400 shrink-0 filter drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate m-0 font-mono">
            {t('feed.devTip.title')}
          </h3>
        </div>
        <button
          onClick={rotateTip}
          className="shrink-0 text-slate-500 hover:text-emerald-400 transition-colors p-1 bg-slate-950/40 hover:bg-slate-950 rounded-lg border border-white/5"
          type="button"
          aria-label={t('feed.devTip.rotate')}
        >
          <RefreshCw size={10} className="group-hover:rotate-180 transition-transform duration-700" />
        </button>
      </div>

      <div className="relative p-3 rounded-xl bg-slate-950/40 border border-white/[0.01] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
        <p className="text-[11px] font-mono leading-relaxed text-slate-400 break-words whitespace-normal m-0 w-full tracking-tight">
          <span className="text-emerald-500/70 mr-1.5 font-bold">&gt;_</span>{tip}
        </p>
      </div>
    </div>
  );
};

const PostSkeleton = () => (
  <div className="bg-[#0f172a]/20 p-5 rounded-2xl border border-white/5 animate-pulse space-y-4 w-full box-border">
    <div className="flex items-center justify-between w-full box-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
        <div className="space-y-1.5">
          <div className="w-20 h-2.5 bg-slate-800 rounded"></div>
          <div className="w-12 h-2 bg-slate-800/60 rounded"></div>
        </div>
      </div>
      <div className="w-14 h-4 bg-slate-800/50 rounded-md"></div>
    </div>
    <div className="space-y-2 pt-1 w-full box-border">
      <div className="w-2/3 h-3.5 bg-slate-800 rounded"></div>
      <div className="w-full h-2.5 bg-slate-800/60 rounded"></div>
    </div>
  </div>
);

const tagStyles = {
  development: 'bg-blue-500/5 text-blue-400 border-blue-500/20 shadow-blue-500/5 hover:border-blue-500/40 hover:bg-blue-500/10',
  architecture: 'bg-purple-500/5 text-purple-400 border-purple-500/20 shadow-purple-500/5 hover:border-purple-500/40 hover:bg-purple-500/10',
  javascript: 'bg-yellow-500/5 text-yellow-400 border-yellow-500/20 shadow-yellow-500/5 hover:border-yellow-500/40 hover:bg-yellow-500/10',
  database: 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10',
  design: 'bg-pink-500/5 text-pink-400 border-pink-500/20 shadow-pink-500/5 hover:border-pink-500/40 hover:bg-pink-500/10',
  backend: 'bg-cyan-500/5 text-cyan-400 border-cyan-500/20 shadow-cyan-500/5 hover:border-cyan-500/40 hover:bg-cyan-500/10',
  frontend: 'bg-orange-500/5 text-orange-400 border-orange-500/20 shadow-orange-500/5 hover:border-orange-500/40 hover:bg-orange-500/10',
  devops: 'bg-indigo-500/5 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-500/40 hover:bg-indigo-500/10',
  security: 'bg-rose-500/5 text-rose-400 border-rose-500/20 shadow-rose-500/5 hover:border-rose-500/40 hover:bg-rose-500/10',
  python: 'bg-sky-500/5 text-sky-400 border-sky-500/20 shadow-sky-500/5 hover:border-sky-500/40 hover:bg-sky-500/10',
  networking: 'bg-violet-500/5 text-violet-400 border-violet-500/20 shadow-violet-500/5 hover:border-violet-500/40 hover:bg-violet-500/10',
  ai_ml: 'bg-fuchsia-500/5 text-fuchsia-400 border-fuchsia-500/20 shadow-fuchsia-500/5 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10',
  general: 'bg-slate-500/5 text-slate-400 border-white/5 shadow-sm'
};

// ==========================================
// 🔥 ГЛАВНЫЙ КОМПОНЕНТ ЛЕНТЫ (FEED)
// ==========================================
const Feed = ({ searchQuery }) => {
  const { t, i18n } = useTranslation();

  const { token, user, refreshUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({ title: '', content: '' });
  const [selectedTag, setSelectedTag] = useState('development');

  const [activeFilter, setActiveFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [expandedComments, setExpandedComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  const [isMobileWidgetsOpen, setIsMobileWidgetsOpen] = useState(false);

  // ✅ локальный стейт подписок (чтобы кнопка работала на фронте сразу)
  const [followingSet, setFollowingSet] = useState(() => new Set());

  const availableTags = [
    'development', 'architecture', 'javascript', 'database', 'design',
    'backend', 'frontend', 'devops', 'security', 'python', 'networking', 'ai_ml'
  ];

  const getAuthConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  // ✅ синхронизируем локальный followingSet с user (когда user обновится)
  useEffect(() => {
    const raw = user?.following || user?.followingUsers || user?.subscriptions || [];
    const ids = Array.isArray(raw)
      ? raw.map(x => (typeof x === 'string' ? x : (x?._id || x?.id))).filter(Boolean)
      : [];
    setFollowingSet(new Set(ids));
  }, [user]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery || '');
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (isMobileWidgetsOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMobileWidgetsOpen]);

  const fetchPosts = useCallback(async (tagFilter = activeFilter, searchVal = debouncedSearch) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (tagFilter !== 'all') params.append('tags', tagFilter);
      if (searchVal && searchVal.trim() !== '') params.append('search', searchVal.trim());

      const endpoint = `/posts${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await axios.get(endpoint, getAuthConfig());
      const data = res.data.data?.posts || res.data.data || res.data;
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(t('feed.errors.fetchPostsConsole'), err);
      toast.error(t('feed.errors.fetchPostsToast'));
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch, getAuthConfig, t]);

  useEffect(() => {
    if (token) {
      if (typeof refreshUser === 'function') refreshUser();
      fetchPosts(activeFilter, debouncedSearch);
    }
  }, [token, activeFilter, debouncedSearch, fetchPosts, refreshUser]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setIsMobileWidgetsOpen(false);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.trim().length < 10) return toast.error(t('feed.validation.titleMin'));
    if (formData.content.trim().length < 20) return toast.error(t('feed.validation.contentMin'));

    setSubmitting(true);
    try {
      const postPayload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: [selectedTag],
        category: selectedTag
      };
      await axios.post('/posts', postPayload, getAuthConfig());
      setFormData({ title: '', content: '' });
      toast.success(t('feed.toast.postPublished'), { icon: '🚀' });
      setActiveFilter('all');
      await fetchPosts('all', '');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t('feed.errors.publishPost'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = useCallback(async (postId) => {
    const currentUserId = user?._id || user?.id || 'current-user-session';
    try {
      setPosts(prev => prev.map(post => {
        if (post._id !== postId) return post;
        const alreadyUpvoted = post.upvotes?.includes(currentUserId);
        let updatedUpvotes = [...(post.upvotes || [])];

        if (alreadyUpvoted) {
          updatedUpvotes = updatedUpvotes.filter(id => id !== currentUserId);
          return { ...post, upvotes: updatedUpvotes, isLiked: false };
        } else {
          updatedUpvotes.push(currentUserId);
          return { ...post, upvotes: updatedUpvotes, isLiked: true };
        }
      }));
      await axios.post(`/posts/${postId}/upvote`, {}, getAuthConfig());
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t('feed.errors.likeFail'));
      fetchPosts(activeFilter, debouncedSearch);
    }
  }, [user, getAuthConfig, refreshUser, activeFilter, debouncedSearch, fetchPosts, t]);

  const handleBookmark = useCallback(async (postId) => {
    if (!token) return toast.error(t('feed.errors.bookmarkAuth'), { id: "auth-error" });
    const toastId = `bookmark-${postId}`;
    try {
      const response = await axios.post(`/posts/${postId}/bookmark`, {}, getAuthConfig());
      if (refreshUser) await refreshUser();
      const isNowBookmarked = response.data.isBookmarked;

      setPosts(prevPosts =>
        prevPosts.map(post => post._id === postId ? { ...post, isBookmarked: isNowBookmarked } : post)
      );
      toast.success(isNowBookmarked ? t('feed.toast.bookmarkAdded') : t('feed.toast.bookmarkRemoved'), { id: toastId });
    } catch (err) {
      console.error(t('feed.errors.bookmarkConsole'), err);
      toast.error(err.response?.data?.message || t('feed.errors.bookmarkFail'), { id: toastId });
    }
  }, [token, getAuthConfig, refreshUser, t]);

  const toggleComments = useCallback(async (postId) => {
    const isOpening = !expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));

    if (isOpening) {
      const targetPost = posts.find(p => p._id === postId);
      if (targetPost && (!targetPost.comments || targetPost.comments.length === 0) && targetPost.commentsCount > 0) {
        setLoadingComments(prev => ({ ...prev, [postId]: true }));
        try {
          const res = await axios.get(`/posts/${postId}/comments`, getAuthConfig());
          const fetchedComments = res.data.data?.comments || res.data.comments || res.data.data || res.data;
          setPosts(prev => prev.map(post =>
            post._id === postId ? { ...post, comments: Array.isArray(fetchedComments) ? fetchedComments : [] } : post
          ));
        } catch (err) {
          console.error(t('feed.errors.loadCommentsConsole'), err);
          toast.error(t('feed.errors.loadCommentsToast'));
        } finally {
          setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
      }
    }
  }, [expandedComments, posts, getAuthConfig, t]);

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId]?.trim();
    if (!commentText || commentText.length < 2) return toast.error(t('feed.validation.commentMin'));

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await axios.post(`/posts/${postId}/comments`, { content: commentText }, getAuthConfig());
      const newComment = res.data.data?.comment || res.data.comment || res.data.data || res.data;

      setPosts(prev => prev.map(post => {
        if (post._id !== postId) return post;
        return {
          ...post,
          commentsCount: (post.commentsCount || 0) + 1,
          comments: [newComment, ...(post.comments || [])]
        };
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success(t('feed.toast.commentAdded'));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t('feed.errors.sendCommentFail'));
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      setPosts(prev => prev.map(post => {
        if (post._id !== postId) return post;
        return {
          ...post,
          commentsCount: Math.max(0, (post.commentsCount || 0) - 1),
          comments: (post.comments || []).filter(c => c._id !== commentId)
        };
      }));
      await axios.delete(`/comments/${commentId}`, getAuthConfig());
      toast.success(t('feed.toast.commentDeleted'));
    } catch (err) {
      console.error(t('feed.errors.deleteCommentConsole'), err);
      toast.error(t('feed.errors.deleteCommentFail'));
    }
  };

  // ==========================================
  // 🚀 ФРОНТ: ПОДПИСКА/ОТПИСКА (оптимистично)
  // ==========================================
  const handleFollow = useCallback(async (authorId) => {
    if (!token) return toast.error(t('feed.errors.followAuth'), { id: "auth-error" });
    if (!authorId) return;

    const wasFollowing = followingSet.has(authorId);

    // ✅ сразу меняем UI
    setFollowingSet(prev => {
      const next = new Set(prev);
      if (next.has(authorId)) next.delete(authorId);
      else next.add(authorId);
      return next;
    });

    // ✅ тост сразу
    toast.success(wasFollowing ? t('feed.toast.followUiUnfollow') : t('feed.toast.followUiFollow'));

    // ⚠️ пока бэкенд не готов — не ломаем UI: пробуем запрос, если упадёт — просто оставим UI как есть
    // (потом, когда займёмся бэком, сделаем норм: rollback при ошибке + refreshUser)
    try {
      await axios.patch(`/users/follow/${authorId}`, {}, getAuthConfig());
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.warn(t('feed.errors.followApiWarn'), err?.response?.data || err?.message || err);
      // rollback можно включить позже, когда ты скажешь что бэк готов
    }
  }, [token, getAuthConfig, refreshUser, followingSet, t]);

  const calculateReadTime = (text) => {
    const wordsPerMinute = 185;
    const words = text ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return t('feed.readTime', { count: minutes });
  };

  const tagCounts = {};
  posts.forEach(post => {
    const tag = post.category || (post.tags && post.tags[0]);
    if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });

  return (
    <div className="w-full relative min-h-screen box-border overflow-x-hidden bg-[#020617] text-slate-100 antialiased">

      <style>{`
        html, body, #root {
          background-color: #020617 !important;
          overflow-x: hidden !important;
          width: 100% !important;
          max-width: 100vw !important;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        [kbd], .font-mono:has(kbd), span:contains("Ctrl"), span:contains("Ctrl K"),
        kbd, .text-mono, [class*="Ctrl"] {
          display: none !important;
        }

        @media (max-width: 1023px) {
          header, nav, div[class*="navbar"] {
            max-width: 100vw !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }

        .premium-scroll::-webkit-scrollbar { height: 3px; width: 3px; }
        .premium-scroll::-webkit-scrollbar-track { background: transparent; }
        .premium-scroll::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.4); border-radius: 99px; }
        @media (max-width: 1024px) {
          .premium-scroll::-webkit-scrollbar { display: none !important; }
          .premium-scroll { scrollbar-width: none !important; }
        }

        .break-words { word-wrap: break-word; max-width: 100%; }

        @media (max-width: 420px) {
          .df-widget { border-radius: 18px !important; }
          .df-tags button { padding: 6px 10px !important; border-radius: 14px !important; }
        }

        @media (max-width: 390px) {
          .post-actions,
          .post__actions,
          .postActions,
          .post-actions-row,
          .post-footer-actions,
          .actions-row,
          .actions,
          [class*="actions"] {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .post-actions > *,
          .post__actions > *,
          .postActions > *,
          .post-actions-row > *,
          .post-footer-actions > *,
          .actions-row > *,
          .actions > * {
            min-width: 0 !important;
            flex: 0 1 auto !important;
          }
        }

        .df-sheet {
          animation: dfSheetUp 180ms ease-out both;
        }
        @keyframes dfSheetUp {
          from { transform: translateY(18px); opacity: 0.4; }
          to   { transform: translateY(0); opacity: 1; }
        }

        .df-sheet-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: start;
        }
        .df-sheet-grid .df-widget-full {
          grid-column: 1 / -1;
        }

        @media (max-width: 430px) {
          .df-sheet-grid {
            grid-template-columns: 1fr;
          }
          .df-sheet-grid .df-widget-full {
            grid-column: 1;
          }
        }
      `}</style>

      {isMobileWidgetsOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            onClick={() => setIsMobileWidgetsOpen(false)}
          />

          <div
            className="absolute left-0 right-0 bottom-0 df-sheet"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
            }}
          >
            <div className="mx-auto w-full max-w-[520px] px-3">
              <div className="bg-[#070a13] border border-white/5 shadow-2xl rounded-t-3xl overflow-hidden">
                <div
                  className="px-4 pt-4 pb-3 border-b border-white/5"
                  style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-10 h-1.5 rounded-full bg-white/10 hidden xs:block" />
                      <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                        <Target size={12} className="text-blue-500" /> {t('feed.widgetsTitle')}
                      </span>
                    </div>

                    <button
                      onClick={() => setIsMobileWidgetsOpen(false)}
                      className="p-2 bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 hover:text-white flex items-center justify-center transition-all"
                      type="button"
                      aria-label={t('feed.close')}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="mt-3 h-1 w-12 mx-auto rounded-full bg-white/10" />
                </div>

                <div className="max-h-[76vh] overflow-y-auto premium-scroll px-4 py-4">
                  <div className="df-sheet-grid">
                    <div className="df-widget-full">
                      <UserProfileWidget user={user} />
                    </div>

                    <LeaderboardWidget getAuthConfig={getAuthConfig} />
                    <DevTipWidget />

                    <div className="df-widget-full">
                      <TrendingSidebar activeFilter={activeFilter} handleFilterChange={handleFilterChange} />
                    </div>

                    <div className="df-widget-full">
                      <PopularTagsWidget
                        tagCounts={tagCounts}
                        availableTags={availableTags}
                        activeFilter={activeFilter}
                        handleFilterChange={handleFilterChange}
                      />
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ВАЖНО: sticky ломается из-за overflow на родителе.
          Поэтому делаем overflow-x-hidden только для мобилок,
          а на lg возвращаем overflow-visible. */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start px-3 sm:px-4 lg:px-6 box-border pt-4 overflow-x-hidden lg:overflow-visible antialiased">

        <div className="lg:col-span-2 space-y-4 min-w-0 w-full box-border">
          <div className="flex lg:hidden justify-between items-center bg-[#0f172a]/20 border border-white/5 rounded-xl p-3.5 box-border w-full">
            <h1 className="text-[11px] font-black text-slate-400 tracking-wider flex items-center gap-2 font-mono m-0 uppercase">
              <Terminal size={13} className="text-blue-500 shrink-0" /> {t('feed.headerTitle')}
            </h1>
            <button
              onClick={() => setIsMobileWidgetsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-xl text-[10px] font-black uppercase text-blue-400 active:scale-95 transition-all shadow-sm cursor-pointer"
              type="button"
            >
              <Menu size={11} /> <span>{t('feed.widgetsButton')}</span>
            </button>
          </div>

          <form onSubmit={handlePostSubmit} className="bg-[#0f172a]/20 p-5 sm:p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden w-full box-border text-left">
            <h2 className="text-xs font-black mb-4 flex items-center gap-2 text-slate-200 tracking-wider font-mono m-0 uppercase">
              <PlusCircle size={14} className="text-blue-500 shrink-0" /> {t('feed.postFormTitle')}
            </h2>

            <div className="space-y-3 w-full box-border">
              <div className="relative w-full box-border">
                <input
                  type="text"
                  className="w-full bg-[#020617]/80 border border-white/5 rounded-xl p-3 pr-12 outline-none focus:border-blue-500/30 text-white text-xs font-medium placeholder-slate-500 box-border m-0 transition-all"
                  placeholder={t('feed.placeholders.title')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={submitting}
                  maxLength={150}
                  required
                />
                <span className="absolute right-3 top-3.5 text-[8px] font-mono font-bold text-slate-600">
                  {formData.title.length}/150
                </span>
              </div>

              <div className="relative w-full box-border">
                <textarea
                  className="w-full bg-[#020617]/80 border border-white/5 rounded-xl p-3 pr-12 outline-none focus:border-blue-500/30 text-white text-xs resize-none placeholder-slate-500 box-border h-24 m-0 transition-all leading-relaxed break-words whitespace-pre-wrap"
                  placeholder={t('feed.placeholders.content')}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  disabled={submitting}
                  required
                />
                <span className="absolute right-3 bottom-3 text-[8px] font-mono font-bold text-slate-600">
                  {formData.content.length} {t('feed.chars')}
                </span>
              </div>
            </div>

            <div className="mt-4 w-full box-border">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1 font-mono">
                <Tag size={10} className="text-slate-500 shrink-0" /> {t('feed.categoryLabel')}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 w-full box-border">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-all box-border normal-case cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-sm'
                        : 'bg-slate-900/30 text-slate-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    #{t(`feed.tags.${tag}`)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || formData.title.trim().length < 10 || formData.content.trim().length < 20}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 py-3 mt-4 rounded-xl font-black text-[10px] text-white shadow-lg disabled:opacity-20 transition-all uppercase tracking-wider box-border cursor-pointer active:scale-[0.99]"
            >
              {submitting ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  {t('feed.publishButton')} <Sparkles size={11} />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 premium-scroll border-b border-white/5 w-full box-border max-w-full">
            <button
              onClick={() => handleFilterChange('all')}
              className={`shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border transition-all box-border cursor-pointer ${
                activeFilter === 'all' ? 'bg-slate-800/80 border-white/10 text-white shadow-md' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
              type="button"
            >
              <Layers size={10} /> <span>{t('feed.filters.all')}</span>
            </button>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleFilterChange(tag)}
                className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border transition-all box-border cursor-pointer normal-case ${
                  activeFilter === tag ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                }`}
                type="button"
              >
                #{t(`feed.tags.${tag}`)}
              </button>
            ))}
          </div>

          <div className="space-y-4 pb-24 w-full box-border">
            {loading ? (
              [1, 2, 3].map(n => <PostSkeleton key={n} />)
            ) : posts.length > 0 ? (
              posts.map((post, index) => (
                <PostCard
                  key={post._id}
                  post={post}
                  index={index}
                  user={user}
                  tagStyles={tagStyles}
                  expandedComments={expandedComments}
                  loadingComments={loadingComments}
                  commentInputs={commentInputs}
                  submittingComment={submittingComment}
                  setCommentInputs={setCommentInputs}
                  handleLike={handleLike}
                  handleBookmark={handleBookmark}
                  toggleComments={toggleComments}
                  handleCommentSubmit={handleCommentSubmit}
                  handleDeleteComment={handleDeleteComment}
                  calculateReadTime={calculateReadTime}
                  // ✅ подписка: теперь кнопка сможет вызывать это
                  handleFollow={handleFollow}
                  // ✅ если PostCard хочет понять подписан ли:
                  followingSet={followingSet}
                  // ✅ на всякий: если PostCard захочет перевод
                  t={t}
                  i18n={i18n}
                />
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-slate-900/5 box-border w-full">
                <Compass className="mx-auto text-slate-600 mb-2" size={18} />
                <p className="text-xs font-bold text-slate-500 m-0 font-mono">{t('feed.flowEmpty')}</p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ ПК: виджеты "замерли" через sticky.
            ВАЖНО: sticky будет работать стабильно, потому что родитель теперь lg:overflow-visible */}
        <aside className="hidden lg:flex lg:sticky lg:top-24 self-start flex-col gap-4 w-full box-border pb-24 min-w-0 h-fit">
          <UserProfileWidget user={user} />
          <TrendingSidebar activeFilter={activeFilter} handleFilterChange={handleFilterChange} />
          <LeaderboardWidget getAuthConfig={getAuthConfig} />
          <PopularTagsWidget tagCounts={tagCounts} availableTags={availableTags} activeFilter={activeFilter} handleFilterChange={handleFilterChange} />
          <DevTipWidget />
        </aside>

      </div>
    </div>
  );
};

export default Feed;