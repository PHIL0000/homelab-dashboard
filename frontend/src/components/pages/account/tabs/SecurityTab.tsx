import { useState } from 'react';
import { Button, Card, Input } from '@heroui/react'
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function SecurityTab() {
  const { t } = useLanguage();
  const { token } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: 'Please fill in both fields' });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <Card className="p-6 bg-content border border-border">
        <h2 className="text-xl font-semibold mb-2 text-text">{t('account.changePassword')}</h2>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 mt-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('account.currentPassword')}</label>
            <Input
              type="password" 
              placeholder="••••••••" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('account.newPassword')}</label>
            <Input
              type="password" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleUpdatePassword}
            isDisabled={isSaving}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all disabled:opacity-50"
            variant="primary"
          >
            {isSaving ? 'Updating...' : t('account.updatePassword')}
          </Button>
        </div>
      </Card>
      <Card className="p-6 bg-content border border-border">
        <h2 className="text-xl font-semibold mb-2 text-text">{t('account.2fa')}</h2>
        <p className="text-text-secondary mb-4">{t('account.2fa.desc')}</p>
        <Button className="px-4 py-2 text-text rounded-lg hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary transition-all !border-0 !border-transparent !ring-0 !shadow-none" variant="outline">
          {t('account.2fa.setup')}
        </Button>
      </Card>
    </div>
  );
}
