import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
    // У тебя в модели обязательные поля: title (min 10) и content (min 20)
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState(''); // Передадим строкой через запятую, на бэке поправим или разобьем здесь
    const [category, setCategory] = useState('Development');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Валидация на фронте под стать твоей модели
        if (title.trim().length < 10) {
            setError('Заголовок слишком короткий (минимум 10 символов)');
            setLoading(false);
            return;
        }
        if (content.trim().length < 20) {
            setError('Напишите чуть подробнее (минимум 20 символов)');
            setLoading(false);
            return;
        }

        try {
            // Форматируем теги в массив строк, как требует валидатор в схеме Post.js
            const tagsArray = tags
                ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                : ['Development'];

            // Достаем токен, сохраненный при авторизации
            const token = localStorage.getItem('token'); 

            const response = await axios.post(
                'http://localhost:5000/api/v1/posts', // Проверь свой порт бэкенда
                {
                    title,
                    content,
                    tags: tagsArray,
                    category
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.status === 'success') {
                // Очищаем форму
                setTitle('');
                setContent('');
                setTags('');
                setCategory('Development');
                
                // Коллбэк для обновления ленты в реальном времени (передадим из родителя)
                if (onPostCreated) {
                    onPostCreated(response.data.data.post);
                }
            }
        } catch (err) {
            // Вытаскиваем сообщение об ошибке, переданное твоим catchAsync/глобальным обработчиком
            setError(err.response?.data?.message || 'Что-то пошло не так при публикации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl max-w-2xl mx-auto my-4 shadow-lg border border-slate-800">
            <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <span>+</span> Поток мыслей
            </h3>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Заголовок */}
                <div>
                    <input
                        type="text"
                        placeholder="Заголовок... (минимум 10 символов)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        required
                    />
                </div>

                {/* Категория и Теги в одну линию */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="Development">Development</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Other">Other</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Теги (через запятую: node, react)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Контент поста */}
                <div>
                    <textarea
                        placeholder="Что произошло?.. (минимум 20 символов)"
                        rows="5"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        required
                    ></textarea>
                </div>

                {/* Кнопка отправки */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Публикация...' : 'Опубликовать'}
                </button>
            </form>
        </div>
    );
};

export default CreatePost;