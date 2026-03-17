// components/admin/QuizBuilder.jsx - كامل
import React, { useState } from 'react';
import { GlassIcon } from '../common/GlassIcon';
import { createQuiz, createQuizQuestion } from '../../services/appwriteService';

export const QuizBuilder = ({ courseId, onClose }) => {
  const [quiz, setQuiz] = useState({
    title: '',
    duration_minutes: 30,
    show_result: true,
    allow_pause: false,
  });
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a',
  });

  const addQuestion = () => {
    if (!currentQuestion.question_text) {
      alert('الرجاء إدخال نص السؤال');
      return;
    }
    if (!currentQuestion.option_a || !currentQuestion.option_b) {
      alert('الرجاء إدخال خيارين على الأقل');
      return;
    }
    
    setQuestions([...questions, { ...currentQuestion, order_index: questions.length }]);
    setCurrentQuestion({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a',
    });
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    if (!quiz.title) {
      alert('الرجاء إدخال عنوان الامتحان');
      return;
    }
    if (questions.length === 0) {
      alert('الرجاء إضافة سؤال واحد على الأقل');
      return;
    }

    const quizRes = await createQuiz({
      ...quiz,
      course_id: courseId,
    });

    if (quizRes.success) {
      for (const q of questions) {
        await createQuizQuestion({
          ...q,
          quiz_id: quizRes.data.id,
        });
      }
      alert('✅ تم إنشاء الامتحان بنجاح!');
      onClose();
    } else {
      alert('❌ حدث خطأ: ' + quizRes.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel p-8 max-w-4xl w-full my-8">
        <h2 className="text-2xl font-bold mb-6">📝 إنشاء امتحان جديد</h2>

        {/* Quiz Info */}
        <div className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="عنوان الامتحان"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white"
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="المدة (دقيقة)"
              value={quiz.duration_minutes}
              onChange={(e) => setQuiz({ ...quiz, duration_minutes: parseInt(e.target.value) })}
              className="p-4 bg-white/5 border border-white/10 rounded-xl text-white"
            />
            
            <div className="flex items-center gap-4 text-white">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={quiz.show_result} onChange={(e) => setQuiz({ ...quiz, show_result: e.target.checked })} />
                عرض النتيجة
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={quiz.allow_pause} onChange={(e) => setQuiz({ ...quiz, allow_pause: e.target.checked })} />
                إيقاف مؤقت
              </label>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">الأسئلة المضافة ({questions.length})</h3>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 relative">
                  <button
                    onClick={() => removeQuestion(idx)}
                    className="absolute top-2 left-2 text-red-400 hover:text-red-300"
                  >
                    <GlassIcon name="x" size={16} />
                  </button>
                  <p className="font-bold mb-2">{idx + 1}. {q.question_text}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-green-400">A: {q.option_a}</span>
                    <span className="text-blue-400">B: {q.option_b}</span>
                    {q.option_c && <span className="text-yellow-400">C: {q.option_c}</span>}
                    {q.option_d && <span className="text-purple-400">D: {q.option_d}</span>}
                  </div>
                  <span className="text-xs text-emerald-400 mt-2 inline-block">
                    ✓ الإجابة الصحيحة: {q.correct_answer.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Question */}
        <div className="glass-panel p-6">
          <h4 className="font-bold mb-4">➕ إضافة سؤال جديد</h4>
          
          <textarea
            placeholder="نص السؤال"
            value={currentQuestion.question_text}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl mb-4 text-white"
            rows="3"
          />

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {['a', 'b', 'c', 'd'].map(opt => (
              <div key={opt}>
                <label className="block text-sm mb-1 text-slate-300">الاختيار {opt.toUpperCase()}</label>
                <input
                  type="text"
                  value={currentQuestion[`option_${opt}`]}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, [`option_${opt}`]: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  placeholder={`أدخل الاختيار ${opt.toUpperCase()}`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-slate-300">الإجابة الصحيحة:</span>
            {['a', 'b', 'c', 'd'].map(opt => (
              <label key={opt} className="flex items-center gap-1 text-white">
                <input
                  type="radio"
                  name="correct"
                  value={opt}
                  checked={currentQuestion.correct_answer === opt}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
                />
                {opt.toUpperCase()}
              </label>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition"
          >
            <GlassIcon name="plus" size={18} />
            إضافة السؤال
          </button>
        </div>

        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
          >
            إلغاء
          </button>
          <button
            onClick={saveQuiz}
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold transition"
          >
            حفظ الامتحان
          </button>
        </div>
      </div>
    </div>
  );
};