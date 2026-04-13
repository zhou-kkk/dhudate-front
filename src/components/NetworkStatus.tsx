import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { WifiOff, ServerCrash, RefreshCw } from 'lucide-react';
import './NetworkStatus.css';

const NetworkStatus: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isServerDown, setIsServerDown] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkHealth = useCallback(async () => {
    // 如果物理断网，就没有必要去请求后端了
    if (!navigator.onLine) return;

    try {
      await api.get('/health');
      setIsServerDown(false);
      setRetryCount(0);
    } catch (err) {
      setRetryCount(prev => prev + 1);
      // 如果连续 2 次失败，认为服务器宕机
      if (retryCount >= 1) {
        setIsServerDown(true);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    // 监听本地物理网络状态
    const handleOnline = () => {
      setIsOffline(false);
      checkHealth(); // 刚刚连上网，立刻检查一次健康
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 轮询服务器心跳 (每隔 60 秒)
    const intervalId = setInterval(checkHealth, 60000);
    // 初始检查
    checkHealth();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkHealth]);

  // 如果一切正常，不渲染任何内容
  if (!isOffline && !isServerDown) {
    return null;
  }

  return (
    <div className="network-overlay">
      <div className="network-card">
        {isOffline ? (
          <>
            <WifiOff size={48} className="network-icon error-icon" />
            <h2>网络已断开</h2>
            <p>请检查您的设备网络连接或 Wi-Fi 状态。</p>
          </>
        ) : (
          <>
            <ServerCrash size={48} className="network-icon warning-icon" />
            <h2>服务器维护中</h2>
            <p>我们正在对系统进行升级维护，当前部分功能可能不可用。</p>
          </>
        )}
        <button
          className="network-retry-btn"
          onClick={() => {
            if (!navigator.onLine) {
              // 强制触发一次试图连网检测
              if (navigator.onLine) setIsOffline(false);
            }
            checkHealth();
          }}
        >
          <RefreshCw size={16} /> 重新连接
        </button>
      </div>
    </div>
  );
};

export default NetworkStatus;
