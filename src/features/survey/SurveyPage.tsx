import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { surveyService } from '../../services/survey';
import type { Question } from '../../services/survey';
import { useSurveyStore } from '../../stores/surveyStore';
import './Survey.css';

const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, success, error } = useToast();
  
  const localAnswers = useSurveyStore(state => state.localAnswers);
  const setAnswer = useSurveyStore(state => state.setAnswer);
  const loadFromServer = useSurveyStore(state => state.loadFromServerAnswers);
  const clearLocalAnswers = useSurveyStore(state => state.clearLocalAnswers);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        // 并行加载题目和用户历史答案
        const [qs, ans] = await Promise.all([
          surveyService.getQuestions(),
          surveyService.getMyAnswers()
        ]);
        
        // 排序并存盘
        const sortedQs = qs.sort((a, b) => a.order - b.order);
        setQuestions(sortedQs);
        loadFromServer(ans);

        // 如果用户有历史提交或是本地答案，自动跳转到第一道没答的题
        const storedAns = useSurveyStore.getState().localAnswers;
        let firstUnanswered = 0;
        for (let i = 0; i < sortedQs.length; i++) {
          if (!storedAns[sortedQs[i].id]) {
            firstUnanswered = i;
            break;
          }
        }
        setCurrentIndex(firstUnanswered);

      } catch (err: any) {
        error(err.message || '加载问卷失败');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [loadFromServer, error]);

  const currentQ = questions[currentIndex];
  // 解析选项
  const options: string[] = useMemo(() => {
    if (!currentQ || !currentQ.options) return [];
    try {
      return JSON.parse(currentQ.options);
    } catch {
      return [];
    }
  }, [currentQ]);

  const currentVal = currentQ ? localAnswers[currentQ.id] || '' : '';

  const handleSelect = (val: string) => {
    if (!currentQ) return;
    setAnswer(currentQ.id, val);
    
    // 如果是最后一题不会自动下一题，否则延迟 300ms 自动下一题
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    // 检查是否有未答题
    const unanswered = questions.findIndex(q => !localAnswers[q.id]);
    if (unanswered !== -1) {
      setCurrentIndex(unanswered);
      error(`第 ${unanswered + 1} 题似乎还没答完哦`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.entries(localAnswers).map(([qId, ans]) => ({
        question_id: qId,
        answer: ans
      }));
      await surveyService.submitAnswers(payload);
      success('问卷填写完成！正在为您重新计算匹配维度...');
      clearLocalAnswers();
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      error(err.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    // 中途暂存退出
    setSubmitting(true);
    try {
      const payload = Object.entries(localAnswers)
        .filter(([_, ans]) => Boolean(ans))
        .map(([qId, ans]) => ({
          question_id: qId,
          answer: ans
        }));
      if (payload.length > 0) {
        await surveyService.submitAnswers(payload);
      }
      toast({ type: 'info', message: '当前进度已为您保存', duration: 3000 });
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="survey-wrapper loading">
        <Loader2 className="spinner" size={40} />
        <p>正在为您展开内心测试...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="survey-wrapper error">
        <Card glass>尚未配置题库，请联系管理员。</Card>
      </div>
    );
  }

  const progressPercent = ((currentIndex + (currentVal ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="survey-wrapper">
      <div className="survey-header">
        <button className="back-btn" onClick={handleSaveAndExit}>
          <Save size={18} /> 保存并退出
        </button>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="progress-text">{Math.min(currentIndex + 1, questions.length)} / {questions.length}</div>
      </div>

      <div className="survey-content">
        <AnimatePresence mode="wait">
          {currentIndex < questions.length ? (
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="question-card-wrapper"
            >
              <Card glass className="question-card">
                <h2 className="question-text">{currentIndex + 1}. {currentQ.text}</h2>
                <div className="question-category">维度: {
                  currentQ.category === 'core_values' ? '核心价值观' :
                  currentQ.category === 'lifestyle' ? '生活方式' :
                  currentQ.category === 'emotional_style' ? '情绪模式' : '其他'
                }</div>

                <div className={`options-container type-${currentQ.type}`}>
                  {currentQ.type === 'likert_scale' ? (
                    <div className="likert-group">
                      <div className="likert-labels">
                        <span>{options[0] || '非常不同意'}</span>
                        <span>{options[options.length - 1] || '非常同意'}</span>
                      </div>
                      <div className="likert-buttons">
                        {options.map((opt, i) => (
                          <button 
                            key={i}
                            className={`likert-btn ${currentVal === opt ? 'selected' : ''}`}
                            onClick={() => handleSelect(opt)}
                          >
                            <div className="likert-circle" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="choice-group">
                      {options.map((opt, i) => (
                        <button
                          key={i}
                          className={`choice-btn ${currentVal === opt ? 'selected' : ''}`}
                          onClick={() => handleSelect(opt)}
                        >
                          <span className="choice-indicator" />
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <div className="survey-controls">
                <Button 
                  variant="ghost" 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                >
                  <ArrowLeft size={16} style={{marginRight: 8}}/> 上一题
                </Button>

                {currentIndex === questions.length - 1 ? (
                  <Button 
                    variant="primary" 
                    onClick={handleSubmit} 
                    disabled={!currentVal || submitting}
                    isLoading={submitting}
                  >
                    完成提交 <CheckCircle2 size={16} style={{marginLeft: 8}}/>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    disabled={!currentVal}
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                  >
                    下一题 <ArrowRight size={16} style={{marginLeft: 8}}/>
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="finish"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="question-card-wrapper finish-wrapper"
            >
               <Card glass className="finish-card">
                  <div className="finish-icon"><CheckCircle2 size={64}/></div>
                  <h2>所有题目已答完</h2>
                  <p>感谢您的耐心填报，点击下方按钮建立您的灵魂画像以匹配对象。</p>
                  <Button 
                    size="lg" 
                    onClick={handleSubmit} 
                    isLoading={submitting}
                    className="mt-4"
                  >
                    提交问卷并开启匹配
                  </Button>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SurveyPage;
