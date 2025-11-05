"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, DollarSign, Clock, Eye, Users, Edit, Star, MessageCircle, RotateCcw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function JobsScreen() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white"
      case "completed":
        return "bg-blue-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Активна"
      case "completed":
        return "Завершена"
      case "cancelled":
        return "Отменена"
      default:
        return "Неизвестно"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500 text-white"
      case "pending":
        return "bg-yellow-500 text-white"
      case "failed":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Оплачено"
      case "pending":
        return "В ожидании"
      case "failed":
        return "Ошибка"
      default:
        return "Неизвестно"
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          {user?.role === 'employer' ? 'Мои вакансии' : 'Мои работы'}
        </h1>
        
        {user?.role === 'employer' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center space-x-2 text-green-400 mb-1">
                <Eye className="w-5 h-5" />
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-green-300 text-sm">Активных вакансий</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center space-x-2 text-blue-400 mb-1">
                <Users className="w-5 h-5" />
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-blue-300 text-sm">Заявок</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center space-x-2 text-purple-400 mb-1">
                <Star className="w-5 h-5" />
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-purple-300 text-sm">Нанятых</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {jobs.length === 0 ? (
        <Card className="bg-gray-800/80 border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-[#457B9D]/20 rounded-full flex items-center justify-center mb-4">
              {user?.role === 'employer' ? (
                <Edit className="w-8 h-8 text-[#457B9D]" />
              ) : (
                <RotateCcw className="w-8 h-8 text-[#457B9D]" />
              )}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              {user?.role === 'employer' 
                ? 'У вас пока нет вакансий' 
                : 'У вас пока нет работ'
              }
            </h3>
            
            <p className="text-gray-300 mb-6">
              {user?.role === 'employer' 
                ? 'Создайте первую вакансию и начните привлекать талантливых специалистов'
                : 'Найдите подходящие вакансии и подайте заявки'
              }
            </p>

            <Button
              onClick={() => window.location.href = user?.role === 'employer' ? '/post-job' : '/search'}
              className="bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] hover:from-[#5a9bd4] hover:to-[#457B9D]"
            >
              {user?.role === 'employer' ? 'Создать вакансию' : 'Найти вакансии'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-600 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                    <p className="text-[#457B9D] font-semibold">{job.company}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusText(job.status)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(job.paymentStatus)}>
                      {getPaymentStatusText(job.paymentStatus)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <div className="flex items-center space-x-2 text-green-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold">${job.pay}</span>
                    </div>
                    <p className="text-green-300 text-xs">за работу</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{job.duration}</span>
                    </div>
                    <p className="text-blue-300 text-xs">продолжительность</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-gray-300 text-sm">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-[#457B9D]" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-[#457B9D]" />
                      <span>{job.date}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {user?.role === 'employer' ? (
                      <>
                        <Button variant="outline" size="sm" className="border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D]/10">
                          <Eye className="w-4 h-4 mr-1" />
                          Просмотры
                        </Button>
                        <Button variant="outline" size="sm" className="border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D]/10">
                          <Users className="w-4 h-4 mr-1" />
                          Заявки
                        </Button>
                        <Button variant="outline" size="sm" className="border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D]/10">
                          <Edit className="w-4 h-4 mr-1" />
                          Редактировать
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D]/10">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Перезаявление
                        </Button>
                        <Button variant="outline" size="sm" className="border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D]/10">
                          <Star className="w-4 h-4 mr-1" />
                          Оценить работу
                        </Button>
                        <Button variant="outline" size="sm" className="border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D]/10">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Связаться
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
