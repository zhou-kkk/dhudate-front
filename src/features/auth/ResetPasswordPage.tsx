import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';

const ResetPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const { success, error, toast } = useToast();

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
      error('仅支持东华大学校园邮箱');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      // 防枚举设计：如果成功返回，统一提示已发送
      toast({ type: 'info', message: '如果该邮箱已注册，验证码将发送至您的邮箱', duration: 4000 });
      setStep(2);
      startCountdown();
    } catch (err: any) {
      error(err.message || '发送失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) return;

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, new_password: newPassword });
      success('密码重置成功，请使用新密码登录');
      navigate('/login', { replace: true });
    } catch (err: any) {
      error(err.message || '重置失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="重置密码" 
      subtitle={step === 1 ? "输入您注册时使用的校园邮箱" : `验证码已发送至 ${email}`}
      showBack={true}
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
            获取重置验证码 <ArrowRight size={18} style={{marginLeft: 8}} />
          </Button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleResetPassword}>
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
            placeholder="新密码 (不少于8位)"
            icon={<Lock size={18} />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Button type="submit" disabled={!code || !newPassword || code.length !== 6 || newPassword.length < 8} isLoading={isLoading}>
            重置密码
          </Button>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
             <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
               返回修改邮箱
             </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
