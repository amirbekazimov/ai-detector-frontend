import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  ArrowLeft, 
  Bot, 
  Users, 
  Eye, 
  Globe,
} from 'lucide-react';
import { dashboardApi, sitesApi, type SiteStats, type DailyStats, type BotTypesStats } from '@/lib/api';
import { toast } from 'sonner';

const SiteDetailsPage: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(null);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [botTypesStats, setBotTypesStats] = useState<BotTypesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  useEffect(() => {
    if (siteId) {
      fetchSiteData();
    }
  }, [siteId, selectedPeriod]);

  const fetchSiteData = async () => {
    if (!siteId) return;

    try {
      setIsLoading(true);
      const days = parseInt(selectedPeriod);
      console.log('Fetching site data for siteId:', siteId, 'days:', days); // Отладка
      
      const [sitesResponse, statsResponse, botTypesResponse] = await Promise.all([
        sitesApi.getSites(),
        dashboardApi.getSiteStats(siteId, days),
        dashboardApi.getBotTypesStats(siteId, days)
      ]);
      
      console.log('Sites response:', sitesResponse.data); // Отладка
      const currentSite = sitesResponse.data.find((s: any) => s.site_id === siteId || s.id === siteId);
      console.log('Current site found:', currentSite); // Отладка
      
      setSite(currentSite)
      setSiteStats(statsResponse.data);
      setBotTypesStats(botTypesResponse.data);
      
      // Пока не реализовано - пустой массив
      setDailyStats([]);
    } catch (error) {
      console.error('Site data error:', error); // Отладка
      toast.error('Не удалось загрузить данные сайта');
    } finally {
      setIsLoading(false);
    }
  };

  // Bot types pie chart data
  const botTypesPieData = botTypesStats?.bot_types ? 
    Object.entries(botTypesStats.bot_types).map(([botType, count], index) => ({
      name: botType,
      value: count,
      color: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'][index % 7]
    })) : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };


  if (isLoading) {
    return (
      <div className="space-y-6 min-h-[600px]">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          
          {/* Chart skeleton */}
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Сайт не найден</h2>
        <Button onClick={() => navigate('/sites')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к сайтам
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/sites')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Globe className="w-8 h-8 mr-3 text-blue-600" />
              {site.domain}
            </h1>
            <p className="text-gray-600">Детальная аналитика и отслеживание посетителей</p>
          </div>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 день</SelectItem>
            <SelectItem value="7">7 дней</SelectItem>
            <SelectItem value="14">14 дней</SelectItem>
            <SelectItem value="30">30 дней</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего визитов ботов</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {siteStats?.total_events ? (
              <>
                <div className="text-2xl font-bold">{siteStats.total_events.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  За последние {selectedPeriod} дней
                </p>
              </>
            ) : (
              <div className="text-sm text-gray-500">Пока нет информации</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Типы ботов</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {botTypesStats?.bot_types && Object.keys(botTypesStats.bot_types).length > 0 ? (
              <>
                <div className="text-2xl font-bold text-blue-600">{Object.keys(botTypesStats.bot_types).length}</div>
                <p className="text-xs text-muted-foreground">
                  Различных типов
                </p>
              </>
            ) : (
              <div className="text-sm text-gray-500">Пока нет информации</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Уникальные боты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {siteStats?.unique_visitors ? (
              <>
                <div className="text-2xl font-bold text-green-600">{siteStats.unique_visitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Различных ботов
                </p>
              </>
            ) : (
              <div className="text-sm text-gray-500">Пока нет информации</div>
            )}
          </CardContent>
        </Card>

      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Bot Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Типы AI ботов</CardTitle>
              <CardDescription>Распределение по типам ботов</CardDescription>
            </CardHeader>
            <CardContent>
              {botTypesPieData.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={botTypesPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {botTypesPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {botTypesPieData.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-sm">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Пока нет информации
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Daily Bot Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Ежедневный трафик ботов</CardTitle>
              <CardDescription>Визиты ботов во времени</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyStats.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => formatDate(value)}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="ai_bot_events" 
                        stackId="1"
                        stroke="#3B82F6" 
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        name="Визиты ботов"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Пока нет информации
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bot Types Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Тренд типов ботов</CardTitle>
              <CardDescription>Активность различных типов ботов во времени</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyStats.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => formatDate(value)}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ai_bot_events" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Визиты ботов"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Пока нет информации
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteDetailsPage;
