import React, { useEffect, useState } from 'react';
import { Panel, Flex, Typography, Container, Input, Button } from '@maxhub/max-ui';

interface ProfileData {
  id: number;
  name: string;
  role: string;
  university_id?: number | null;
  achievements?: string | null;
  progress: number;
  university?: {
    id: number;
    name: string;
    points: number;
  } | null;
}

const Profile: React.FC = () => {
  const userId = 1;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editName, setEditName] = useState('');
  const [editAch, setEditAch] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/profile/${userId}`);
      if (resp.ok) {
        const data = await resp.json();
        setProfile(data);
        setEditName(data.name || '');
        setEditAch(data.achievements || '');
        setEditProgress(data.progress);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        name: editName,
        achievements: editAch,
        progress: editProgress,
      };
      const resp = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        const data = await resp.json();
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading || !profile) {
    return (
      <Panel mode="secondary" className="profile-panel">
        <Typography.Title style={{ padding: '8px 16px' }}>Профиль</Typography.Title>
        <Typography.Text style={{ padding: '16px' }}>Загрузка...</Typography.Text>
      </Panel>
    );
  }

  return (
    <Panel mode="secondary" className="profile-panel">
      <Typography.Title style={{ padding: '8px 16px' }}>Профиль</Typography.Title>
      <Container style={{ padding: '8px 16px' }}>
        <Typography.Subtitle>Имя</Typography.Subtitle>
        <Input value={editName} onChange={(e: any) => setEditName(e.target.value)} />

        <Typography.Subtitle style={{ marginTop: '8px' }}>Достижения</Typography.Subtitle>
        <Input value={editAch} onChange={(e: any) => setEditAch(e.target.value)} />

        <Typography.Subtitle style={{ marginTop: '8px' }}>Прогресс (0-100)</Typography.Subtitle>
        <Input
          type="number"
          value={editProgress}
          onChange={(e: any) => setEditProgress(Number(e.target.value))}
        />

        <Button mode="primary" size="m" style={{ marginTop: '12px' }} onClick={handleSave}>
          Сохранить
        </Button>
      </Container>
      {profile.university && (
        <Container style={{ padding: '8px 16px' }}>
          <Typography.Subtitle>Университет</Typography.Subtitle>
          <Typography.Text>{profile.university.name}</Typography.Text>
          <Typography.Caption>Очки: {profile.university.points}</Typography.Caption>
        </Container>
      )}
    </Panel>
  );
};

export default Profile;