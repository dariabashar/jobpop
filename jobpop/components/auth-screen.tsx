'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Phone, Briefcase, Search } from 'lucide-react';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState<'applicant' | 'employer'>('applicant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          companyName: formData.companyName || undefined,
          role: userRole,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1e3a5f] to-[#2d4a6b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-[#457B9D] to-[#5a9bd4] bg-clip-text text-transparent mb-2">
            JobPop
          </h1>
          <p className="text-gray-300">Найдите свою следующую возможность</p>
        </div>

        <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-600">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Добро пожаловать в JobPop</CardTitle>
            <CardDescription className="text-gray-400">
              {isLogin ? 'Войдите в свой аккаунт' : 'Создайте свой аккаунт'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#457B9D]">Вход</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-[#457B9D]">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Введите ваш email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Введите ваш пароль"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-500 bg-red-500/10">
                      <AlertDescription className="text-red-400">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] hover:from-[#5a9bd4] hover:to-[#457B9D] text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Вход...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                {/* Role Selection */}
                <div className="mb-6">
                  <Label className="text-white mb-3 block">Выберите тип аккаунта</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={userRole === 'applicant' ? 'default' : 'outline'}
                      onClick={() => setUserRole('applicant')}
                      className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                        userRole === 'applicant' 
                          ? 'bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] text-white' 
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Search className="w-5 h-5" />
                      <span className="text-sm font-medium">Я ищу работу</span>
                    </Button>
                    <Button
                      type="button"
                      variant={userRole === 'employer' ? 'default' : 'outline'}
                      onClick={() => setUserRole('employer')}
                      className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                        userRole === 'employer' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Briefcase className="w-5 h-5" />
                      <span className="text-sm font-medium">Я ищу сотрудников</span>
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">Имя</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="Имя"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">Фамилия</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Фамилия"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {userRole === 'employer' && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-white">Название компании</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="companyName"
                          name="companyName"
                          type="text"
                          placeholder="Название вашей компании"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Введите ваш email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Телефон (необязательно)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Введите номер телефона"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Создайте пароль"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-500 bg-red-500/10">
                      <AlertDescription className="text-red-400">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] hover:from-[#5a9bd4] hover:to-[#457B9D] text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Создание аккаунта...
                      </>
                    ) : (
                      `Создать аккаунт ${userRole === 'employer' ? 'работодателя' : 'соискателя'}`
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#457B9D] hover:text-[#5a9bd4] font-medium"
                >
                  {isLogin ? 'Зарегистрироваться' : 'Войти'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
