import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { error } = useToast();
  const loginBase = useAuthStore(state => state.loginBase);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/login', { email, password });
      loginBase(res.access_token, res.user);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      error(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="欢迎回来" subtitle="登入您的 配朵花 账号" showBack>
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="校园邮箱 (@dhu.edu.cn)"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="密码"
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' }}>
          <Link to="/reset-password" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            忘记密码？
          </Link>
        </div>

        <Button type="submit" disabled={!email || !password} isLoading={isLoading}>
          登 录
        </Button>
      </form>

      <div className="auth-footer">
        还没有账号？ <Link to="/register">立即注册</Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
