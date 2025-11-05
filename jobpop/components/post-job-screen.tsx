"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Camera, Shield, AlertCircle, CheckCircle, MapPin, DollarSign, Clock, Calendar } from "lucide-react"
import { api, Job } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"

const categories = ["Delivery", "Events", "Digital", "Retail", "Food Service", "Other"]

export default function PostJobScreen() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [isVerified, setIsVerified] = useState(true) // Set to true for demo
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    duration: "",
    payAmount: "",
    payType: "hourly",
    locationAddress: "",
    locationCity: "",
    locationCoordinates: [0, 0],
    requirements: {
      skills: [] as string[],
      experience: "",
      age: { min: 18, max: 65 },
      ownVehicle: false,
      validLicense: false
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVerified) {
      alert("Пожалуйста, сначала пройдите верификацию KYC")
      return
    }
    
    setIsSubmitting(true)
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        pay: {
          amount: parseFloat(formData.payAmount),
          currency: "USD",
          type: formData.payType
        },
        location: {
          address: formData.locationAddress,
          city: formData.locationCity,
          coordinates: {
            type: "Point",
            coordinates: formData.locationCoordinates
          }
        },
        date: formData.date,
        time: {
          start: formData.timeStart,
          end: formData.timeEnd
        },
        duration: parseFloat(formData.duration),
        requirements: formData.requirements,
        status: "active"
      }

      await api.createJob(jobData)
      alert("Вакансия успешно размещена!")
      
      // Reset form
      setFormData({
        title: "",
        category: "",
        description: "",
        date: "",
        timeStart: "",
        timeEnd: "",
        duration: "",
        payAmount: "",
        payType: "hourly",
        locationAddress: "",
        locationCity: "",
        locationCoordinates: [0, 0],
        requirements: {
          skills: [],
          experience: "",
          age: { min: 18, max: 65 },
          ownVehicle: false,
          validLicense: false
        }
      })
    } catch (error) {
      console.error('Job creation error:', error)
      alert("Ошибка при размещении вакансии. Попробуйте еще раз.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVerified) {
    return (
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">{t('postJob.title')}</h1>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-400">
              <Shield className="w-5 h-5 mr-2" />
              {t('postJob.verificationRequired')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">{t('postJob.verificationRequired')}</p>
                <p className="text-gray-300 text-sm mt-1">
                  {t('postJob.verificationDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">{t('postJob.verificationSteps')}</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#457B9D] rounded-full" />
                  <span>{t('postJob.uploadId')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#457B9D] rounded-full" />
                  <span>{t('postJob.verificationSelfie')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#457B9D] rounded-full" />
                  <span>{t('postJob.businessInfo')}</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-[#457B9D] hover:bg-[#457B9D]/80" onClick={() => setIsVerified(true)}>
              {t('postJob.startVerification')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('postJob.title')}</h1>
        <Badge className="bg-green-500">
          <Shield className="w-3 h-3 mr-1" />
          {t('postJob.verified')}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>{t('postJob.jobDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название вакансии</label>
              <Input
                placeholder="например, Курьер доставки еды"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Категория</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Описание</label>
              <Textarea
                placeholder="Опишите требования к работе, обязанности и что вы ищете..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Фото вакансии (необязательно)</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-[#457B9D] transition-colors cursor-pointer">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Нажмите чтобы загрузить фото вакансии</p>
                <p className="text-gray-500 text-xs mt-1">Это поможет привлечь лучших кандидатов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Расписание и оплата</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Дата</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Продолжительность (часы)</label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="3"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Время начала</label>
                <Input
                  type="time"
                  value={formData.timeStart}
                  onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Время окончания</label>
                <Input
                  type="time"
                  value={formData.timeEnd}
                  onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Оплата ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="25"
                  value={formData.payAmount}
                  onChange={(e) => setFormData({ ...formData, payAmount: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Тип оплаты</label>
                <Select
                  value={formData.payType}
                  onValueChange={(value) => setFormData({ ...formData, payType: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="hourly" className="text-white">Почасовая</SelectItem>
                    <SelectItem value="fixed" className="text-white">Фиксированная</SelectItem>
                    <SelectItem value="commission" className="text-white">Комиссионная</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Адрес</label>
                <Input
                  placeholder="ул. Главная 123"
                  value={formData.locationAddress}
                  onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Город</label>
                <Input
                  placeholder="Алматы"
                  value={formData.locationCity}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-sm">
            <strong>💡 Совет:</strong> Будьте конкретны в требованиях и предлагайте конкурентоспособную оплату для привлечения лучших кандидатов!
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] hover:from-[#5a9bd4] hover:to-[#457B9D] py-3 font-bold text-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Размещение...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Разместить вакансию и начать нанимать
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
