"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Clock, Heart, X, RotateCcw, Star, Users, Zap, Sparkles, TrendingUp, Plus, Briefcase, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"

export default function HomeScreen() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1e3a5f] to-[#2d4a6b] relative">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
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

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center space-y-6 pt-8 pb-6 px-6">
          <div className="relative">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-[#457B9D] to-[#5a9bd4] bg-clip-text text-transparent">
              {user?.role === 'employer' ? t('home.title.employer') : t('home.title.applicant')}
            </h1>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>

          <p className="text-gray-300 text-lg">
            {user?.role === 'employer' 
              ? t('home.subtitle.employer')
              : t('home.subtitle.applicant')
            }
          </p>

          {/* Post Job Button for Employers */}
          {user?.role === 'employer' && (
            <div className="flex justify-center mb-6">
              <Button
                onClick={() => window.location.href = '/post-job'}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                {t('home.postJob')}
              </Button>
            </div>
          )}

          {/* Search Button for Applicants */}
          {user?.role === 'applicant' && (
            <div className="flex justify-center mb-6">
              <Button
                onClick={() => window.location.href = '/search'}
                className="bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] hover:from-[#5a9bd4] hover:to-[#457B9D] text-white font-bold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('home.findJobs')}
              </Button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          {jobs.length === 0 ? (
            <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-600 shadow-2xl max-w-md w-full">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-[#457B9D]/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#457B9D]" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {user?.role === 'employer' 
                      ? t('home.startPosting')
                      : t('home.findPerfectJob')
                    }
                  </h3>
                  <p className="text-gray-300">
                    {user?.role === 'employer' 
                      ? t('home.createFirstJob')
                      : t('home.useSearch')
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  {user?.role === 'employer' ? (
                    <Button
                      onClick={() => window.location.href = '/post-job'}
                      className="w-full bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] hover:from-[#5a9bd4] hover:to-[#457B9D]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('home.createFirstJobBtn')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.location.href = '/search'}
                      className="w-full bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] hover:from-[#5a9bd4] hover:to-[#457B9D]"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {t('home.startSearchBtn')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-gray-300">
              <p>Вакансии будут загружены здесь</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
              <div className="flex items-center space-x-2 text-green-400">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold">-</span>
              </div>
              <p className="text-green-300 text-xs">{t('home.avgPay')}</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-center space-x-2 text-blue-400">
                <Clock className="w-4 h-4" />
                <span className="font-bold">-</span>
              </div>
              <p className="text-blue-300 text-xs">{t('home.activeJobs')}</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-center space-x-2 text-purple-400">
                <Users className="w-4 h-4" />
                <span className="font-bold">-</span>
              </div>
              <p className="text-purple-300 text-xs">{t('home.registered')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
