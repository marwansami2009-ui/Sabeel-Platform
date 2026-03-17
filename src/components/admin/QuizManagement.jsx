import React, { useState, useEffect } from 'react';
import { getAllQuizzes } from '../../services/appwriteService';

export const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    const res = await getAllQuizzes();
    if (res.success) setQuizzes(res.data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📝 الامتحانات</h2>
      {loading ? (
        <p>جاري التحميل...</p>
      ) : quizzes.length === 0 ? (
         <p>لا يوجد امتحانات حاليا.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(q => (
            <div key={q.id} className="glass-panel p-4">
              <h3 className="font-bold mb-2">{q.title}</h3>
              <p className="text-sm text-slate-400">المدة: {q.duration_minutes} دقيقة</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
