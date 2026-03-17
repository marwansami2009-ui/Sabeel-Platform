import React, { useEffect, useState, useRef } from 'react';
import * as PlyrModule from 'plyr-react';
const Plyr = PlyrModule.default || Object.values(PlyrModule)[0];
import 'plyr-react/plyr.css';
import { GlassIcon } from '../common/GlassIcon';

const finalSecurityStyles = `
  /* رفع طبقة التحكم عشان تكون فوق كل الدروع */
  .plyr--video .plyr__controls { z-index: 200 !important; position: relative; }
  .plyr--full-ui.plyr--video .plyr__control--overlaid { z-index: 150; }
  
  .matte-glass {
    background: rgba(15, 15, 15, 0.85);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-bottom-right-radius: 40px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* زوم لترحيل حواف يوتيوب */
  .plyr__video-wrapper iframe { transform: scale(1.15); pointer-events: none; }
`;

export const LecturePlayer = ({ lecture, userEnrolledCourses = [], isLoading = false }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const checkAccess = Number(lecture.is_free) === 1 || 
                       userEnrolledCourses.some(c => (c.$id === lecture.course_id || c.course_id === lecture.course_id));
    setHasAccess(checkAccess);
  }, [lecture, userEnrolledCourses]);

  const youtubeId = lecture?.youtube_id;

  // وظيفة موحدة للتشغيل والإيقاف من خلال الدرع
  const togglePlay = () => {
    if (playerRef.current?.plyr) {
      const plyr = playerRef.current.plyr;
      if (plyr.paused) {
        plyr.play();
        setIsPlaying(true);
      } else {
        plyr.pause();
        setIsPlaying(false);
      }
    }
  };

  if (isLoading) return <div className="glass-panel p-12 text-center text-white">جاري التحميل...</div>;
  if (!hasAccess) return <div className="glass-panel p-12 text-center text-white font-bold text-xl">يجب الاشتراك لمشاهدة المحاضرة</div>;
  if (!youtubeId) return <div className="glass-panel p-12 text-center text-red-500 font-bold">كود الفيديو مفقود</div>;

  return (
    <div className="space-y-6">
      <style>{finalSecurityStyles}</style>
      
      <div className="glass-panel overflow-hidden p-0 relative group border-2 border-white/5 shadow-2xl bg-black">
        
        {/* الدرع الشفاف الشامل (الآن أصبح تفاعلي) */}
        {/* المربع ده بيستلم الضغطة ويشغل الفيديو أوتوماتيك */}
        <div 
          className="absolute top-0 left-0 w-full h-[88%] z-[100] cursor-pointer bg-transparent"
          onClick={togglePlay}
        ></div>

        {/* 1. كيرف "التفوق" العصري (فوق شمال) */}
        <div className="absolute top-0 left-0 w-36 h-20 matte-glass z-[110] flex items-center justify-center shadow-2xl pointer-events-none">
           <span className="text-white/90 font-black text-xl tracking-tighter">التفوق</span>
        </div>

        {/* 2. درع اللوجو (تحت يمين) */}
        <div className="absolute bottom-12 right-0 w-44 h-14 bg-black z-[110] flex items-center justify-center border-t border-l border-white/10 shadow-2xl pointer-events-none">
           <span className="text-brand-red font-bold text-sm tracking-widest uppercase">سبيل التفوق</span>
        </div>

        {/* 3. زرار الـ Play العملاق (بيظهر لما الفيديو يقف) */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 z-[130] bg-black/80 flex items-center justify-center cursor-pointer transition-all duration-500"
            onClick={togglePlay}
          >
            <div className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(139,0,0,0.7)] hover:scale-110 transition-transform">
              <GlassIcon name="play" size={48} className="text-white ml-2" />
            </div>
          </div>
        )}

        <div className="w-full bg-black relative" style={{ minHeight: '520px' }}>
          <Plyr
            key={youtubeId}
            ref={playerRef}
            source={{
              type: 'video',
              sources: [{ src: youtubeId, provider: 'youtube' }],
            }}
            options={{
              controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
              youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        {/* Badge المحاضرة (فوق يمين) */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-[110] pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              <GlassIcon name="video" size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">{lecture.title}</span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 border-t-4 border-brand-red">
        <h2 className="text-2xl font-bold mb-2 text-white">{lecture.title}</h2>
        <p className="text-slate-400 leading-relaxed">{lecture.description}</p>
      </div>
    </div>
  );
};