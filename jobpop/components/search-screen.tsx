"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MapPin, DollarSign, Clock, Search, Filter, X, Calendar, Users, Building, GraduationCap, Briefcase, Globe, Star, Heart } from "lucide-react"
import { api, Job } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"

// Расширенные данные для фильтров
const specializations = [
  "IT, интернет, телеком",
  "Бухгалтерия, финансы",
  "Продажи, маркетинг",
  "Производство, сельское хозяйство",
  "Строительство, недвижимость",
  "Транспорт, логистика",
  "Образование, наука",
  "Медицина, фармацевтика",
  "Сфера услуг",
  "Государственная служба",
  "Другое"
]

const industries = [
  "IT и интернет",
  "Финансы и банки",
  "Продажи и маркетинг",
  "Производство",
  "Строительство",
  "Транспорт",
  "Образование",
  "Медицина",
  "Торговля",
  "Услуги",
  "Другое"
]

const regions = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Актобе",
  "Караганда",
  "Тараз",
  "Павлодар",
  "Семей",
  "Усть-Каменогорск",
  "Уральск",
  "Другой"
]

const metroStations = [
  "Алматы-1",
  "Алматы-2",
  "Алматы-3",
  "Алматы-4",
  "Алматы-5",
  "Алматы-6",
  "Алматы-7",
  "Алматы-8",
  "Алматы-9",
  "Алматы-10"
]

const paymentFrequencies = [
  "Ежедневно",
  "Раз в неделю", 
  "Два раза в месяц",
  "Раз в месяц",
  "За проект"
]

const educationLevels = [
  "Не требуется или не указано",
  "Среднее профессиональное",
  "Высшее"
]

const experienceLevels = [
  "Не имеет значения",
  "Нет опыта",
  "От 1 года до 3 лет",
  "От 3 до 6 лет",
  "Более 6 лет"
]

const employmentTypes = [
  "Полная занятость",
  "Частичная занятость",
  "Проектная работа",
  "Вахта",
  "Оформление по ГПХ или по совместительству",
  "Стажировка"
]

const workSchedules = [
  "Рабочие часы в день",
  "Вечерние или ночные смены"
]

const workFormats = [
  "На месте работодателя",
  "Удалённо",
  "Гибрид",
  "Разъездной"
]

const sortOptions = [
  "По соответствию",
  "По дате изменения",
  "По убыванию зарплат",
  "По возрастанию зарплаты"
]

const timeFilters = [
  "За всё время",
  "За месяц",
  "За неделю",
  "За последние три дня",
  "За сутки"
]

const pageSizes = [
  "20 вакансий",
  "50 вакансий", 
  "100 вакансий"
]

