import React, { useEffect, useRef, useState } from 'react';
import * as PlyrModule from 'plyr-react';
const Plyr = PlyrModule.default || Object.values(PlyrModule)[0];
import 'plyr-react/plyr.css';
import { GlassIcon } from '../common/GlassIcon';

// Custom CSS for Plyr to match our branding
const plyrStyles = {
  '--plyr-color-main': '#8b0000',
  '--plyr-video-controls-background': 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9))',
  '--plyr-menu-color': '#fff',
  '--plyr-menu-background': 'rgba(23, 23, 23, 0.95)',
  '--plyr-menu-border-color': 'rgba(255,255,255,0.1)',
  '--plyr-menu-arrow-color': '#fff',
  '--plyr-menu-item-arrow-color': '#fff',
  '--plyr-tooltip-color': '#fff',
  '--plyr-tooltip-background': 'rgba(23, 23, 23, 0.95)',
  '--plyr-tooltip-border-color': 'rgba(255,255,255,0.1)',
};

export const LecturePlayer = ({ lecture, userEnrolledCourses = [] }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    // Check if user has access
    const access = lecture.is_free || userEnrolledCourses.includes(lecture.course_id);
    setHasAccess(access);
  }, [lecture, userEnrolledCourses]);

  // Extract YouTube ID from various URL formats
  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = extractYouTubeId(lecture?.youtube_url || '');

  // Plyr sources for YouTube
  const plyrSources = [
    {
      src: youtubeId,
      provider: 'youtube',
    },
  ];

  // Plyr options with RTL support for controls
  const plyrOptions = {
    controls: [
      'play-large',
      'play',
      'rewind',
      'fast-forward',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'settings',
      'fullscreen',
    ],
    settings: ['quality', 'speed'],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
    i18n: {
      rewind: 'رجوع ١٠ ثواني',
      fastForward: 'تقديم ١٠ ثواني',
      play: 'تشغيل',
      pause: 'إيقاف',
      volume: 'مستوى الصوت',
      mute: 'كتم الصوت',
      unmute: 'إلغاء كتم الصوت',
      enterFullscreen: 'ملء الشاشة',
      exitFullscreen: 'خروج من ملء الشاشة',
      settings: 'الإعدادات',
      speed: 'السرعة',
      normal: 'عادي',
    },
  };

  const handlePlay = () => {
    setIsPlaying(true);
    // Track view (you can implement this)
    console.log('Lecture started:', lecture.id);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Mark as completed (you can implement this)
    console.log('Lecture completed:', lecture.id);
  };

  const handleSkipForward = () => {
    if (playerRef.current?.plyr) {
      const currentTime = playerRef.current.plyr.currentTime;
      playerRef.current.plyr.currentTime = currentTime + 10;
    }
  };

  const handleSkipBackward = () => {
    if (playerRef.current?.plyr) {
      const currentTime = playerRef.current.plyr.currentTime;
      playerRef.current.plyr.currentTime = currentTime - 10;
    }
  };

  if (!hasAccess) {
    return (
      <div className="glass-panel p-12 text-center">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <GlassIcon name="lock" size={48} className="text-red-500" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white">هذه المحاضرة غير متاحة</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          يجب الاشتراك في الكورس أولاً لمشاهدة هذه المحاضرة
        </p>
        <button className="btn-main px-8 py-3 rounded-xl font-bold mt-6">
          اشترك في الكورس
        </button>
      </div>
    );
  }

  if (!youtubeId) {
    return (
      <div className="glass-panel p-12 text-center">
        <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <GlassIcon name="alert-triangle" size={48} className="text-yellow-500" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white">رابط الفيديو غير صالح</h3>
        <p className="text-slate-400">يرجى التواصل مع الدعم الفني</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={plyrStyles}>
      {/* Video Player */}
      <div className="glass-panel overflow-hidden p-0 relative group">
        <div className="aspect-video w-full bg-black">
          <Plyr
            ref={playerRef}
            source={{
              type: 'video',
              sources: plyrSources,
            }}
            options={plyrOptions}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
          />
        </div>

        {/* Custom Watermark */}
        <div className="absolute bottom-20 right-4 opacity-20 pointer-events-none z-10">
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
            <span className="text-white text-sm">سبيل التفوق</span>
            <span className="text-brand-gold text-lg">♞</span>
          </div>
        </div>

        {/* Custom Controls Overlay */}
        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={handleSkipBackward}
            className="bg-brand-red/80 hover:bg-brand-red text-white p-3 rounded-full shadow-lg transition"
            title="رجوع ١٠ ثواني"
          >
            <GlassIcon name="rotate-ccw" size={20} />
          </button>
          <button
            onClick={handleSkipForward}
            className="bg-brand-red/80 hover:bg-brand-red text-white p-3 rounded-full shadow-lg transition"
            title="تقديم ١٠ ثواني"
          >
            <GlassIcon name="rotate-cw" size={20} />
          </button>
        </div>

        {/* Lecture Info Badge */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
          <div className="flex items-center gap-2">
            <span className="text-brand-gold">♞</span>
            <span className="text-sm font-bold">{lecture.title}</span>
          </div>
        </div>
      </div>

      {/* Lecture Details */}
      <div className="glass-panel p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{lecture.title}</h2>
            <p className="text-slate-400 whitespace-pre-wrap">{lecture.description}</p>
          </div>
          
          {lecture.is_free && (
            <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg flex items-center gap-2">
              <GlassIcon name="gift" size={16} />
              <span className="font-bold">محاضرة مجانية</span>
            </div>
          )}
        </div>

        {/* Lecture Stats */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <GlassIcon name="clock" size={16} />
            <span>المدة: {lecture.duration_minutes || '?'} دقيقة</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <GlassIcon name="calendar" size={16} />
            <span>تاريخ الرفع: {new Date(lecture.created_at).toLocaleDateString('ar-EG')}</span>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>جاري التشغيل</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button className="bg-brand-red hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition">
            <GlassIcon name="download" size={16} />
            تحميل المرفقات
          </button>
          
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition">
            <GlassIcon name="message-circle" size={16} />
            اسأل عن المحاضرة
          </button>
          
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition">
            <GlassIcon name="file-text" size={16} />
            السبورة
          </button>
        </div>
      </div>

      {/* Related Lectures */}
      <div className="glass-panel p-6">
        <h3 className="font-bold mb-4">محاضرات ذات صلة</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red/20 rounded-lg flex items-center justify-center">
                  <GlassIcon name="play" size={16} className="text-brand-red" />
                </div>
                <div>
                  <p className="font-bold text-sm">محاضرة تجريبية {i}</p>
                  <p className="text-xs text-slate-400">٢٠ دقيقة</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};