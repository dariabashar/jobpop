"use client"

import { useState } from "react"
import { Home, Search, Calendar, Plus, MessageCircle, User, Wallet, Bell, Settings, LogOut, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import AuthScreen from "@/components/auth-screen"
import HomeScreen from "@/components/home-screen"
import SearchScreen from "@/components/search-screen"
import JobsScreen from "@/components/jobs-screen"
import PostJobScreen from "@/components/post-job-screen"
import ChatScreen from "@/components/chat-screen"
import ProfileScreen from "@/components/profile-screen"
import WalletScreen from "@/components/wallet-screen"
import NotificationsScreen from "@/components/notifications-screen"
import JobDetailScreen from "@/components/job-detail-screen"
import RatingScreen from "@/components/rating-screen"
import SettingsScreen from "@/components/settings-screen"

type Screen =
  | "home"
  | "search"
  | "jobs"
  | "post"
  | "chat"
  | "profile"
  | "wallet"
  | "notifications"
  | "job-detail"
  | "rating"
  | "settings"

export default function JobPopApp() {
  const { user, loading, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth screen if user is not logged in
  if (!user) {
    return <AuthScreen />
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen />
      case "search":
        return <SearchScreen />
      case "jobs":
        return <JobsScreen />
      case "post":
        return <PostJobScreen />
      case "chat":
        return <ChatScreen />
      case "profile":
        return <ProfileScreen />
      case "wallet":
        return <WalletScreen />
      case "notifications":
        return <NotificationsScreen />
      case "job-detail":
        return <JobDetailScreen />
      case "rating":
        return <RatingScreen />
      case "settings":
        return <SettingsScreen />
      default:
        return <HomeScreen />
    }
  }

  const navItems = [
    { id: "home" as Screen, icon: Home, label: t('nav.home') },
    { id: "search" as Screen, icon: Search, label: t('nav.search') },
    { id: "jobs" as Screen, icon: Calendar, label: user?.role === 'employer' ? t('nav.jobs') : t('nav.jobs') },
    ...(user?.role === 'employer' ? [{ id: "post" as Screen, icon: Plus, label: t('nav.post') }] : []),
  ]

  const topNavItems = [
    { id: "chat" as Screen, icon: MessageCircle },
    { id: "notifications" as Screen, icon: Bell },
    { id: "wallet" as Screen, icon: Wallet },
    { id: "settings" as Screen, icon: Settings },
    { id: "profile" as Screen, icon: User },
  ]

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="JobPop" className="w-8 h-8" />
          <span className="text-xl font-bold">JobPop</span>
        </div>
        <div className="flex space-x-2">
          {/* Language switcher */}
          <div className="flex items-center space-x-1 mr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              className="text-white hover:bg-[#457B9D]/20"
              title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
            >
              <Globe className="w-4 h-4 mr-1" />
              {language === 'ru' ? 'EN' : 'RU'}
            </Button>
          </div>
          
          {topNavItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => setCurrentScreen(item.id)}
              className={cn("text-white hover:bg-[#457B9D]/20", currentScreen === item.id && "bg-[#457B9D]/30")}
            >
              <item.icon className="w-5 h-5" />
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-red-500/20"
            title={t('nav.logout')}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">{renderScreen()}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D1B2A] border-t border-gray-700">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setCurrentScreen(item.id)}
              className={cn(
                "flex flex-col items-center space-y-1 text-white hover:bg-[#457B9D]/20 h-auto py-2",
                currentScreen === item.id && "bg-[#457B9D]/30",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}
