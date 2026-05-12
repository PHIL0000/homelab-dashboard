import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Input, Select, ListBox } from "@heroui/react";
import { Camera, ChevronDown } from "lucide-react";
import { showError, showSuccess } from "../../../../toast";
import { API_BASE } from "@/lib/api";
import { useEmailVerification, isEmailFormatValid } from "@/components/auth/EmailVerification";

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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [newEmailToken, setNewEmailToken] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const newEmailVerification = useEmailVerification(newEmail, setNewEmailToken);

  // Edit State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editEmailOriginal, setEditEmailOriginal] = useState("");
  const [editEmailToken, setEditEmailToken] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const editEmailVerification = useEmailVerification(editEmail, setEditEmailToken);

  const newEmailEntered = newEmail.trim().length > 0;
  const newEmailBlocksSubmit =
    newEmailEntered && (!isEmailFormatValid(newEmail) || !newEmailToken);

  const editEmailChanged =
    editEmail.trim().toLowerCase() !== editEmailOriginal.trim().toLowerCase();
  const editEmailEntered = editEmail.trim().length > 0;
  const editEmailBlocksSubmit =
    editEmailChanged &&
    editEmailEntered &&
    (!isEmailFormatValid(editEmail) || !editEmailToken);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      showError(err.message);
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
    if (newEmailBlocksSubmit) return;
    try {
      setIsAdding(true);
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmailEntered ? newEmail : undefined,
          password: newPassword,
          role: newRole,
          emailVerificationToken: newEmailEntered ? newEmailToken : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setUsers([...users, data]);
      setShowAddForm(false);
      setNewUsername("");
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("USER");
      setNewEmailToken(null);
      showSuccess("User created successfully!");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingUser) return;
    if (editEmailBlocksSubmit) return;
    try {
      setIsUpdating(true);
      const res = await fetch(
        `${API_BASE}/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: editUsername,
            firstName: editFirstName,
            lastName: editLastName,
            email: editEmail,
            avatarUrl: editAvatarUrl,
            ...(editEmailChanged && editEmailEntered
              ? { emailVerificationToken: editEmailToken }
              : {}),
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");

      setUsers(users.map((u) => (u.id === editingUser.id ? data : u)));
      setEditingUser(null);
      setEditEmailToken(null);
      setEditEmailOriginal("");
      showSuccess("User updated successfully!");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!token || !window.confirm("Delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      setUsers(users.filter((u) => u.id !== id));
      showSuccess("User deleted.");
    } catch (err: any) {
      showError(err.message);
    }
  };

  const startEditing = (user: UserData) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditFirstName(user.firstName || "");
    setEditLastName(user.lastName || "");
    setEditEmail(user.email || "");
    setEditEmailOriginal(user.email || "");
    setEditEmailToken(null);
    setEditAvatarUrl(user.avatarUrl || "");
    setShowAddForm(false);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditEmailToken(null);
    setEditEmailOriginal("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/50/50 border border-slate-700/50 p-6 rounded-xl mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-100">
            {t("settings.users")}
          </h3>
          <p className="text-slate-400 mt-1">{t("settings.users.desc")}</p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingUser(null);
          }}
          className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all"
          variant="primary"
        >
          {showAddForm ? "Cancel" : "Add User"}
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 bg-slate-900/50 border border-slate-700/50 mb-6">
          <h4 className="text-lg font-bold text-text mb-4">Create New User</h4>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Username *
                </label>
                <Input
                  required
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full"
                  minLength={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Email
                </label>
                <div className="flex gap-2 items-stretch">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1"
                  />
                  {newEmailVerification.sendButton}
                </div>
                {newEmailVerification.otpBlock && (
                  <div className="mt-2">{newEmailVerification.otpBlock}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  First Name
                </label>
                <Input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Last Name
                </label>
                <Input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Password *
                </label>
                <Input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full"
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Role *
                </label>
                <Select
                  selectedKey={newRole}
                  onChange={(key) => {
                    if (key != null) setNewRole(String(key));
                  }}
                  className="w-full"
                >
                  <Select.Trigger className="w-full px-3 flex items-center justify-between">
                    <Select.Value />
                    <ChevronDown size={16} className="text-slate-400" />
                  </Select.Trigger>
                  <Select.Popover className="w-[var(--trigger-width)]">
                    <ListBox>
                      <ListBox.Item id="USER" className="pl-2">
                        User
                      </ListBox.Item>
                      <ListBox.Item id="ADMIN" className="pl-2">
                        Admin
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </div>
            <Button
              isDisabled={isAdding || newEmailBlocksSubmit}
              type="submit"
              className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all disabled:opacity-50 mt-4"
              variant="primary"
            >
              {isAdding ? "Creating..." : "Create User"}
            </Button>
          </form>
        </Card>
      )}

      {editingUser && (
        <Card className="p-6 bg-slate-900/50 border border-slate-700/50 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-slate-100">
              Edit User: {editingUser.username}
            </h4>
            <Button
              onClick={cancelEditing}
              className="text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Username *
                </label>
                <Input
                  required
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full"
                  minLength={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Email
                </label>
                <div className="flex gap-2 items-stretch">
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="flex-1"
                  />
                  {editEmailChanged && editEmailEntered && editEmailVerification.sendButton}
                </div>
                {editEmailChanged && editEmailEntered && editEmailVerification.otpBlock && (
                  <div className="mt-2">{editEmailVerification.otpBlock}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  First Name
                </label>
                <Input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Last Name
                </label>
                <Input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Avatar Image URL
                </label>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-slate-700/50 flex-shrink-0 flex items-center justify-center">
                    {editAvatarUrl ? (
                      <img
                        src={editAvatarUrl}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                        }}
                      />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <Input
                    type="url"
                    placeholder="https://example.com/avatar.png"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <Button
              isDisabled={isUpdating || editEmailBlocksSubmit}
              type="submit"
              className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all disabled:opacity-50 mt-4"
              variant="primary"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-slate-400">Loading users...</div>
      ) : (
        <Card className="bg-slate-900/50 border border-slate-700/50 overflow-hidden">
          <div className="divide-y divide-border">
            {users.map((u) => {
              const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");
              return (
                <div
                  key={u.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-text flex items-center justify-center overflow-hidden flex-shrink-0">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-sm">{u.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-text font-medium truncate">{u.username}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${u.role === "ADMIN" ? "bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-text" : "bg-green-500/20 text-green-400"}`}>
                        {u.role}
                      </span>
                    </div>
                    {fullName && <p className="text-sm text-slate-400 truncate">{fullName}</p>}
                    {u.email && <p className="text-sm text-slate-400 truncate">{u.email}</p>}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      onClick={() => startEditing(u)}
                      className="text-purple-400 hover:text-purple-300 hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] px-3 py-1 rounded transition-colors text-sm !border-0 !border-transparent !ring-0 !shadow-none"
                      variant="ghost"
                    >
                      Edit
                    </Button>
                    {currentUser?.id !== u.id.toString() && (
                      <Button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-400 hover:text-red-500 hover:bg-red-500/10 px-3 py-1 rounded transition-colors text-sm !border-0 !border-transparent !ring-0 !shadow-none"
                        variant="ghost"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
