'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations = {
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.search': 'Поиск',
    'nav.jobs': 'Мои работы',
    'nav.post': 'Разместить',
    'nav.chat': 'Чат',
    'nav.profile': 'Профиль',
    'nav.wallet': 'Кошелек',
    'nav.notifications': 'Уведомления',
    'nav.settings': 'Настройки',
    'nav.logout': 'Выйти',
    
    // Home screen
    'home.title.employer': 'Найдите лучших сотрудников',
    'home.title.applicant': 'Найдите свою следующую работу',
    'home.subtitle.employer': 'Разместите вакансию и найдите подходящих кандидатов',
    'home.subtitle.applicant': 'Временные работы с гибким графиком и достойной оплатой',
    'home.postJob': 'Разместить вакансию',
    'home.findJobs': 'Найти вакансии',
    'home.startPosting': 'Начните размещать вакансии',
    'home.findPerfectJob': 'Найдите свою идеальную работу',
    'home.createFirstJob': 'Создайте первую вакансию и начните привлекать талантливых специалистов',
    'home.useSearch': 'Используйте поиск, чтобы найти подходящие вакансии в вашем регионе',
    'home.createFirstJobBtn': 'Создать первую вакансию',
    'home.startSearchBtn': 'Начать поиск',
    'home.avgPay': 'средняя оплата',
    'home.activeJobs': 'активных вакансий',
    'home.registered': 'зарегистрировано',
    
    // Search screen
    'search.title': 'Поиск вакансий',
    'search.placeholder': 'Ключевые слова, например: директор по продажам',
    'search.showFilters': 'Показать фильтры',
    'search.hideFilters': 'Скрыть фильтры',
    'search.clearFilters': 'Очистить фильтры',
    'search.results': 'Результаты',
    'search.noResults': 'Вакансии не найдены',
    'search.noResultsDesc': 'Попробуйте изменить параметры поиска или расширить область поиска',
    'search.searching': 'Поиск вакансий...',
    'search.back': 'Назад',
    'search.next': 'Вперед',
    'search.of': 'из',
    'search.urgent': 'Срочно',
    'search.trending': 'Популярно',
    'search.save': 'Сохранить',
    'search.apply': 'Откликнуться',
    'search.applied': 'Подано',
    'search.perHour': '/час',
    
    // Post job screen
    'postJob.title': 'Разместить вакансию',
    'postJob.verified': 'Верифицирован',
    'postJob.verificationRequired': 'Требуется верификация',
    'postJob.verificationDesc': 'Для обеспечения безопасности и доверия все работодатели должны пройти верификацию личности перед размещением вакансий.',
    'postJob.verificationSteps': 'Шаги верификации:',
    'postJob.uploadId': 'Загрузить удостоверение личности',
    'postJob.verificationSelfie': 'Сделать верификационное селфи',
    'postJob.businessInfo': 'Предоставить информацию о бизнесе (если применимо)',
    'postJob.startVerification': 'Начать процесс верификации',
    'postJob.jobDetails': 'Детали вакансии',
    'postJob.jobTitle': 'Название вакансии',
    'postJob.jobTitlePlaceholder': 'например, Курьер доставки еды',
    'postJob.category': 'Категория',
    'postJob.selectCategory': 'Выберите категорию',
    'postJob.description': 'Описание',
    'postJob.descriptionPlaceholder': 'Опишите требования к работе, обязанности и что вы ищете...',
    'postJob.photo': 'Фото вакансии (необязательно)',
    'postJob.photoDesc': 'Нажмите чтобы загрузить фото вакансии',
    'postJob.photoHelp': 'Это поможет привлечь лучших кандидатов',
    'postJob.schedule': 'Расписание и оплата',
    'postJob.date': 'Дата',
    'postJob.duration': 'Продолжительность (часы)',
    'postJob.durationPlaceholder': '3',
    'postJob.timeStart': 'Время начала',
    'postJob.timeEnd': 'Время окончания',
    'postJob.pay': 'Оплата ($)',
    'postJob.payPlaceholder': '25',
    'postJob.payType': 'Тип оплаты',
    'postJob.payTypeHourly': 'Почасовая',
    'postJob.payTypeFixed': 'Фиксированная',
    'postJob.payTypeCommission': 'Комиссионная',
    'postJob.address': 'Адрес',
    'postJob.addressPlaceholder': 'ул. Главная 123',
    'postJob.city': 'Город',
    'postJob.cityPlaceholder': 'Алматы',
    'postJob.tip': '💡 Совет: Будьте конкретны в требованиях и предлагайте конкурентоспособную оплату для привлечения лучших кандидатов!',
    'postJob.submit': 'Разместить вакансию и начать нанимать',
    'postJob.submitting': 'Размещение...',
    'postJob.success': 'Вакансия успешно размещена!',
    'postJob.error': 'Ошибка при размещении вакансии. Попробуйте еще раз.',
    
    // Categories
    'category.delivery': 'Доставка',
    'category.events': 'Мероприятия',
    'category.digital': 'Цифровое',
    'category.retail': 'Розница',
    'category.foodService': 'Общепит',
    'category.other': 'Другое',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.close': 'Закрыть',
    'common.yes': 'Да',
    'common.no': 'Нет',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.jobs': 'My Jobs',
    'nav.post': 'Post',
    'nav.chat': 'Chat',
    'nav.profile': 'Profile',
    'nav.wallet': 'Wallet',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Home screen
    'home.title.employer': 'Find the best employees',
    'home.title.applicant': 'Find your next job',
    'home.subtitle.employer': 'Post a job and find suitable candidates',
    'home.subtitle.applicant': 'Temporary jobs with flexible schedule and decent pay',
    'home.postJob': 'Post Job',
    'home.findJobs': 'Find Jobs',
    'home.startPosting': 'Start posting jobs',
    'home.findPerfectJob': 'Find your perfect job',
    'home.createFirstJob': 'Create your first job and start attracting talented professionals',
    'home.useSearch': 'Use search to find suitable jobs in your region',
    'home.createFirstJobBtn': 'Create first job',
    'home.startSearchBtn': 'Start searching',
    'home.avgPay': 'average pay',
    'home.activeJobs': 'active jobs',
    'home.registered': 'registered',
    
    // Search screen
    'search.title': 'Job Search',
    'search.placeholder': 'Keywords, e.g.: sales director',
    'search.showFilters': 'Show filters',
    'search.hideFilters': 'Hide filters',
    'search.clearFilters': 'Clear filters',
    'search.results': 'Results',
    'search.noResults': 'No jobs found',
    'search.noResultsDesc': 'Try changing search parameters or expanding search area',
    'search.searching': 'Searching jobs...',
    'search.back': 'Back',
    'search.next': 'Next',
    'search.of': 'of',
    'search.urgent': 'Urgent',
    'search.trending': 'Trending',
    'search.save': 'Save',
    'search.apply': 'Apply',
    'search.applied': 'Applied',
    'search.perHour': '/hour',
    
    // Post job screen
    'postJob.title': 'Post Job',
    'postJob.verified': 'Verified',
    'postJob.verificationRequired': 'Verification Required',
    'postJob.verificationDesc': 'For security and trust, all employers must complete identity verification before posting jobs.',
    'postJob.verificationSteps': 'Verification steps:',
    'postJob.uploadId': 'Upload ID document',
    'postJob.verificationSelfie': 'Take verification selfie',
    'postJob.businessInfo': 'Provide business information (if applicable)',
    'postJob.startVerification': 'Start verification process',
    'postJob.jobDetails': 'Job Details',
    'postJob.jobTitle': 'Job Title',
    'postJob.jobTitlePlaceholder': 'e.g., Food delivery courier',
    'postJob.category': 'Category',
    'postJob.selectCategory': 'Select category',
    'postJob.description': 'Description',
    'postJob.descriptionPlaceholder': 'Describe job requirements, responsibilities and what you are looking for...',
    'postJob.photo': 'Job photo (optional)',
    'postJob.photoDesc': 'Click to upload job photo',
    'postJob.photoHelp': 'This will help attract the best candidates',
    'postJob.schedule': 'Schedule and Payment',
    'postJob.date': 'Date',
    'postJob.duration': 'Duration (hours)',
    'postJob.durationPlaceholder': '3',
    'postJob.timeStart': 'Start time',
    'postJob.timeEnd': 'End time',
    'postJob.pay': 'Payment ($)',
    'postJob.payPlaceholder': '25',
    'postJob.payType': 'Payment type',
    'postJob.payTypeHourly': 'Hourly',
    'postJob.payTypeFixed': 'Fixed',
    'postJob.payTypeCommission': 'Commission',
    'postJob.address': 'Address',
    'postJob.addressPlaceholder': 'Main St 123',
    'postJob.city': 'City',
    'postJob.cityPlaceholder': 'Almaty',
    'postJob.tip': '💡 Tip: Be specific in requirements and offer competitive pay to attract the best candidates!',
    'postJob.submit': 'Post job and start hiring',
    'postJob.submitting': 'Posting...',
    'postJob.success': 'Job posted successfully!',
    'postJob.error': 'Error posting job. Please try again.',
    
    // Categories
    'category.delivery': 'Delivery',
    'category.events': 'Events',
    'category.digital': 'Digital',
    'category.retail': 'Retail',
    'category.foodService': 'Food Service',
    'category.other': 'Other',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('jobpop_language') as Language;
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('jobpop_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
