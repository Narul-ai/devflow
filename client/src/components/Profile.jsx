import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import { 
  User, Mail, Calendar, Award, BookOpen, Trash2, Clock, 
  MapPin, Globe, Edit3, X, Bookmark, Code, Users, 
  Activity, Flame, Sparkles, PlusCircle, ExternalLink, Image
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Avatar from './Avatar';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user: authUser, token, refreshUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, followersCount: 0, followingCount: 0, reputation: 0 });
  
  const [activeTab, setActiveTab] = useState('posts'); 
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    website: '',
    github: '',
    skills: '',
    avatar: '' 
  });

  const [postEditData, setPostEditData] = useState({
    title: '',
    category: '',
    content: ''
  });

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const getDevRankDetails = (reputation) => {
    if (reputation >= 100) {
      return { 
        title: t('profile.ranks.eliteArchitect.title'), 
        color: 'from-purple-500 via-indigo-500 to-pink-500', 
        glow: 'shadow-purple-500/20',
        nextRank: t('profile.ranks.eliteArchitect.nextRank'), 
        progress: 100 
      };
    }
    if (reputation >= 50) {
      return { 
        title: t('profile.ranks.seniorDeveloper.title'), 
        color: 'from-amber-500 to-orange-500', 
        glow: 'shadow-orange-500/20',
        nextRank: t('profile.ranks.seniorDeveloper.nextRank'), 
        progress: ((reputation - 50) / 50) * 100 
      };
    }
    if (reputation >= 15) {
      return { 
        title: t('profile.ranks.middleFullstack.title'), 
        color: 'from-blue-500 to-cyan-500', 
        glow: 'shadow-cyan-500/20',
        nextRank: t('profile.ranks.middleFullstack.nextRank'), 
        progress: ((reputation - 15) / 35) * 100 
      };
    }
    return { 
      title: t('profile.ranks.juniorPadawan.title'), 
      color: 'from-slate-400 to-slate-500', 
      glow: 'shadow-slate-500/20',
      nextRank: t('profile.ranks.juniorPadawan.nextRank'), 
      progress: (reputation / 15) * 100 
    };
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('profile.toast.profileLinkCopied'), {
      style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
    });
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // ИСПОЛЬЗУЕМ ГЛОБАЛЬНЫЙ AXIOS
      const res = await axios.get(`/users/${authUser.username}`, getAuthConfig());
      
      if (res.data.status === 'success') {
        const { user, posts, stats: userStats } = res.data.data;
        setProfile(user);
        setMyPosts(posts);
        setStats(userStats);
        
        setFormData({
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || '',
          github: user.github || '',
          avatar: user.avatar || '',
          skills: user.skills ? user.skills.join(', ') : ''
        });

        setSavedPosts(user.bookmarks || user.savedPosts || []);
      }
    } catch (err) {
      console.error(t('profile.errors.fetchProfileConsole'), err);
      toast.error(t('profile.errors.fetchProfileToast'));
    } 
    window.location.hash = "";
    setLoading(false);
  };

  useEffect(() => {
    if (authUser?.username && token) {
      fetchProfileData();
    }
  }, [authUser, token]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm(t('profile.confirm.deletePost'))) return;

    try {
      // ИСПОЛЬЗУЕМ ГЛОБАЛЬНЫЙ AXIOS
      await axios.delete(`/posts/${postId}`, getAuthConfig());
      toast.success(t('profile.toast.postDeleted'));
      setMyPosts(prev => prev.filter(post => post._id !== postId));
      setStats(prev => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }));
    } catch (err) {
      console.error(err);
      toast.error(t('profile.errors.deletePostToast'));
    }
  };

  const openEditPostModal = (post) => {
    setSelectedPost(post);
    setPostEditData({
      title: post.title || '',
      category: post.category || 'dev',
      content: post.content || ''
    });
    setIsEditPostModalOpen(true);
  };

  const handlePostEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // ИСПОЛЬЗУЕМ ГЛОБАЛЬНЫЙ AXIOS
      const res = await axios.patch(`/posts/${selectedPost._id}`, postEditData, getAuthConfig());
      if (res.data.status === 'success' || res.status === 200) {
        toast.success(t('profile.toast.postUpdated'));
        setIsEditPostModalOpen(false);
        fetchProfileData();
      }
    } catch (err) {
      console.error(err);
      toast.error(t('profile.errors.savePostChangesToast'));
    }
  };

  const handleToggleSave = async (postId) => {
    if (!postId) {
      toast.error(t('profile.errors.invalidPostId'));
      return;
    }
    try {
      // ИСПОЛЬЗУЕМ ГЛОБАЛЬНЫЙ AXIOS
      const res = await axios.post(`/posts/${postId}/bookmark`, {}, getAuthConfig());
      toast.success(res.data.message || t('profile.toast.bookmarksUpdated'));
      
      if (res.data.data?.bookmarks) {
        setSavedPosts(res.data.data.bookmarks);
      } else {
        setSavedPosts(prev => prev.filter(post => (post._id || post) !== postId));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('profile.errors.toggleBookmarkToast'));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch('/users/updateMe', formData, getAuthConfig());
      
      if (res.data.status === 'success') {
        toast.success(t('profile.toast.profileUpdated'));
        setIsEditModalOpen(false);
        await refreshUser();
        fetchProfileData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t('profile.errors.updateProfileToast'));
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-gradient-to-r from-blue-500 to-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 italic text-sm tracking-wider animate-pulse font-mono">{t('profile.loadingSync')}</p>
      </div>
    );
  }

  const displayUser = profile || authUser;
  const rank = getDevRankDetails(stats.reputation);

  const activityDays = Array.from({ length: 28 }, () => {
    const r = Math.random();
    if (r > 0.85) return 'bg-emerald-500 shadow-sm shadow-emerald-500/40 scale-105';
    if (r > 0.6) return 'bg-emerald-600/70';
    if (r > 0.3) return 'bg-emerald-800/40';
    return 'bg-slate-800/50';
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out pb-16">
      
      {/* КАРТОЧКА ПРОФИЛЯ */}
      <div className="bg-[#0f172a]/30 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center group transition-all duration-700 hover:border-blue-500/30 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]">
        <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-gradient-to-tr from-blue-600/15 to-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 group-hover:from-blue-600/20 transition-all duration-1000"></div>
        <div className="absolute -left-24 -top-24 w-72 h-72 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:translate-x-12 transition-all duration-1000"></div>
        
        <div className="relative group/avatar cursor-pointer shrink-0">
          <Avatar 
            avatarUrl={displayUser?.avatar} 
            username={displayUser?.username} 
            size="lg" 
          />
          <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/10 p-1.5 rounded-xl z-20 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 shadow-xl">
            <Sparkles size={12} className="text-amber-400 animate-spin duration-1000" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-3 w-full relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
            <h2 className="text-2xl font-black text-white tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-500">
              @{displayUser?.username}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-300 active:scale-95">
                <Edit3 size={12} /> {t('profile.edit')}
              </button>
              <button onClick={handleShareProfile} className="flex items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-white/20 transition-all duration-300 active:scale-95" title={t('profile.shareProfileTitle')}>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#020617] border border-white/5 shadow-inner">
            <span className={`bg-gradient-to-r ${rank.color} bg-clip-text text-transparent animate-pulse`}>
              ✦ {rank.title}
            </span>
          </div>

          <p className="text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
            {displayUser?.bio || t('profile.bioFallback')}
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-slate-400 font-medium pt-1">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} className="text-slate-500" /> {displayUser?.email}
            </span>
            {displayUser?.location && (
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MapPin size={13} className="text-rose-400/80 animate-bounce duration-1000" /> {displayUser.location}
              </span>
            )}
            {displayUser?.website && (
              <a href={displayUser.website.startsWith('http') ? displayUser.website : `https://${displayUser.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors group/link">
                <Globe size={13} className="text-cyan-400/70 group-hover/link:rotate-45 transition-transform duration-500" /> {t('profile.portfolio')}
              </a>
            )}
            {displayUser?.github && (
              <a href={displayUser.github.startsWith('http') ? displayUser.github : `https://github.com/${displayUser.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white text-slate-300 transition-colors group/git">
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover/git:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2" /></svg>
                GitHub
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-500" /> {t('profile.memberSincePrefix')}{displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' }) : t('profile.memberSinceFallback')}
            </span>
          </div>
        </div>
      </div>

      {/* ПРОГРЕСС РАНГА */}
      <div className="bg-[#0f172a]/20 border border-white/5 p-4 rounded-2xl space-y-2 relative overflow-hidden group">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Flame size={14} className="text-orange-500 animate-pulse" /> {t('profile.currentXpLabel')} <strong className="text-white">{stats.reputation} XP</strong>
          </span>
          <span className="text-slate-500">
            {t('profile.nextRankLabel')} <strong className="text-cyan-400 font-bold">{rank.nextRank}</strong>
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-[2px] border border-white/5">
          <div className={`h-full rounded-full bg-gradient-to-r ${rank.color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]`} style={{ width: `${rank.progress}%` }}></div>
        </div>
      </div>

      {/* СТАТИСТИКА */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t('profile.stats.posts'), val: stats.totalPosts, icon: <BookOpen size={16} className="text-blue-400" /> },
            { label: t('profile.stats.reputation'), val: stats.reputation, icon: <Award size={16} className="text-amber-400" />, highlight: true },
            { label: t('profile.stats.followers'), val: stats.followersCount, icon: <Users size={16} className="text-emerald-400" /> },
            { label: t('profile.stats.following'), val: stats.followingCount, icon: <User size={16} className="text-purple-400" /> },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0f172a]/30 border border-white/5 p-4 rounded-2xl text-center relative group hover:-translate-y-1.5 hover:border-white/10 hover:bg-[#0f172a]/50 hover:shadow-2xl transition-all duration-300 ease-out shadow-lg">
              <div className="absolute top-3 right-3 opacity-50 group-hover:opacity-100 transition-all group-hover:scale-110 duration-300">{item.icon}</div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest duration-300 group-hover:text-slate-400">{item.label}</p>
              <p className={`text-2xl font-black mt-1 transition-transform duration-300 group-hover:scale-105 ${item.highlight ? 'bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-sm' : 'text-white group-hover:text-blue-400'}`}>{item.val}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#0f172a]/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Activity size={12} className="text-emerald-400" /> {t('profile.activityPulseTitle')}</h4>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{t('profile.activityPulseStatus')}</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 p-1 bg-slate-950/40 rounded-xl border border-white/5">
            {activityDays.map((bgClass, i) => (
              <div key={i} className={`w-full aspect-square rounded-sm transition-all duration-500 hover:scale-125 hover:z-10 cursor-pointer ${bgClass}`} title={t('profile.activityCellTitle')}></div>
            ))}
          </div>
          <div className="text-[9px] text-slate-500 font-mono text-right">{t('profile.activityLegend')}</div>
        </div>
      </div>

      {/* ТЕХНОЛОГИИ */}
      {displayUser?.skills?.length > 0 && (
        <div className="bg-[#0f172a]/20 border border-white/5 p-5 rounded-2xl space-y-3 relative group">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Code size={14} className="text-cyan-400 animate-pulse" /> {t('profile.techStackTitle')}</h4>
          <div className="flex flex-wrap gap-2">
            {displayUser.skills.map((skill, index) => (
              <span key={index} className="text-xs font-bold bg-[#020617] text-cyan-400 border border-cyan-500/10 px-3 py-1.5 rounded-xl hover:scale-110 hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 cursor-default">#{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* ТАБЫ */}
      <div className="space-y-6">
        <div className="flex border-b border-white/5 gap-6 pl-1">
          <button onClick={() => setActiveTab('posts')} className={`pb-3 text-sm font-black uppercase tracking-wider transition-all relative flex items-center gap-2 ${activeTab === 'posts' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            <BookOpen size={16} /> {t('profile.tabs.myPosts')} ({myPosts.length})
            {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full animate-in fade-in duration-500"></div>}
          </button>
          <button onClick={() => setActiveTab('saved')} className={`pb-3 text-sm font-black uppercase tracking-wider transition-all relative flex items-center gap-2 ${activeTab === 'saved' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            <Bookmark size={16} /> {t('profile.tabs.bookmarks')} ({savedPosts.length})
            {activeTab === 'saved' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full animate-in fade-in duration-500"></div>}
          </button>
        </div>

        {/* ВЫВОД МОИХ ПОСТОВ */}
        {activeTab === 'posts' && (
          myPosts.length > 0 ? (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {myPosts.map(post => (
                <div key={post._id} className="bg-[#0f172a]/20 p-5 rounded-2xl border border-white/5 hover:border-blue-500/20 hover:bg-[#0f172a]/40 shadow-md hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 flex items-center justify-between gap-4 group">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1 text-base">{post.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12}/> {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ru-RU') : t('profile.recent')}</span>
                      <span>•</span>
                      <span className="text-blue-400 font-bold uppercase text-[10px] tracking-wider bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">#{post.category || 'dev'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEditPostModal(post)} className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all active:scale-90" title={t('profile.edit')}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDeletePost(post._id)} className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-90" title={t('profile.delete')}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-[#0f172a]/10 border border-dashed border-white/10 rounded-3xl py-14 px-4 flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-blue-400 animate-bounce duration-1000"><PlusCircle size={28} /></div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-300">{t('profile.emptyPosts.title')}</h5>
                <p className="text-slate-500 text-xs max-w-sm">{t('profile.emptyPosts.subtitle')}</p>
              </div>
            </div>
          )
        )}

        {/* ВЫВОД ЗАКЛАДОК */}
        {activeTab === 'saved' && (
          savedPosts.length > 0 ? (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {savedPosts.map((post, index) => {
                const isObject = post && typeof post === 'object';
                const id = isObject ? post._id : post;
                const title = isObject ? post.title : t('profile.loadingPostTitle');
                const authorName = isObject ? (post.author?.username || t('profile.authorFallback')) : 'user';
                const category = isObject ? post.category : 'dev';

                return (
                  <div key={id || index} className="bg-[#0f172a]/20 p-5 rounded-2xl border border-white/5 hover:border-cyan-500/20 hover:bg-[#0f172a]/40 shadow-md transition-all duration-300 flex items-center justify-between gap-4 group">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1 text-base">{title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <User size={12} className="text-slate-600" /> @{authorName}
                        </span>
                        <span>•</span>
                        <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-wider bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">#{category || 'dev'}</span>
                      </div>
                    </div>
                    <button onClick={() => handleToggleSave(id)} className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 text-cyan-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-90 shadow-inner" title={t('profile.removeFromBookmarksTitle')}>
                      <Bookmark size={14} fill="currentColor" className="text-cyan-500 group-hover:hidden" />
                      <X size={14} className="hidden group-hover:block text-rose-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-[#0f172a]/10 border border-dashed border-white/10 rounded-3xl py-14 px-4 flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 text-cyan-400"><Bookmark size={28} /></div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-300">{t('profile.emptyBookmarks.title')}</h5>
                <p className="text-slate-500 text-xs max-w-sm">{t('profile.emptyBookmarks.subtitle')}</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* МОДАЛКА НАСТРОЙКИ ПРОФИЛЯ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-white/10 p-6 md:p-7 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 font-mono"><Edit3 size={16} className="text-cyan-400 animate-pulse" /> {t('profile.editModal.title')}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white" aria-label={t('profile.close')} title={t('profile.close')}><X size={16} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1"><Image size={12} className="text-slate-500" /> {t('profile.editModal.avatarLabel')}</label>
                <input type="text" value={formData.avatar} onChange={(e) => setFormData({ ...formData, avatar: e.target.value })} placeholder={t('profile.editModal.avatarPlaceholder')} className="w-full bg-[#020617] border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-all duration-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{t('profile.editModal.bioLabel')}</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder={t('profile.editModal.bioPlaceholder')} maxLength={160} rows={3} className="w-full bg-[#020617] border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all duration-300 resize-none" />
                <div className="text-[10px] text-right text-slate-600 font-bold">{formData.bio.length}/160</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{t('profile.editModal.skillsLabel')}</label>
                <input type="text" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder={t('profile.editModal.skillsPlaceholder')} className="w-full bg-[#020617] border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-all duration-300" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{t('profile.editModal.locationLabel')}</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder={t('profile.editModal.locationPlaceholder')} className="w-full bg-[#020617] border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-all duration-300" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{t('profile.editModal.websiteLabel')}</label>
                  <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder={t('profile.editModal.websitePlaceholder')} className="w-full bg-[#020617] border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-all duration-300" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{t('profile.editModal.githubLabel')}</label>
                <input type="text" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} placeholder={t('profile.editModal.githubPlaceholder')} className="w-full bg-[#020617] border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-all duration-300" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white">{t('profile.cancel')}</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">{t('profile.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ПОЛНОСТЬЮ ВОССТАНОВЛЕННАЯ МОДАЛКА РЕДАКТИРОВАНИЯ ПОСТА */}
      {isEditPostModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-white/10 p-6 md:p-7 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 font-mono"><Edit3 size={16} className="text-blue-400 animate-pulse" /> {t('profile.editPostModal.title')}</h3>
              <button onClick={() => setIsEditPostModalOpen(false)} className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white" aria-label={t('profile.close')} title={t('profile.close')}><X size={16} /></button>
            </div>
            <form onSubmit={handlePostEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{t('profile.editPostModal.titleLabel')}</label>
                <input 
                  type="text" 
                  value={postEditData.title} 
                  onChange={(e) => setPostEditData({...postEditData, title: e.target.value})} 
                  className="w-full bg-[#020617] border border-white/5 focus:border-blue-500/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-all duration-300" 
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{t('profile.editPostModal.categoryLabel')}</label>
                <select 
                  value={postEditData.category} 
                  onChange={(e) => setPostEditData({...postEditData, category: e.target.value})} 
                  className="w-full bg-[#020617] border border-white/5 focus:border-blue-500/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-all duration-300 font-mono"
                >
                  <option value="dev">dev</option>
                  <option value="design">design</option>
                  <option value="marketing">marketing</option>
                  <option value="ideas">ideas</option>
                </select>
              </div>

              {/* ДОПИСАННАЯ ЧАСТЬ */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{t('profile.editPostModal.contentLabel')}</label>
                <textarea 
                  value={postEditData.content} 
                  onChange={(e) => setPostEditData({...postEditData, content: e.target.value})} 
                  className="w-full bg-[#020617] border border-white/5 focus:border-blue-500/40 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all duration-300 resize-none h-32" 
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsEditPostModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white">{t('profile.cancel')}</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">{t('profile.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;