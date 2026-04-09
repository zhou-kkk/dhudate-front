import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchApi } from '../../services/matchApi';
import type { MatchResultBrief, MatchDetailResponse } from '../../services/matchApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft, Loader2, Sparkles, HeartHandshake, XCircle } from 'lucide-react';
import './MatchResult.css';

const MatchResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [loadingList, setLoadingList] = useState(true);
  const [list, setList] = useState<MatchResultBrief[]>([]);
  
  // detail mode
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MatchDetailResponse | null>(null);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoadingList(true);
    try {
      const res = await matchApi.getResults();
      setList(res);
    } catch {
      error('拉取匹配历史失败');
    } finally {
      setLoadingList(false);
    }
  };

  const loadDetail = async (id: string) => {
    setActiveId(id);
    try {
      const res = await matchApi.getDetail(id);
      setDetail(res);
    } catch {
      error('拉取匹配详情失败');
      setActiveId(null);
    }
  };

  const handleAction = async (type: 'accept' | 'reject') => {
    if (!activeId) return;
    setActioning(true);
    try {
      if (type === 'accept') {
        await matchApi.accept(activeId);
        success('已发送心动信号，等待对方回应！');
      } else {
        await matchApi.reject(activeId);
        success('已委婉拒绝，希望下次能遇到更好的缘分。');
      }
      // reload detail
      const res = await matchApi.getDetail(activeId);
      setDetail(res);
      // reload list in background
      matchApi.getResults().then(setList);
    } catch(err: any) {
      error(err.message || '操作失败');
    } finally {
      setActioning(false);
    }
  };

  if (activeId && detail) {
    // Detail View
    const { peer, score, dimensions, my_status, peer_status, reason, round_number } = detail;
    const isBothAccepted = my_status === 'accepted' && peer_status === 'accepted';
    const isRejected = my_status === 'rejected' || peer_status === 'rejected';

    return (
      <div className="match-wrapper">
        <div className="match-header">
          <button className="back-btn" onClick={() => { setActiveId(null); setDetail(null); }}>
             <ArrowLeft size={18} /> 返回列表
          </button>
        </div>

        <main className="match-main">
          <Card glass className="match-detail-card">
            <div className="score-header">
              <h2>第 {round_number} 期匹配结果</h2>
              <div className={`score-circle ${isBothAccepted ? 'glow' : ''}`}>
                <div className="score-value">{Math.round(score)}%</div>
                <div className="score-label">总契合度</div>
              </div>
            </div>

            <div className="peer-info">
              <h3>遇见：{peer.nickname} <span>({peer.gender === 'male' ? '男生' : peer.gender === 'female' ? '女生' : 'Ta'})</span></h3>
              <p className="peer-grade">{peer.grade}</p>
              
              {isBothAccepted ? (
                <div className="unlocked-info">
                  <div className="unlock-badge"><Sparkles size={16}/> 双方已双向奔赴，资料全面解锁</div>
                  <p><strong>学院:</strong> {peer.college}</p>
                  <p><strong>MBTI:</strong> {peer.mbti}</p>
                  <p><strong>Ta 的破冰寄语:</strong> {peer.bio}</p>
                </div>
              ) : (
                <div className="locked-info">
                  <p>对方的学院与自白被隐藏了。当你们双向奔赴，方可揭晓真正的灵魂盲盒。</p>
                </div>
              )}
            </div>

            <div className="dimension-box">
              <h4>契合细节解析</h4>
              {Object.entries(dimensions || {}).map(([dim, val]) => (
                <div className="dim-row" key={dim}>
                  <div className="dim-label">{
                     dim === 'core_values' ? '核心价值观' :
                     dim === 'lifestyle' ? '生活方式' :
                     dim === 'emotional_style' ? '情绪模式' : dim
                  }</div>
                  <div className="dim-bar-bg">
                    <div className="dim-bar-fill" style={{ width: `${val}%` }} />
                  </div>
                  <div className="dim-val">{Math.round(val)}</div>
                </div>
              ))}
              <div className="match-reason">
                <strong>匹配之光：</strong> {reason}
              </div>
            </div>

            <div className="match-actions-area">
              {my_status === 'pending' && !isRejected && (
                <>
                  <Button variant="outline" onClick={() => handleAction('reject')} isLoading={actioning}>
                    <XCircle size={16} style={{marginRight: 8}}/> 婉拒
                  </Button>
                  <Button variant="primary" onClick={() => handleAction('accept')} isLoading={actioning}>
                    <HeartHandshake size={16} style={{marginRight: 8}}/> 接受匹配
                  </Button>
                </>
              )}
              {my_status === 'accepted' && peer_status === 'pending' && (
                <div className="status-tip">您已接受，正在等待对方回应... 🍵</div>
              )}
              {isBothAccepted && (
                <div className="status-tip success-tip">恭喜！你们已达成双向奔赴！快通过校内邮箱联系对方吧。</div>
              )}
              {isRejected && (
                <div className="status-tip error-tip">本次缘分已擦肩而过。</div>
              )}
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // List View
  return (
    <div className="match-wrapper">
      <div className="match-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
           <ArrowLeft size={18} /> 返回主页
        </button>
        <span className="header-title">缘分盲盒记录</span>
      </div>

      <main className="match-main list-main">
        {loadingList ? (
          <div className="center-tip"><Loader2 className="spinner" size={32} /></div>
        ) : list.length === 0 ? (
          <Card glass className="empty-card">
             <div className="center-tip">您尚未参与过匹配，或匹配结果尚未揭晓。</div>
          </Card>
        ) : (
          <div className="match-list">
            {list.map(item => (
              <Card glass className="match-item" key={item.id} onClick={() => loadDetail(item.id)}>
                <div className="item-left">
                  <div className="item-round">第 {item.round_number} 期匹配</div>
                  <div className="item-date">{new Date(item.created_at).toLocaleDateString()}</div>
                </div>
                <div className="item-right">
                  <div className="item-score">{Math.round(item.score)}%</div>
                  {item.status === 'pending' && <span className="badge pending">待处理</span>}
                  {item.status === 'accepted' && <span className="badge accepted">已接受</span>}
                  {item.status === 'rejected' && <span className="badge rejected">已拒绝</span>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MatchResultPage;
