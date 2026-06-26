"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("FingerHR Company");
  const [companyEmail, setCompanyEmail] = useState("admin@fingerhr.com");
  const [companyPhone, setCompanyPhone] = useState("081234567890");
  const [companyAddress, setCompanyAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert("Pengaturan berhasil disimpan!");
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pengaturan" },
        ]}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
          Pengaturan
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Kelola pengaturan aplikasi dan integrasi
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Company Profile */}
        <Card variant="glass-high">
          <div className="border-b border-white/[0.08] px-6 py-4">
            <h3 className="text-sm font-semibold text-on-surface">Profil Perusahaan</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Input
                label="Nama Perusahaan"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
              />
              <Input
                label="Telepon"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface">Alamat</label>
                <textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 py-3 text-sm text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Alamat perusahaan..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fingerspot API Config */}
        <Card variant="glass-high">
          <div className="border-b border-white/[0.08] px-6 py-4">
            <h3 className="text-sm font-semibold text-on-surface">Konfigurasi Fingerspot API</h3>
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
                <p className="text-xs text-on-surface-variant">
                  Webhook URL: Setelah deploy ke Railway, masukkan URL webhook ke dashboard Fingerspot.
                </p>
                <p className="mt-2 font-mono text-xs text-primary">
                  https://[app-name].up.railway.app/api/webhook/fingerspot
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan...
            </>
          ) : (
            "Simpan Pengaturan"
          )}
        </Button>
      </div>
    </div>
  );
}
