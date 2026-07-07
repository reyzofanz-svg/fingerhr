"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout";

interface Settings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  telegram_bot_token: string;
  telegram_enabled: string;
  telegram_message_template: string;
}

interface OfficeLocation {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    companyName: "FingerHR Company",
    companyEmail: "admin@fingerhr.com",
    companyPhone: "081234567890",
    companyAddress: "",
    telegram_bot_token: "",
    telegram_enabled: "false",
    telegram_message_template: "═════════════════\n  FINGERHR - NOTIFICATION\n═════════════════\n\nHello, <b>{name}</b>\n\nYour attendance has been recorded:\n├ Status : <b>{status}</b>\n├ Time : <b>{time}</b>\n└ Date : <b>{date}</b>\n\nDon't forget to clock out!",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [webhookSetting, setWebhookSetting] = useState(false);

  // Office Locations state
  const [officeLocations, setOfficeLocations] = useState<OfficeLocation[]>([]);
  const [newLocation, setNewLocation] = useState<OfficeLocation>({
    name: "",
    lat: 0,
    lng: 0,
    radius: 100,
  });
  const [savingLocation, setSavingLocation] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          companyName: data.companyName || "FingerHR Company",
          companyEmail: data.companyEmail || "admin@fingerhr.com",
          companyPhone: data.companyPhone || "081234567890",
          companyAddress: data.companyAddress || "",
          telegram_bot_token: data.telegram_bot_token || "",
          telegram_enabled: data.telegram_enabled || "false",
          telegram_message_template: data.telegram_message_template || "═════════════════\n  FINGERHR - NOTIFICATION\n═════════════════\n\nHello, <b>{name}</b>\n\nYour attendance has been recorded:\n├ Status : <b>{status}</b>\n├ Time : <b>{time}</b>\n└ Date : <b>{date}</b>\n\nDon't forget to clock out!",
        });
        // Parse office locations from settings
        if (data.office_locations) {
          try {
            setOfficeLocations(JSON.parse(data.office_locations));
          } catch {
            setOfficeLocations([]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        alert("Failed to save settings");
        return;
      }

      alert("Settings saved successfully!");
    } catch (error) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSetTelegramWebhook = async () => {
    if (!settings.telegram_bot_token) {
      alert("Enter the bot token first");
      return;
    }
    setWebhookSetting(true);
    try {
      // Save token first
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_bot_token: settings.telegram_bot_token }),
      });

      const baseUrl = window.location.origin;
      const webhookUrl = `${baseUrl}/api/telegram/webhook`;

      const res = await fetch("/api/telegram/set-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("Webhook configured successfully!\nURL: " + webhookUrl);
      } else {
        alert("Failed to set webhook: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Failed to configure webhook");
    } finally {
      setWebhookSetting(false);
    }
  };

  const handleSaveLocations = async () => {
    setSavingLocation(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          office_locations: JSON.stringify(officeLocations),
        }),
      });

      if (!res.ok) {
        alert("Failed to save office location");
        return;
      }

      alert("Office location saved successfully!");
    } catch (error) {
      alert("Failed to save office location");
    } finally {
      setSavingLocation(false);
    }
  };

  const handleAddLocation = () => {
    if (!newLocation.name) {
      alert("Location name is required");
      return;
    }
    setOfficeLocations([...officeLocations, { ...newLocation }]);
    setNewLocation({ name: "", lat: 0, lng: 0, radius: 100 });
  };

  const handleDeleteLocation = (index: number) => {
    setOfficeLocations(officeLocations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage application settings and integrations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Company Profile */}
        <Card variant="glass-high">
          <div className="border-b border-white/[0.08] px-6 py-4">
            <h3 className="text-sm font-semibold text-white">Company Profile</h3>
          </div>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Company Name"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                />
                <Input
                  label="Phone"
                  value={settings.companyPhone}
                  onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Address</label>
                  <textarea
                    value={settings.companyAddress}
                    onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 py-3 text-sm text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Company address..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fingerspot API Config */}
        <Card variant="glass-high">
          <div className="border-b border-white/[0.08] px-6 py-4">
            <h3 className="text-sm font-semibold text-white">Fingerspot API Configuration</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Input
                label="API URL"
                value="https://developer.fingerspot.io/api"
                disabled
              />
              <Input
                label="API Token"
                value="TPDBEYV5O51USU8U"
                disabled
              />
              <Input
                label="Cloud ID"
                value="C269248053121C21"
                disabled
              />
              <div className="rounded-xl bg-white/[0.03] p-4">
                <p className="text-xs text-slate-400">
                  Webhook URL: After deploying to Railway, enter the webhook URL in the Fingerspot dashboard.
                </p>
                <p className="mt-2 font-mono text-xs text-white/60">
                  https://[app-name].up.railway.app/api/webhook/fingerspot
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>

        {/* Telegram Config */}
        <Card variant="glass-high" className="lg:col-span-2">
          <div className="border-b border-white/[0.08] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Telegram Notifications</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Send automatic notifications to employees when clocking in/out
                </p>
              </div>
              <Badge variant={settings.telegram_enabled === "true" ? "success" : "default"} size="sm">
                {settings.telegram_enabled === "true" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Enable Notifications</p>
                  <p className="text-xs text-slate-400">Send attendance notifications via Telegram bot</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({
                    ...settings,
                    telegram_enabled: settings.telegram_enabled === "true" ? "false" : "true",
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.telegram_enabled === "true" ? "bg-primary" : "bg-on-surface-variant/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.telegram_enabled === "true" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <Input
                label="Bot Token"
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={settings.telegram_bot_token}
                onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                type="password"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Message Template
                </label>
                <textarea
                  value={settings.telegram_message_template}
                  onChange={(e) => setSettings({ ...settings, telegram_message_template: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 py-3 text-sm text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Hello {name}, Attendance recorded: {status} at {time}"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Variables: {"{name}"}, {"{status}"}, {"{time}"}, {"{date}"}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4">
                <p className="text-xs font-medium text-white">How to Set Up:</p>
                <ol className="mt-2 space-y-1 text-xs text-slate-400">
                  <li>1. Create a Telegram bot via @BotFather, copy the token</li>
                  <li>2. Paste the token above, then save</li>
                  <li>3. Click the "Set Webhook" button below</li>
                  <li>4. Employees send to bot: <span className="font-mono text-white/60">/start &lt;PIN&gt;</span></li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={handleSetTelegramWebhook} disabled={webhookSetting || !settings.telegram_bot_token}>
                  {webhookSetting ? "Setting..." : "Set Webhook"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Office Locations */}
      <Card variant="glass-high">
        <div className="border-b border-white/[0.08] px-6 py-4">
          <h3 className="text-sm font-semibold text-white">Office Location</h3>
          <p className="mt-1 text-xs text-slate-400">
            Configure office location for GPS attendance validation
          </p>
        </div>
        <CardContent className="p-6">
          {/* Existing locations */}
          {officeLocations.length > 0 && (
            <div className="mb-6 space-y-3">
              {officeLocations.map((loc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{loc.name}</p>
                    <p className="text-xs text-slate-400">
                      Lat: {loc.lat}, Lng: {loc.lng} | Radius: {loc.radius}m
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(index)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new location form */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              label="Location Name"
              value={newLocation.name}
              onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
              placeholder="Head Office"
            />
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={newLocation.lat || ""}
              onChange={(e) => setNewLocation({ ...newLocation, lat: parseFloat(e.target.value) || 0 })}
              placeholder="-6.2088"
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={newLocation.lng || ""}
              onChange={(e) => setNewLocation({ ...newLocation, lng: parseFloat(e.target.value) || 0 })}
              placeholder="106.8456"
            />
            <Input
              label="Radius (meters)"
              type="number"
              value={newLocation.radius}
              onChange={(e) => setNewLocation({ ...newLocation, radius: parseInt(e.target.value) || 100 })}
              placeholder="100"
            />
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={handleAddLocation}>
                Add
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveLocations}
                disabled={savingLocation}
              >
                {savingLocation ? "Saving..." : "Save Location"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
