import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { userApi } from '../../services/userApi';
import type { ProfileResponse } from '../../services/userApi';
import { useAuthStore } from '../../stores/authStore';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import './Profile.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const updateUser = useAuthStore(state => state.updateUser);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ProfileResponse>>({
    nickname: '',
    gender: 'prefer_not_to_say',
    birth_year: 2005,
    grade: '',
    college: '',
    major: '',
    mbti: '',
    bio: '',
    match_mode: 'romantic',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { profile } = await userApi.getMe();
        if (profile) {
          setFormData(profile);
          // Sync with global store just in case
          updateUser({ profile: { nickname: profile.nickname } });
        }
      } catch (err: any) {
        error('拉取资料失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [error, updateUser]);

  const handleChange = (field: keyof ProfileResponse, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname) {
      error('昵称不能为空');
      return;
    }

    setSaving(true);
    try {
      await userApi.updateProfile(formData);
      updateUser({ profile: { nickname: formData.nickname } });
      success('个人资料已保存');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      error(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
           <ArrowLeft size={18} /> 返回面板
        </button>
      </div>

      <main className="profile-main">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <Loader2 className="spinner" size={40} />
            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>正在拉取档案...</p>
          </div>
        ) : (
          <Card glass className="profile-card">
            <h1 className="profile-title">您的身份档案</h1>
            <p className="profile-subtitle">部分信息需在匹配成功且双方接受后才向对方展示。</p>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <Input
                  label="您的称呼（昵称）"
                  placeholder="展示给匹配对象的称谓"
                  value={formData.nickname}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  required
                />
                
                <div className="dhu-input-wrapper">
                  <label className="dhu-input-label">性别取向</label>
                  <select 
                    className="dhu-select"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="male">男生</option>
                    <option value="female">女生</option>
                    <option value="non_binary">非二元性别</option>
                    <option value="prefer_not_to_say">不愿透露</option>
                  </select>
                </div>

                <Input
                  label="出生年份"
                  type="number"
                  min="1990" max="2010"
                  value={formData.birth_year}
                  onChange={(e) => handleChange('birth_year', parseInt(e.target.value))}
                  required
                />

                <Input
                  label="年级"
                  placeholder="如: 23级本科 / 大二"
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                />

                <Input
                  label="所属学院"
                  placeholder="(对方接受前盲盒状态)"
                  value={formData.college}
                  onChange={(e) => handleChange('college', e.target.value)}
                />

                <Input
                  label="MBTI 人格"
                  placeholder="如: ENFP"
                  maxLength={4}
                  value={formData.mbti}
                  onChange={(e) => handleChange('mbti', e.target.value.toUpperCase())}
                />

                <div className="dhu-input-wrapper" style={{ gridColumn: '1 / -1' }}>
                   <label className="dhu-input-label">匹配模式通道</label>
                   <select 
                     className="dhu-select"
                     value={formData.match_mode}
                     onChange={(e) => handleChange('match_mode', e.target.value)}
                   >
                     <option value="romantic">单身寻爱 (Romantic)</option>
                     <option value="friendship">灵魂共振 (Friendship)</option>
                     <option value="both">皆可随缘 (Both)</option>
                   </select>
                </div>

                <div className="dhu-input-wrapper bio-wrapper" style={{ gridColumn: '1 / -1' }}>
                  <label className="dhu-input-label">一段引人入胜的破冰自我介绍</label>
                  <textarea
                    className="dhu-input dhu-textarea"
                    rows={4}
                    placeholder="嗨，我是..."
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                  />
                </div>
              </div>

              <div className="profile-actions">
                <Button type="submit" isLoading={saving} size="lg">
                  <Save size={18} style={{marginRight: 8}}/> 保存档案并返回
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
