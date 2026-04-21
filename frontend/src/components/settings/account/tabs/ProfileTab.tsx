import { useState, useEffect } from "react";
import { Button, Card, Input } from "@heroui/react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function ProfileTab() {
  const { t } = useLanguage();
  const { user, token, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
    setMessage(null);
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/${user.id}`,
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
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="doc-theme-form grid grid-cols-1 gap-6 max-w-3xl">
      <Card className="p-6 bg-slate-900/50 border border-slate-700/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">
          {t("account.profileInfo")}
        </h2>

        {message && (
          <div
            className={`p-3 rounded-lg mb-4 ${message.type === "success" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
          >
            {message.text}
          </div>
        )}

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
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)] transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : t("account.saveChanges")}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-slate-900/50 border border-slate-700/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">
          {t("account.profileImage")}
        </h2>
        <div className="flex items-center gap-4 mt-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-xl font-bold text-white shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)]">
            {username.substring(0, 1).toUpperCase()}
          </div>
          <Button
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/30 transition-all"
            variant="ghost"
          >
            {t("account.changeImage")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
