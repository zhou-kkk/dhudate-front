import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LogOut, User, Clock, Heart, ArrowRight, PenSquare } from 'lucide-react';
import { api } from '../../services/api';
import { surveyService } from '../../services/survey';
import type { SurveyStatus } from '../../services/survey';
import { matchApi } from '../../services/matchApi';
import type { MatchRoundResponse } from '../../services/matchApi';
import { useToast } from '../../components/ui/Toast';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { success, error, toast } = useToast();
  
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus | null>(null);
  const [round, setRound] = useState<MatchRoundResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [s, r] = await Promise.all([
          surveyService.getSurveyStatus(),
          matchApi.getCurrentRound()
        ]);
        setSurveyStatus(s);
        setRound(r);
      } catch (err) {
        console.error('获取状态失败', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(err) {
      console.log('Logout error on server side ignored');
    } finally {
      logout();
      navigate('/');
    }
  };

  const handleToggleJoin = async () => {
    setActionLoading(true);
    try {
      if (round?.has_joined) {
        await matchApi.quitRound();
        setRound(prev => prev ? { ...prev, has_joined: false, total_participants: prev.total_participants - 1 } : null);
        toast({ type: 'info', message: '已取消本次匹配报名', duration: 3000 });
      } else {
        await matchApi.joinRound();
        setRound(prev => prev ? { ...prev, has_joined: true, total_participants: prev.total_participants + 1 } : null);
        success('报名成功！请等待系统结算结果。');
      }
    } catch (err: any) {
      error(err.message || '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const isSurveyCompleted = surveyStatus?.is_completed;
  const isProfileCompleted = !!user?.profile?.nickname; 
  const canJoin = isSurveyCompleted && isProfileCompleted;
  const progressText = surveyStatus ? `${surveyStatus.answered_questions}/${surveyStatus.total_questions}` : '加载中...';

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="nav-brand">
          <span className="nav-brand-text">配朵花</span>
        </div>
        <div className="header-actions">
           <span className="user-email"><User size={16}/> {user?.profile?.nickname || user?.email}</span>
           <button className="logout-btn" onClick={() => navigate('/match/results')} style={{color: 'var(--primary)'}}>
             历史匹配
           </button>
           <button className="logout-btn" onClick={handleLogout}>
             <LogOut size={18} /> 退出
           </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <h1>欢迎回来，准备好迎接新的缘分了吗？</h1>
          <p>完成问卷并报名本周期的匹配，发现属于您的同频共振。</p>
        </div>

        <div className="dashboard-cards">
          {/* 我的资料卡片 */}
          <Card className="dashboard-card status-card">
            <div className="card-header">
              <h3><User className="icon-orange" /> 个人资料与问卷</h3>
              {isLoading ? (
                <span className="status-badge">加载中</span>
              ) : isSurveyCompleted && isProfileCompleted ? (
                <span className="status-badge success">已完善</span>
              ) : (
                <span className="status-badge warning">未完善 ({progressText})</span>
              )}
            </div>
            <p>
              {isSurveyCompleted && isProfileCompleted
                ? "您的档案填报完毕！您可以随时点击下方按钮进行回顾或修改。"
                : "您的基础信息或核心问卷尚未填报完毕。为了保证匹配质量，请优先完成此处填写。"}
            </p>
            <div className="card-footer" style={{ gap: '12px' }}>
              <Button size="sm" variant={isProfileCompleted ? 'outline' : 'primary'} onClick={() => navigate('/profile')}>
                {isProfileCompleted ? '修改资料' : '填写资料'} <PenSquare size={16} style={{marginLeft: 8}}/>
              </Button>
              <Button size="sm" variant={isSurveyCompleted ? 'outline' : 'primary'} onClick={() => navigate('/survey')}>
                {isSurveyCompleted ? '修改问卷' : '继续写问卷'} <ArrowRight size={16} style={{marginLeft: 8}}/>
              </Button>
            </div>
          </Card>

          {/* 匹配池卡片 */}
          <Card className="dashboard-card action-card">
            <div className="card-header">
              <h3><Heart className="icon-red" /> 本周匹配池</h3>
              {round ? (
                <span className="status-badge success">{round.status === 'scheduled' ? '开放报名中' : '匹配计算中'}</span>
              ) : (
                <span className="status-badge">暂无开放轮次</span>
              )}
            </div>
            <h2 className="round-name">第 {round?.round_number || '?'} 期</h2>
            {round && (
              <div className="round-countdown">
                <Clock size={16} /> 即将截止并开始算法匹配
              </div>
            )}
            <p style={{ marginTop: 8 }}>
               目前已有 {round?.total_participants || 0} 位同学加入了匹配。
            </p>
            <div className="card-footer">
              <Button 
                size="sm" 
                variant={round?.has_joined ? 'outline' : 'primary'} 
                disabled={!canJoin || actionLoading || !round || round.status !== 'scheduled'}
                isLoading={actionLoading}
                onClick={handleToggleJoin}
              >
                {!canJoin 
                  ? '报名匹配 (档案未完善)' 
                  : round?.has_joined ? '取消报名' : '立即加入本轮匹配'}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
