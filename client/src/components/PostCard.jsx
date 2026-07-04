import React, { useState } from 'react';
import axios from 'axios'; // 🔥 Добавляем для отправки просмотров
import { User, Clock, Flame, MessageSquare, Eye, Share2, Bookmark, Trash2, Check, UserPlus, UserCheck } from 'lucide-react';
import Avatar from '../components/Avatar';
import { useTranslation } from 'react-i18next'; // Подключаем хук перевода
import { getAvatarFallback } from '../utils/avatarHelper';

const PostCard = ({ 
  post, 
  index, 
  user, 
  tagStyles, 
  expandedComments, 
  loadingComments, 
  commentInputs, 
  submittingComment, 
  setCommentInputs,
  handleLike, 
  handleBookmark, 
  toggleComments, 
  handleCommentSubmit, 
  handleDeleteComment,
  handleDeletePost, 
  calculateReadTime,
  handleFollow
}) => {
  const { t, i18n } = useTranslation(); // Инициализируем i18n

  const mainTag = post.tags?.[0] || post.category || 'general';
  const activeTagStyle = tagStyles?.[mainTag] || tagStyles?.general || 'bg-slate-800 text-slate-300';
  
  const currentUserId = user?._id || user?.id;
  const authorId = post.author?._id || post.author?.id;
  const isLikedByUser = post.isLiked || (currentUserId && post.upvotes?.includes(currentUserId));
  
  // ПРОВЕРКА ПОДПИСКИ НА АВТОРА
  const isFollowingAuthor = !!user?.following?.some(fId => {
    if (!fId) return false;
    const followingId = typeof fId === 'object' ? (fId._id || fId.id)?.toString() : fId.toString();
    return followingId === authorId?.toString();
  });

  // РЕАКТИВНАЯ ПРОВЕРКА ЗАКЛАДОК
  const isBookmarkedByUser = typeof post.isBookmarked !== 'undefined' 
    ? post.isBookmarked 
    : !!user?.bookmarks?.some(b => {
        if (!b) return false;
        const bookmarkId = typeof b === 'object' ? (b._id || b.id)?.toString() : b.toString();
        return bookmarkId === post._id?.toString();
      });
  
  const isCommentsOpen = expandedComments[post._id] || false;
  const isCommentsLoading = loadingComments[post._id] || false;

  // Локальные состояния для интерактивного UX
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [likeTrigger, setLikeTrigger] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Кастомный клик по закладке
  const onBookmarkClick = async () => {
    setIsAnimating(true);
    if (handleBookmark) {
      await handleBookmark(post._id);
    }
    setTimeout(() => setIsAnimating(false), 400);
  };

  // Кастомный клик по лайку с микро-анимацией
  const onLikeClick = async () => {
    setLikeTrigger(true);
    if (handleLike) {
      await handleLike(post._id);
    }
    setTimeout(() => setLikeTrigger(false), 300);
  };

  // Хэндлер клика по подписке
  const onFollowClick = async () => {
    if (!handleFollow || followLoading || !authorId) return;
    setFollowLoading(true);
    await handleFollow(authorId);
    setFollowLoading(false);
  };

  // Хэндлер копирования ссылки
  const onShareClick = () => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    setIsCopied(true);
    
    if (typeof toast !== 'undefined') {
      toast.success(t('postCard.toast.shareSuccess'), { id: 'share-toast' });
    }
    
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ВСЕВОЗМОЖНЫЕ ВАРИАНТЫ ИМЕНИ ПОЛЯ АВАТАРКИ ИЗ БАЗЫ ДАННЫХ
  const authorAvatar = post.author?.avatarUrl || post.author?.avatar || post.author?.profilePicture || post.author?.photo;

  return (
    <article 
      style={{ animationDelay: `${index * 80}ms` }}
      className="bg-[#0f172a]/20 p-4 sm:p-6 rounded-3xl border border-white/5 hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:shadow-blue-500/[0.02] transition-all duration-300 relative group animate-in slide-in-from-bottom-6 fade-in duration-500 fill-mode-backwards w-full box-border min-w-0 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.01] to-transparent rounded-tr-3xl pointer-events-none"></div>

      {/* Шапка карточки */}
      <div className="flex items-center justify-between mb-4 relative z-10 gap-2 min-w-0 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar username={post.author?.username} avatarUrl={authorAvatar} size="md" />
          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-200 tracking-wide hover:text-blue-400 cursor-pointer transition-colors truncate max-w-[120px] sm:max-w-[160px]">
                {post.author?.username || t('postCard.authorFallback')}
              </h4>
              <p className="text-[10px] text-slate-500 font-bold font-mono tracking-wide mt-0.5 truncate">
                {post.createdAt 
                  ? new Date(post.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' }) 
                  : t('postCard.dateJustNow')}
              </p>
            </div>

            {/* КНОПКА ПОДПИСКИ */}
            {currentUserId && authorId && currentUserId.toString() !== authorId.toString() && (
              <button
                onClick={onFollowClick}
                disabled={followLoading}
                className={`inline-flex items-center gap-1 text-[10px] font-black tracking-wide px-2.5 py-1 rounded-lg border transition-all duration-200 active:scale-95 self-start sm:self-center shrink-0 ${
                  isFollowingAuthor
                    ? 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/20'
                    : 'bg-blue-600 border-transparent text-white hover:bg-blue-500 shadow-sm shadow-blue-600/10'
                }`}
              >
                {isFollowingAuthor ? (
                  <>
                    <UserCheck size={11} className="shrink-0" />
                    <span className="hidden xs:inline">{t('postCard.buttons.following')}</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={11} className="shrink-0" />
                    <span>{t('postCard.buttons.follow')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-bold font-mono text-slate-400 bg-slate-900/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/5 shadow-inner shrink-0">
          <Clock size={11} className="text-slate-500 animate-pulse shrink-0"/>
          <span className="whitespace-nowrap">
            {calculateReadTime ? calculateReadTime(post.content) : t('postCard.readTimeFallback')}
          </span>
        </div>
      </div>

      {/* Тело карточки */}
      <div className="relative z-10 space-y-2 min-w-0 w-full">
        <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-tight group-hover:text-blue-400 transition-colors duration-300 break-words">
          {post.title}
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium font-sans selection:bg-cyan-500/30 break-words">
          {post.content}
        </p>
      </div>

      {/* Теги */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2 relative z-10 w-full">
          {post.tags.map((t, idx) => (
            <span key={idx} className={`text-[9px] sm:text-[10px] font-black tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl border shadow-sm transition-all capitalize cursor-default whitespace-nowrap ${activeTagStyle}`}>
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Подвал карточки */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-slate-500 relative z-10 gap-2 w-full box-border min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Лайк */}
          <button 
            onClick={onLikeClick}
            className={`flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-black px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all duration-300 active:scale-95 shrink-0 ${
              isLikedByUser 
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)] scale-[1.01]' 
                : 'bg-slate-900/40 border-white/5 hover:border-orange-500/30 hover:text-orange-400 hover:bg-orange-500/[0.02]'
            }`}
          >
            <Flame 
              size={13} 
              fill={isLikedByUser ? "currentColor" : "none"} 
              className={`transition-all duration-300 shrink-0 ${
                likeTrigger ? 'scale-125 rotate-12 text-orange-500' : isLikedByUser ? 'text-orange-400' : 'group-hover:scale-110'
              }`} 
            />
            <span className="font-mono text-[11px] sm:text-xs">{post.upvotes?.length || 0}</span>
          </button>

          {/* Обсуждение */}
          <button 
            onClick={async () => {
              // 1. Переключаем видимость блока комментариев на фронтенде
              toggleComments(post._id);
              
              // 2. Если блок был закрыт и сейчас открывается — накручиваем просмотр
              if (!isCommentsOpen) {
                try {
                  // Шлём запрос на бэкенд, чтобы сработал инкремент { $inc: { views: 1 } }
                  await axios.get(`/posts/${post._id}`);
                  
                  // Сразу реактивно обновляем счётчик на клиенте для мгновенного UX
                  post.views = (post.views || 0) + 1;
                } catch (err) {
                  console.error("Не удалось обновить счётчик просмотров:", err);
                }
              }
            }}
            className={`flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all duration-300 active:scale-95 shrink-0 ${
              isCommentsOpen 
                ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                : 'bg-slate-900/40 border-white/5 hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-500/[0.02]'
            }`}
          >
            <MessageSquare size={13} className={`shrink-0 ${isCommentsOpen ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{t('postCard.buttons.discuss')}</span>
            <span className="text-[9px] sm:text-[10px] bg-slate-950/60 font-mono px-1.5 py-0.5 rounded-md border border-white/5 text-slate-400 group-hover:text-blue-300">
              {post.commentsCount !== undefined ? post.commentsCount : (post.comments?.length || 0)}
            </span>
          </button>
        </div>

        {/* Правый блок действий */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold font-mono text-slate-600 px-1">
            <Eye size={13} className="shrink-0"/>
            <span>{post.views || 0}</span>
          </div>

          {/* КНОПКА ЗАКЛАДОК */}
          <button 
            onClick={onBookmarkClick}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300 active:scale-95 relative overflow-hidden group/bookmark shrink-0 ${
              isBookmarkedByUser 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                : 'bg-slate-900/20 border-transparent hover:border-white/5 hover:text-slate-400'
            }`}
            title={isBookmarkedByUser ? t('postCard.tooltips.removeBookmark') : t('postCard.tooltips.addBookmark')}
          >
            {isAnimating && (
              <span className="absolute inset-0 rounded-xl bg-cyan-500/20 animate-ping pointer-events-none"></span>
            )}
            <Bookmark 
              size={13} 
              fill={isBookmarkedByUser ? "currentColor" : "none"} 
              className={`transition-all duration-300 relative z-10 shrink-0 ${
                isBookmarkedByUser ? 'scale-110 text-cyan-400' : 'group-hover/bookmark:scale-110'
              }`}
            />
          </button>

          {/* КНОПКА ПОДЕЛИТЬСЯ */}
          <button 
            onClick={onShareClick}
            className={`p-2 rounded-xl bg-slate-900/20 border border-transparent hover:border-white/5 transition-all duration-200 active:scale-95 shrink-0 ${
              isCopied ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'hover:text-slate-300'
            }`}
            title={t('postCard.tooltips.share')}
          >
            {isCopied ? <Check size={13} className="animate-in zoom-in duration-200 shrink-0" /> : <Share2 size={13} className="shrink-0" />}
          </button>

          {/* КНОПКА УДАЛЕНИЯ */}
          {handleDeletePost && currentUserId && (post.author?._id === currentUserId || post.author?.id === currentUserId) && (
            <button 
              onClick={
                () => {
                if (window.confirm(t('postCard.confirmDeletePost'))) {
                  handleDeletePost(post._id);
                }
              }}
              className="p-2 rounded-xl bg-slate-900/20 border border-transparent hover:border-rose-500/20 hover:text-rose-400 transition-all duration-200 active:scale-95 shrink-0"
              title={t('postCard.tooltips.deletePost')}
            >
              <Trash2 size={13} className="shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* ПОДГРУЖАЕМЫЙ БЛОК С КОММЕНТАРИЯМИ */}
      {isCommentsOpen && (
        <div className="mt-5 pt-5 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300 ease-out relative z-20 w-full min-w-0">
          <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex gap-2 items-center w-full min-w-0">
            <input 
              type="text"
              placeholder={t('postCard.placeholders.commentInput')}
              value={commentInputs[post._id] || ''}
              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
              disabled={submittingComment[post._id]}
              className="flex-1 min-w-0 bg-[#020617]/90 border border-white/5 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 outline-none focus:border-blue-500/40 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] text-xs text-white placeholder-slate-600 transition-all duration-300 font-medium"
            />
            <button
              type="submit"
              disabled={submittingComment[post._id] || !(commentInputs[post._id]?.trim())}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all active:scale-95 disabled:opacity-20 disabled:pointer-events-none whitespace-nowrap shrink-0"
            >
              {submittingComment[post._id] ? t('postCard.buttons.loading') : t('postCard.buttons.reply')}
            </button>
          </form>

          {/* Скроллбар комментариев */}
          <div 
            style={{ 
              scrollbarWidth: 'thin', 
              scrollbarColor: '#334155 #020617' 
            }}
            className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar w-full min-w-0"
          >
            {isCommentsLoading ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider animate-pulse">{t('postCard.commentsLoading')}</span>
              </div>
            ) : post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, cIdx) => {
                const isCommentAuthor = currentUserId && (comment.author?._id === currentUserId || comment.author?.id === currentUserId || comment.author === currentUserId);
                const isAdmin = user?.role === 'admin';
                const isPostAuthorOfComment = post.author?._id && (comment.author?._id === post.author?._id || comment.author?.id === post.author?.id || comment.author === post.author?._id);

                const commentAvatar = comment.author?.avatarUrl || comment.author?.avatar || comment.author?.profilePicture || comment.author?.photo;

                return (
                  <div 
                    key={comment._id || cIdx} 
                    style={{ animationDelay: `${cIdx * 50}ms` }}
                    className="bg-slate-950/40 border border-white/5 rounded-2xl p-3 sm:p-3.5 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards hover:border-blue-500/10 group/comment transition-all w-full min-w-0 box-border"
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        
                        {/* ⚡ ВЫЗОВ УМНОГО КОМПОНЕНТА АВАТАРОК ДЛЯ КОММЕНТАРИЕВ */}
                        <Avatar 
                          username={comment.author?.username || "User"} 
                          avatarUrl={commentAvatar} 
                          size="sm" 
                          className="!w-5 !h-5 text-[8px] border border-white/10 shadow-sm shrink-0" 
                        />
                        
                        <span className="text-[11px] font-bold text-slate-300 hover:text-blue-400 cursor-pointer transition-colors truncate max-w-[90px] sm:max-w-[150px]">
                          {comment.author?.username || t('postCard.commentAuthorFallback')}
                        </span>

                        {isPostAuthorOfComment && (
                          <span className="text-[7px] sm:text-[8px] font-black tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 py-0.5 rounded-md uppercase font-mono shrink-0">
                            {t('postCard.authorBadge')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wide">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }) : t('postCard.dateJustNow')}
                        </span>
                        
                        {(isCommentAuthor || isAdmin) && (
                          <button 
                            onClick={() => handleDeleteComment(post._id, comment._id)}
                            className="text-slate-600 hover:text-rose-400 sm:opacity-0 group-hover/comment:opacity-100 p-1 rounded-md hover:bg-rose-500/5 transition-all duration-200"
                            title={t('postCard.tooltips.deleteComment')}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-slate-400 text-xs pl-7 font-medium leading-relaxed break-words selection:bg-blue-500/20">
                      {comment.content || comment.text || t('postCard.commentTextNotFound')}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-5 border border-dashed border-white/5 rounded-2xl bg-slate-950/10 text-[11px] font-mono text-slate-600 animate-in fade-in duration-300">
                {t('postCard.noComments')}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;