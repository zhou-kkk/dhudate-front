import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, showBack }) => {
  const navigate = useNavigate();

  return (
    <div className="auth-wrapper">
      <div className="bg-aurora">
        <div className="orb orb-1" />
        <div className="orb orb-3" />
      </div>

      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Card glass className="auth-card">
          {showBack && (
            <button className="auth-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="auth-header">
            <h1 className="auth-title gradient-text">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
          {children}
        </Card>
      </motion.div>
    </div>
  );
};
