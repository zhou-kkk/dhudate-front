import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Heart, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* 极简背景氛围 */}
      <div className="bg-aurora">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-brand-text">配朵花</span>
        </div>
        <div className="nav-actions">
          <Button variant="ghost" onClick={() => navigate('/login')}>登录</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/register')}>加入配朵花</Button>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="hero">
        <motion.div 
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Shield size={16} /> 只面向东华大学在校生
        </motion.div>

        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          遇见真正契合的<br/>
          <span className="gradient-text">灵魂伴侣</span>
        </motion.h1>

        <motion.p 
          className="hero-desc"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          摒弃以貌取人的快餐式交友。通过深度价值观问卷模型，每周为您匹配校园里最懂你的人。
        </motion.p>

        <motion.div 
          className="hero-cta"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            className="cta-main" 
            size="lg" 
            onClick={() => navigate('/register')}
          >
            开启匹配之旅 <ArrowRight size={18} />
          </Button>
          <p className="cta-hint">需要使用 @dhu.edu.cn 邮箱注册</p>
        </motion.div>
      </section>

      {/* 特性介绍 */}
      <section className="features">
        <div className="features-grid">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card glass className="feature-card">
              <div className="feature-icon"><Shield /></div>
              <h3>绝对安全与私密</h3>
              <p>采用东华校园邮箱进行强制实名审核，双盲匹配机制，且数据严格加密，最大程度保护您的交友隐私。</p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Card glass className="feature-card">
              <div className="feature-icon"><Heart /></div>
              <h3>深度价值观碰撞</h3>
              <p>不仅仅看照片，我们设计的 MBTI 与多元感情问卷将帮您筛出心灵契合的那个「对的人」。</p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
            <Card glass className="feature-card">
              <div className="feature-icon"><Clock /></div>
              <h3>慢节拍，高质量</h3>
              <p>拒绝无休止的左滑右滑。每周仅限少量精准推荐，给彼此足够的时间相识、相处与相知。</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 底部版权 */}
      <footer>
        <p>© 2026 DHU Date. All rights reserved.</p>
        <p>此平台由东华大学学生独立开发运营，仅供校内交流使用。</p>
      </footer>
    </div>
  );
};

export default LandingPage;
