import { useState, useEffect, useRef } from "react";
import { Avatar, Button, Card, Input, Spinner } from "@heroui/react";
import { Pencil } from "lucide-react";
import { showError, showSuccess } from "@/toast";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/api";

export default function ProfileTab() {
  const { t } = useLanguage();
  const { user, token, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !token) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `${API_BASE}/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, firstName, lastName, email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      updateUser(data);
      showSuccess("Profile updated successfully!");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !token) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showError("Image must be smaller than 2 MB.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(
        `${API_BASE}/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatarUrl: base64 }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to upload avatar");

      updateUser(data);
      showSuccess("Profile picture updated!");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !token) return;
    setIsUploadingAvatar(true);
    try {
      const response = await fetch(
        `${API_BASE}/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatarUrl: null }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to remove avatar");
      updateUser(data);
      showSuccess("Profile picture removed.");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="doc-theme-form grid grid-cols-1 gap-6 max-w-3xl">
      <Card className="p-6 bg-slate-900/50 border border-slate-700/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">
          {t("account.profileInfo")}
        </h2>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              {t("account.username")}
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                First Name
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Last Name
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              {t("account.email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleSave}
            isDisabled={isSaving}
            className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : t("account.saveChanges")}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-slate-900/50 border border-slate-700/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">
          {t("account.profileImage")}
        </h2>
        <div className="flex items-center gap-5 mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Change profile picture"
          >
            <Avatar
              size="lg"
              className="w-20 h-20 cursor-pointer shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)]"
            >
              {user?.avatarUrl && (
                <Avatar.Image src={user.avatarUrl} alt={username} />
              )}
              <Avatar.Fallback className="bg-[var(--color-primary)] text-white text-xl font-bold">
                {username.substring(0, 1).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <Pencil className="w-6 h-6 text-white" />
            </div>
            {isUploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <Spinner size="sm" className="text-white" />
              </div>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onPress={() => fileInputRef.current?.click()}
              isDisabled={isUploadingAvatar}
              className="text-slate-300 hover:text-white"
            >
              {t("account.changeImage")}
            </Button>
            {user?.avatarUrl && (
              <Button
                size="sm"
                variant="ghost"
                onPress={handleRemoveAvatar}
                isDisabled={isUploadingAvatar}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                Remove picture
              </Button>
            )}
            <p className="text-xs text-slate-500">JPG, PNG, GIF — max 2 MB</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
