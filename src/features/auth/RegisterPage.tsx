import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const { success, error } = useToast();
  const loginBase = useAuthStore(state => state.loginBase);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!email.endsWith('@dhu.edu.cn') && !email.endsWith('@mail.dhu.edu.cn')) {
      error('仅支持东华大学校园邮箱注册');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', { email });
      success('验证码已发送，请查收您的校园邮箱');
      setStep(2);
      startCountdown();
    } catch (err: any) {
      error(err.message || '发送失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !password) return;

    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/verify', { email, code, password });
      success('注册成功！');
      loginBase(res.access_token, res.user);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      error(err.message || '验证失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={step === 1 ? "创建账号" : "验证邮箱"} 
      subtitle={step === 1 ? "使用东华大学校园邮箱注册" : `验证码已发送至 ${email}`}
      showBack={step === 1}
    >
      {step === 1 ? (
        <form className="auth-form" onSubmit={handleSendCode}>
          <Input
            type="email"
            placeholder="校园邮箱 (@dhu.edu.cn)"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={!email} isLoading={isLoading}>
            获取验证码 <ArrowRight size={18} style={{marginLeft: 8}} />
          </Button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleVerifyAndSetPassword}>
          <div className="code-inputs">
            <Input
              type="text"
              placeholder="6位验证码"
              maxLength={6}
              icon={<KeyRound size={18} />}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button 
              type="button" 
              variant="outline" 
              disabled={countdown > 0} 
              onClick={handleSendCode}
              style={{ minWidth: '110px' }}
            >
              {countdown > 0 ? `${countdown}s` : '重新发送'}
            </Button>
          </div>
          <Input
            type="password"
            placeholder="设置密码 (不少于8位)"
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Button type="submit" disabled={!code || !password || code.length !== 6 || password.length < 8} isLoading={isLoading}>
            完成注册
          </Button>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
             <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
               更换邮箱
             </Button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="auth-footer">
          已有账号？ <Link to="/login">直接登录</Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
