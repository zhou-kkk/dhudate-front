import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { adminApi } from '../../services/adminApi';
import type { AdminStatsResponse, AdminUserListItem } from '../../services/adminApi';
import { ShieldAlert, Users, HeartHandshake, Database, ChevronLeft, ChevronRight, Zap, RefreshCw, Mail, UserPlus } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const size = 15;

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isNudgingIncomplete, setIsNudgingIncomplete] = useState(false);
  const [isNudgingUnjoined, setIsNudgingUnjoined] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await adminApi.getStats();
      setStats(res);
    } catch (err: any) {
      error('无法获取核心大盘数据: ' + err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async (p: number) => {
    setLoadingUsers(true);
    try {
      const res = await adminApi.getUsers(p, size);
      setUsers(res.list);
      setTotalUsers(res.total);
    } catch (err: any) {
      error('无法获取花名册: ' + err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSimulateMatch = async () => {
    if (!stats?.current_round) return;
    setIsSimulating(true);
    try {
      const res = await adminApi.simulateMatchRound();
      
      // 构建匹配成功用户对的展示字符串
      let matchesStr = '';
      if (res.matches && res.matches.length > 0) {
        matchesStr = `\n\n【成功匹配的用户对 (${res.matches.length}对)】\n` + 
          res.matches.map((m, i) => {
            const nameA = m.user_a.nickname || '无名氏';
            const nameB = m.user_b.nickname || '无名氏';
            return `${i + 1}. ${nameA} (${m.user_a.email}) ↔ ${nameB} (${m.user_b.email})  分数: ${m.score}`;
          }).join('\n');
      } else {
        matchesStr = '\n\n暂无成功匹配的用户对。';
      }

      window.alert(
        `【模拟匹配测算完成】\n` +
        `参与人数: ${res.total_participants} 人\n` +
        `产出对数: ${res.matched_pairs} 对\n` +
        `成双率(参与度): ${(res.success_rate * 100).toFixed(1)}%\n` +
        `总体均分: ${res.avg_score} 分\n` +
        `耗时: ${res.time_cost_ms} 毫秒` +
        matchesStr
      );
    } catch (err: any) {
      error('模拟匹配失败: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleTriggerMatch = async () => {
    if (!stats?.current_round) {
      error('当前没有进行中的匹配轮次');
      return;
    }
    const confirmMsg = `警告：您将不顾日程表的约定，强行针对第 ${stats.current_round.round_number} 期轮次立刻触发全量契合度运算！参与人数: ${stats.current_round.participants} 人。\n并且结对成功后将立刻发送邮件给所有参与者。\n\n您确定要继续吗？`;
    
    if (!window.confirm(confirmMsg)) return;

    setIsTriggering(true);
    try {
      await adminApi.triggerMatchRound();
      success('已完成匹配引擎的强制跑批作业！');
      fetchStats();
    } catch (err: any) {
      error('触发失败: ' + err.message);
    } finally {
      setIsTriggering(false);
    }
  };

  // 催告未完善信息的用户
  const handleNudgeIncomplete = async () => {
    const confirmMsg = '将向所有未完善个人资料或未完成问卷的已验证用户发送催告邮件。\n\n确定发送吗？';
    if (!window.confirm(confirmMsg)) return;

    setIsNudgingIncomplete(true);
    try {
      const res = await adminApi.nudgeIncomplete();
      if (res.total_targets === 0) {
        success('所有用户都已完善信息，无需催告 🎉');
      } else {
        success(`催告邮件任务已提交！目标 ${res.total_targets} 人，正在后台发送...`);
      }
    } catch (err: any) {
      error('催告发送失败: ' + err.message);
    } finally {
      setIsNudgingIncomplete(false);
    }
  };

  // 催参未报名匹配的用户
  const handleNudgeUnjoined = async () => {
    if (!stats?.current_round) {
      error('当前没有进行中的匹配轮次');
      return;
    }
    const confirmMsg = `将向所有已完善信息但未报名第 ${stats.current_round.round_number} 期匹配的用户发送催参邮件。\n\n确定发送吗？`;
    if (!window.confirm(confirmMsg)) return;

    setIsNudgingUnjoined(true);
    try {
      const res = await adminApi.nudgeUnjoined();
      if (res.total_targets === 0) {
        success('所有符合条件的用户都已报名，无需催参 🎉');
      } else {
        success(`催参邮件任务已提交！目标 ${res.total_targets} 人，正在后台发送...`);
      }
    } catch (err: any) {
      error('催参发送失败: ' + err.message);
    } finally {
      setIsNudgingUnjoined(false);
    }
  };

  const totalPages = Math.ceil(totalUsers / size) || 1;

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-brand">
          <ShieldAlert className="admin-icon" size={24} />
          <span>配朵花超管中枢</span>
        </div>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>返回普通面板</Button>
      </header>

      <main className="admin-main">
        {/* 指挥官仪表盘 */}
        <section className="admin-section">
          <div className="section-title">
             <h2>实时大盘</h2>
             <button className="refresh-btn" onClick={fetchStats}><RefreshCw size={14} /> 刷新</button>
          </div>
          {loadingStats ? (
             <div className="admin-loading">拉取军机处数据中...</div>
          ) : stats ? (
            <div className="stats-grid">
              <Card glass className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-num">{stats.registered_users}</div>
                <div className="stat-label">总注册邮箱</div>
                <div className="stat-sub">已激活: {stats.verified_users}</div>
              </Card>
              <Card glass className="stat-card">
                <Database className="stat-icon" />
                <div className="stat-num">{stats.completed_surveys}</div>
                <div className="stat-label">完成问卷的人数</div>
                <div className="stat-sub">匹配引擎基础</div>
              </Card>
              <Card glass className="stat-card">
                <HeartHandshake className="stat-icon" />
                <div className="stat-num">{stats.total_matches}</div>
                <div className="stat-label">引擎产出羁绊</div>
                <div className="stat-sub">双向成功: {stats.successful_matches} 对</div>
              </Card>
              
              <Card glass className="stat-card action-card">
                 {stats.current_round ? (
                    <>
                      <div className="stat-label">进行中轮次: 第 {stats.current_round.round_number} 期</div>
                      <div className="stat-num">{stats.current_round.participants} 人</div>
                      <div className="stat-sub">等待发车 / 状态: {stats.current_round.status}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: 12 }}>
                        <Button 
                           size="sm" 
                           variant="outline" 
                           onClick={handleSimulateMatch} 
                           isLoading={isSimulating}
                           style={{ flex: 1 }}
                        >
                          纯净模拟测算
                        </Button>
                        <Button 
                          size="sm" 
                          variant="primary" 
                          onClick={handleTriggerMatch} 
                          isLoading={isTriggering}
                          style={{ flex: 1 }}
                        >
                          <Zap size={14} style={{marginRight: 6}} /> 强制一键匹配
                        </Button>
                      </div>
                    </>
                 ) : (
                    <>
                      <div className="stat-label">轮次状态</div>
                      <div className="stat-num">-</div>
                      <div className="stat-sub">当前无任何开放的盲盒抽选</div>
                    </>
                 )}
              </Card>
            </div>
          ) : null}
        </section>

        {/* 催告操作区 */}
        <section className="admin-section">
          <div className="section-title">
            <h2>群发催告</h2>
          </div>
          <div className="nudge-grid">
            <Card glass className="nudge-card">
              <div className="nudge-info">
                <Mail size={20} className="nudge-icon" />
                <div>
                  <div className="nudge-title">📝 催完善信息</div>
                  <div className="nudge-desc">向未填写资料或未完成问卷的已验证用户发送提醒邮件</div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleNudgeIncomplete} 
                isLoading={isNudgingIncomplete}
              >
                发送催告
              </Button>
            </Card>
            <Card glass className="nudge-card">
              <div className="nudge-info">
                <UserPlus size={20} className="nudge-icon" />
                <div>
                  <div className="nudge-title">🎯 催参加匹配</div>
                  <div className="nudge-desc">向已完善信息但未报名当前轮次的用户发送催参邮件</div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleNudgeUnjoined} 
                isLoading={isNudgingUnjoined}
                disabled={!stats?.current_round}
              >
                发送催参
              </Button>
            </Card>
          </div>
        </section>

        {/* 众生相查阅 */}
        <section className="admin-section">
          <div className="section-title">
             <h2>学生花名册</h2>
             <span className="total-badge">共 {totalUsers} 人</span>
          </div>

          <Card glass className="table-card">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>用户邮箱</th>
                    <th>身份验证</th>
                    <th>角色</th>
                    <th>档案完整性</th>
                    <th>注册时间</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr><td colSpan={5} className="admin-loading">读取花名册中...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={5} className="admin-loading">暂无用户数据</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id}>
                        <td className="col-email">{u.email}</td>
                        <td>{u.email_verified ? <span className="tag green">已激活</span> : <span className="tag red">未验证</span>}</td>
                        <td>{u.role === 'admin' ? <span className="tag purple">管理</span> : <span className="tag blue">群演</span>}</td>
                        <td>
                          {u.has_profile ? <span className="tag icon-tag green" title="已填写资料">✓ Profile</span> : <span className="tag icon-tag red">✗ Profile</span>}
                          {u.has_survey ? <span className="tag icon-tag green" title="已完成问卷">✓ Survey</span> : <span className="tag icon-tag red">✗ Survey</span>}
                        </td>
                        <td className="col-date">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="pagination">
               <button 
                 disabled={page <= 1} 
                 onClick={() => setPage(p => p - 1)}
               >
                 <ChevronLeft size={16}/> 上一页
               </button>
               <span className="page-info">第 {page} / {totalPages} 页</span>
               <button 
                 disabled={page >= totalPages} 
                 onClick={() => setPage(p => p + 1)}
               >
                 下一页 <ChevronRight size={16}/>
               </button>
            </div>
          </Card>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;
