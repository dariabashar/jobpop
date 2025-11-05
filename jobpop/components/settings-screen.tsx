"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Globe,
  Bell,
  Shield,
  User,
  CreditCard,
  Moon,
  Sun,
  Volume2,
  MapPin,
  Eye,
  Lock,
  LogOut,
  Smartphone,
  Mail,
  MessageSquare,
  Star,
  Download,
  Trash2,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from "lucide-react"

interface SettingsState {
  language: string
  darkMode: boolean
  notifications: {
    jobMatches: boolean
    messages: boolean
    payments: boolean
    marketing: boolean
    sound: boolean
  }
  privacy: {
    profileVisible: boolean
    locationSharing: boolean
    activityStatus: boolean
  }
  preferences: {
    currency: string
    distanceUnit: string
    autoApply: boolean
  }
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<SettingsState>({
    language: "english",
    darkMode: true,
    notifications: {
      jobMatches: true,
      messages: true,
      payments: true,
      marketing: false,
      sound: true,
    },
    privacy: {
      profileVisible: true,
      locationSharing: true,
      activityStatus: true,
    },
    preferences: {
      currency: "usd",
      distanceUnit: "km",
      autoApply: false,
    },
  })

  const languages = [
    { value: "english", label: "English", flag: "🇺🇸" },
    { value: "russian", label: "Русский", flag: "🇷🇺" },
    { value: "kazakh", label: "Қазақша", flag: "🇰🇿" },
  ]

  const currencies = [
    { value: "usd", label: "USD ($)", flag: "🇺🇸" },
    { value: "kzt", label: "KZT (₸)", flag: "🇰🇿" },
    { value: "rub", label: "RUB (₽)", flag: "🇷🇺" },
  ]

  const updateNotificationSetting = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }

  const updatePrivacySetting = (key: keyof typeof settings.privacy, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }))
  }

  const updatePreferenceSetting = (key: keyof typeof settings.preferences, value: any) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1e3a5f] to-[#2d4a6b] p-4 space-y-6">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#457B9D] rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 pt-4">
          <div className="relative">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-[#457B9D] to-[#5a9bd4] bg-clip-text text-transparent">
              Settings
            </h1>
            <div className="absolute -top-2 -right-2">
              <Settings className="w-6 h-6 text-[#457B9D] animate-spin" style={{ animationDuration: "3s" }} />
            </div>
          </div>
          <p className="text-gray-300 text-lg">Customize your JobPop experience</p>
        </div>

        {/* Language & Region */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-600 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-white text-xl">
              <div className="p-2 bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] rounded-lg mr-3">
                <Globe className="w-6 h-6 text-white" />
              </div>
              Language & Region
              <Sparkles className="w-4 h-4 ml-2 text-yellow-400 animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">App Language</label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="bg-gray-700/50 backdrop-blur-sm border-gray-600 text-white h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value} className="text-white text-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-semibold">{lang.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Currency</label>
                <Select
                  value={settings.preferences.currency}
                  onValueChange={(value) => updatePreferenceSetting("currency", value)}
                >
                  <SelectTrigger className="bg-gray-700/50 backdrop-blur-sm border-gray-600 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value} className="text-white">
                        <div className="flex items-center space-x-2">
                          <span>{currency.flag}</span>
                          <span className="font-semibold">{currency.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Distance</label>
                <Select
                  value={settings.preferences.distanceUnit}
                  onValueChange={(value) => updatePreferenceSetting("distanceUnit", value)}
                >
                  <SelectTrigger className="bg-gray-700/50 backdrop-blur-sm border-gray-600 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="km" className="text-white font-semibold">
                      Kilometers (km)
                    </SelectItem>
                    <SelectItem value="mi" className="text-white font-semibold">
                      Miles (mi)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-600 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-white text-xl">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
                {settings.darkMode ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-white" />}
              </div>
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-purple-500/30">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Moon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Dark Mode</p>
                  <p className="text-gray-400 text-sm">Use dark theme throughout the app</p>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-600 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-white text-xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-3">
                <Bell className="w-6 h-6 text-white" />
              </div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "jobMatches",
                icon: Star,
                label: "Job Matches",
                desc: "New jobs that match your preferences",
                color: "green",
              },
              {
                key: "messages",
                icon: MessageSquare,
                label: "Messages",
                desc: "New messages from employers",
                color: "blue",
              },
              {
                key: "payments",
                icon: CreditCard,
                label: "Payments",
                desc: "Payment confirmations and updates",
                color: "yellow",
              },
              {
                key: "marketing",
                icon: Mail,
                label: "Marketing",
                desc: "Tips and promotional offers",
                color: "purple",
              },
              { key: "sound", icon: Volume2, label: "Sound", desc: "Play sounds for notifications", color: "red" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/50 hover:border-[#457B9D]/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 bg-${item.color}-500/20 rounded-lg`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{item.label}</p>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting(item.key as keyof typeof settings.notifications, checked)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-600 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-white text-xl">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "profileVisible",
                icon: Eye,
                label: "Profile Visibility",
                desc: "Allow others to see your profile",
                color: "green",
              },
              {
                key: "locationSharing",
                icon: MapPin,
                label: "Location Sharing",
                desc: "Share location for job matching",
                color: "blue",
              },
              {
                key: "activityStatus",
                icon: Smartphone,
                label: "Activity Status",
                desc: "Show when you're online",
                color: "yellow",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/50 hover:border-green-500/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 bg-${item.color}-500/20 rounded-lg`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{item.label}</p>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.privacy[item.key as keyof typeof settings.privacy]}
                  onCheckedChange={(checked) =>
                    updatePrivacySetting(item.key as keyof typeof settings.privacy, checked)
                  }
                />
              </div>
            ))}

            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 text-lg shadow-lg transition-all duration-300">
              <Lock className="w-5 h-5 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-600 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-white text-xl">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              Account Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Download, label: "Export Data", color: "blue" },
              { icon: RefreshCw, label: "Sync Account", color: "green" },
              { icon: Trash2, label: "Delete Account", color: "red", danger: true },
            ].map((item) => (
              <Button
                key={item.label}
                variant="outline"
                className={`w-full justify-between h-16 bg-gray-700/30 backdrop-blur-sm border-gray-600 hover:border-${item.color}-500 text-${item.danger ? "red" : "white"} hover:bg-${item.color}-500/10 transition-all duration-300 font-semibold text-lg`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${item.color}-500/20 rounded-lg`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                  </div>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-600 shadow-xl">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <img src="/logo.png" alt="JobPop" className="w-12 h-12 animate-float" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-[#457B9D] bg-clip-text text-transparent">
                JobPop
              </span>
            </div>
            <p className="text-gray-400 font-semibold">Version 1.0.0</p>
            <div className="flex justify-center space-x-6 text-sm">
              {["Privacy Policy", "Terms of Service", "Licenses"].map((item) => (
                <button
                  key={item}
                  className="text-gray-500 hover:text-[#457B9D] transition-colors duration-300 font-semibold"
                >
                  {item}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 text-lg shadow-lg transition-all duration-300">
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>

        <div className="h-8" />
      </div>
    </div>
  )
}
