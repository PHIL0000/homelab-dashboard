import { useState, useEffect } from 'react';
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Card } from '@heroui/react';
import { Camera } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

export default function UsersTab() {
  const { t } = useLanguage();
  const { token, user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [isAdding, setIsAdding] = useState(false);

  // Edit State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setIsAdding(true);
      setError(null);
      const res = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          username: newUsername, 
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail, 
          password: newPassword, 
          role: newRole 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      setUsers([...users, data]);
      setShowAddForm(false);
      setNewUsername('');
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('USER');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingUser) return;
    try {
      setIsUpdating(true);
      setError(null);
      const res = await fetch(`http://localhost:3001/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          username: editUsername, 
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          avatarUrl: editAvatarUrl
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      
      setUsers(users.map(u => u.id === editingUser.id ? data : u));
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!token || !window.confirm('Delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEditing = (user: UserData) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditFirstName(user.firstName || '');
    setEditLastName(user.lastName || '');
    setEditEmail(user.email || '');
    setEditAvatarUrl(user.avatarUrl || '');
    setShowAddForm(false);
  };

  const cancelEditing = () => {
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-content/50 border border-border p-6 rounded-xl mb-6">
        <div>
          <h3 className="text-xl font-bold text-text">{t('settings.users')}</h3>
          <p className="text-text-secondary mt-1">{t('settings.users.desc')}</p>
        </div>
        <button 
          onClick={() => { setShowAddForm(!showAddForm); setEditingUser(null); }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all"
        >
          {showAddForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 text-red-400 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showAddForm && (
        <Card className="p-6 bg-content border border-border mb-6">
          <h4 className="text-lg font-bold text-text mb-4">Create New User</h4>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Username *</label>
                <input required type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">First Name</label>
                <input type="text" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Last Name</label>
                <input type="text" value={newLastName} onChange={e => setNewLastName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Password *</label>
                <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Role *</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <button disabled={isAdding} type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all disabled:opacity-50 mt-4">
              {isAdding ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </Card>
      )}

      {editingUser && (
        <Card className="p-6 bg-content border border-border mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-text">Edit User: {editingUser.username}</h4>
            <button onClick={cancelEditing} className="text-text-secondary hover:text-text">Cancel</button>
          </div>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Username *</label>
                <input required type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">First Name</label>
                <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Last Name</label>
                <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">Avatar Image URL</label>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-background border border-border flex-shrink-0 flex items-center justify-center">
                    {editAvatarUrl ? (
                      <img src={editAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                    ) : (
                      <Camera className="w-5 h-5 text-text-secondary" />
                    )}
                  </div>
                  <input type="url" placeholder="https://example.com/avatar.png" value={editAvatarUrl} onChange={e => setEditAvatarUrl(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
            <button disabled={isUpdating} type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all disabled:opacity-50 mt-4">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-text-secondary">Loading users...</div>
      ) : (
        <Card className="bg-content border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary">User</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary">Name</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary">Email</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary">Role</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-sm">{u.username.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="text-text font-medium">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || '-'}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{u.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => startEditing(u)}
                          className="text-primary hover:text-white hover:bg-primary/20 px-3 py-1 rounded transition-colors text-sm"
                        >
                          Edit
                        </button>
                        {currentUser?.id !== u.id.toString() && (
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10 px-3 py-1 rounded transition-colors text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}