export default function SearchScreen() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchIn, setSearchIn] = useState<string[]>(["title"])
  const [excludeWords, setExcludeWords] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("Любая")
  const [selectedIndustry, setSelectedIndustry] = useState("Любая")
  const [selectedRegion, setSelectedRegion] = useState("Любая")
  const [selectedMetro, setSelectedMetro] = useState("Любая")
  const [salaryFrom, setSalaryFrom] = useState("")
  const [salaryTo, setSalaryTo] = useState("")
  const [showSalaryOnly, setShowSalaryOnly] = useState(false)
  const [paymentFrequency, setPaymentFrequency] = useState("Любая")
  const [education, setEducation] = useState("Любая")
  const [experience, setExperience] = useState("Любая")
  const [employmentType, setEmploymentType] = useState<string[]>([])
  const [workSchedule, setWorkSchedule] = useState<string[]>([])
  const [workFormat, setWorkFormat] = useState<string[]>([])
  const [otherParams, setOtherParams] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("По соответствию")
  const [timeFilter, setTimeFilter] = useState("За всё время")
  const [pageSize, setPageSize] = useState("20 вакансий")
  const [searchResults, setSearchResults] = useState<Job[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)

  const handleSearchInChange = (value: string) => {
    if (searchIn.includes(value)) {
      setSearchIn(searchIn.filter(item => item !== value))
    } else {
      setSearchIn([...searchIn, value])
    }
  }

  const handleEmploymentTypeChange = (value: string) => {
    if (employmentType.includes(value)) {
      setEmploymentType(employmentType.filter(item => item !== value))
    } else {
      setEmploymentType([...employmentType, value])
    }
  }

  const handleWorkScheduleChange = (value: string) => {
    if (workSchedule.includes(value)) {
      setWorkSchedule(workSchedule.filter(item => item !== value))
    } else {
      setWorkSchedule([...workSchedule, value])
    }
  }

  const handleWorkFormatChange = (value: string) => {
    if (workFormat.includes(value)) {
      setWorkFormat(workFormat.filter(item => item !== value))
    } else {
      setWorkFormat([...workFormat, value])
    }
  }

  const handleOtherParamsChange = (value: string) => {
    if (otherParams.includes(value)) {
      setOtherParams(otherParams.filter(item => item !== value))
    } else {
      setOtherParams([...otherParams, value])
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSearchIn(["title"])
    setExcludeWords("")
    setSelectedSpecialization("Любая")
    setSelectedIndustry("Любая")
    setSelectedRegion("Любая")
    setSelectedMetro("Любая")
    setSalaryFrom("")
    setSalaryTo("")
    setShowSalaryOnly(false)
    setPaymentFrequency("Любая")
    setEducation("Любая")
    setExperience("Любая")
    setEmploymentType([])
    setWorkSchedule([])
    setWorkFormat([])
    setOtherParams([])
    setSearchResults([])
  }

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const params: any = {
        page: currentPage,
        limit: parseInt(pageSize.split(' ')[0]),
        search: searchQuery || undefined,
        category: selectedSpecialization !== "Любая" ? selectedSpecialization : undefined,
        city: selectedRegion !== "Любая" ? selectedRegion : undefined,
        minPay: salaryFrom ? parseFloat(salaryFrom) : undefined,
        maxPay: salaryTo ? parseFloat(salaryTo) : undefined,
      }

      // Map sort options to API format
      switch (sortBy) {
        case "По дате изменения":
          params.sort = "recent"
          break
        case "По убыванию зарплат":
          params.sort = "pay_high"
          break
        case "По возрастанию зарплаты":
          params.sort = "pay_low"
          break
        default:
          params.sort = "recent"
      }

      const response = await api.getJobs(params)
      setSearchResults(response.jobs)
      setTotalPages(response.pages)
      setTotalJobs(response.total)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Load jobs on component mount
  useEffect(() => {
    handleSearch()
  }, [currentPage, pageSize])

  const handleApplyToJob = async (jobId: string) => {
    if (!user) return
    
    try {
      await api.applyForJob(jobId, "Заинтересован в этой вакансии")
      // Refresh search results to update application status
      handleSearch()
    } catch (error) {
      console.error('Application error:', error)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t('search.title')}</h1>

        {/* Основная поисковая строка */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Кнопка фильтров */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D]/10"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? t('search.hideFilters') : t('search.showFilters')}
          </Button>
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            {t('search.clearFilters')}
          </Button>
        </div>
      </div>

      {/* Расширенные фильтры */}
      {showFilters && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Фильтры поиска</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Поиск по полям */}
            <div className="space-y-3">
              <Label className="text-white font-medium">Искать только</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: "title", label: "в названии вакансии" },
                  { value: "company", label: "в названии компании" },
                  { value: "description", label: "в описании вакансии" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={searchIn.includes(option.value)}
                      onCheckedChange={() => handleSearchInChange(option.value)}
                    />
                    <Label htmlFor={option.value} className="text-gray-300 text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Исключить слова */}
            <div className="space-y-2">
              <Label className="text-white font-medium">Исключить слова</Label>
              <Input
                placeholder="Слова через запятую"
                value={excludeWords}
                onChange={(e) => setExcludeWords(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <Separator className="bg-gray-600" />

            {/* Специализация и отрасль */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">Специализация</Label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Любая" className="text-white">Любая</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec} className="text-white">
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Отрасль компании</Label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Любая" className="text-white">Любая</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry} className="text-white">
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Регион и метро */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">Регион</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Любая" className="text-white">Любая</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region} className="text-white">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Метро</Label>
                <Select value={selectedMetro} onValueChange={setSelectedMetro}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Любая" className="text-white">Любая</SelectItem>
                    {metroStations.map((station) => (
                      <SelectItem key={station} value={station} className="text-white">
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Уровень дохода */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showSalaryOnly"
                  checked={showSalaryOnly}
                  onCheckedChange={(checked) => setShowSalaryOnly(checked as boolean)}
                />
                <Label htmlFor="showSalaryOnly" className="text-white font-medium">
                  Показывать только вакансии с указанным уровнем дохода
                </Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">От</Label>
                  <Input
                    placeholder="0"
                    value={salaryFrom}
                    onChange={(e) => setSalaryFrom(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">До</Label>
                  <Input
                    placeholder="100000"
                    value={salaryTo}
                    onChange={(e) => setSalaryTo(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Частота выплат</Label>
                  <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Любая" className="text-white">Любая</SelectItem>
                      {paymentFrequencies.map((freq) => (
                        <SelectItem key={freq} value={freq} className="text-white">
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Образование и опыт */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">Образование</Label>
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Любая" className="text-white">Любая</SelectItem>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level} className="text-white">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Требуемый опыт работы</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Любая" className="text-white">Любая</SelectItem>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level} className="text-white">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Тип занятости */}
            <div className="space-y-3">
              <Label className="text-white font-medium">Тип занятости</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employmentTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={employmentType.includes(type)}
                      onCheckedChange={() => handleEmploymentTypeChange(type)}
                    />
                    <Label htmlFor={type} className="text-gray-300 text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* График работы и формат */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-white font-medium">График работы</Label>
                <div className="space-y-2">
                  {workSchedules.map((schedule) => (
                    <div key={schedule} className="flex items-center space-x-2">
                      <Checkbox
                        id={schedule}
                        checked={workSchedule.includes(schedule)}
                        onCheckedChange={() => handleWorkScheduleChange(schedule)}
                      />
                      <Label htmlFor={schedule} className="text-gray-300 text-sm">
                        {schedule}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white font-medium">Формат работы</Label>
                <div className="space-y-2">
                  {workFormats.map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={format}
                        checked={workFormat.includes(format)}
                        onCheckedChange={() => handleWorkFormatChange(format)}
                      />
                      <Label htmlFor={format} className="text-gray-300 text-sm">
                        {format}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Другие параметры */}
            <div className="space-y-3">
              <Label className="text-white font-medium">Другие параметры</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "С адресом",
                  "Доступные людям с инвалидностью",
                  "Без вакансий от кадровых агентств",
                  "Доступные с 14 лет",
                  "Меньше 10 откликов"
                ].map((param) => (
                  <div key={param} className="flex items-center space-x-2">
                    <Checkbox
                      id={param}
                      checked={otherParams.includes(param)}
                      onCheckedChange={() => handleOtherParamsChange(param)}
                    />
                    <Label htmlFor={param} className="text-gray-300 text-sm">
                      {param}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Сортировка и отображение */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">Сортировка</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {sortOptions.map((option) => (
                      <SelectItem key={option} value={option} className="text-white">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Выводить</Label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {timeFilters.map((filter) => (
                      <SelectItem key={filter} value={filter} className="text-white">
                        {filter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Показывать на странице</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {pageSizes.map((size) => (
                      <SelectItem key={size} value={size} className="text-white">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  className="w-full bg-[#457B9D] hover:bg-[#457B9D]/80"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Поиск...' : 'Найти вакансии'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t('search.results')} ({totalJobs})
          </h2>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-[#457B9D] text-[#457B9D]"
              >
                {t('search.back')}
              </Button>
              <span className="text-sm text-gray-300">
                {currentPage} {t('search.of')} {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-[#457B9D] text-[#457B9D]"
              >
                {t('search.next')}
              </Button>
            </div>
          )}
        </div>

        {searchResults.length === 0 && !isSearching ? (
          <Card className="bg-gray-800/80 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-[#457B9D]/20 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[#457B9D]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t('search.noResults')}
              </h3>
              <p className="text-gray-300">
                {t('search.noResultsDesc')}
              </p>
            </CardContent>
          </Card>
        ) : isSearching ? (
          <Card className="bg-gray-800/80 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-[#457B9D]/20 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[#457B9D] animate-pulse" />
              </div>
              <p className="text-gray-300">{t('search.searching')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searchResults.map((job) => (
              <Card key={job._id} className="bg-gray-800/80 border-gray-700 hover:border-[#457B9D]/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        {job.isUrgent && (
                          <Badge className="bg-red-500 text-white">{t('search.urgent')}</Badge>
                        )}
                        {job.isTrending && (
                          <Badge className="bg-green-500 text-white">{t('search.trending')}</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4" />
                          <span>{job.companyName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location.city}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-green-400">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">
                              ${job.pay.amount} {job.pay.type === 'hourly' ? t('search.perHour') : ''}
                            </span>
                          </div>
                          <Badge variant="outline" className="border-[#457B9D] text-[#457B9D]">
                            {job.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            {t('search.save')}
                          </Button>
                          {user?.role === 'applicant' && (
                            <Button
                              size="sm"
                              onClick={() => handleApplyToJob(job._id)}
                              disabled={job.hasApplied}
                              className="bg-[#457B9D] hover:bg-[#457B9D]/80"
                            >
                              {job.hasApplied ? t('search.applied') : t('search.apply')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
