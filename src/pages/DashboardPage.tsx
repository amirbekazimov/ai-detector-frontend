import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Line
} from 'recharts';
import { 
  Globe, 
  Bot, 
  Users, 
  Eye,
  Copy
} from 'lucide-react';
import { dashboardApi, sitesApi, type Site, type SiteStats, type DailyStats, type BotTypesStats } from '@/lib/api';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [botTypesStats, setBotTypesStats] = useState<BotTypesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardApi.getSitesWithStats();
      const sitesData = response.data.sites; // Backend возвращает {sites: [...], total_sites: N}
      console.log('Sites data:', sitesData);
      setSites(sitesData);
      
      if (Array.isArray(sitesData) && sitesData.length > 0) {
        setSelectedSite(sitesData[0]);
        await fetchSiteDetails(sitesData[0].site_id || sitesData[0].id);
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Не удалось загрузить данные dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSiteDetails = async (siteId: string) => {
    try {
      console.log('Fetching site details for siteId:', siteId); // Отладка
      const [statsResponse, dailyResponse, botTypesResponse] = await Promise.all([
        dashboardApi.getSiteStats(siteId, 7),
        dashboardApi.getDailyStats(siteId, 7),
        dashboardApi.getBotTypesStats(siteId, 7)
      ]);
      
      console.log('Site stats response:', statsResponse.data); // Отладка
      console.log('Daily stats response:', dailyResponse.data); // Отладка
      console.log('Bot types response:', botTypesResponse.data); // Отладка
      
      setSiteStats(statsResponse.data);
      setDailyStats(dailyResponse.data);
      setBotTypesStats(botTypesResponse.data);
    } catch (error) {
      console.error('Site details error:', error); // Отладка
      toast.error('Не удалось загрузить детали сайта');
    }
  };

  const handleSiteSelect = async (site: Site) => {
    setSelectedSite(site);
    await fetchSiteDetails(site.site_id || site.id);
  };

  const copySnippet = async (siteId: string) => {
    try {
      const response = await sitesApi.getSnippet(siteId);
      const snippet = response.data.js_snippet;
      
      await navigator.clipboard.writeText(snippet);
      toast.success('Код скопирован в буфер обмена!');
    } catch (error) {
      console.error('Snippet error:', error);
      toast.error('Не удалось скопировать код');
    }
  };

  // Bot types pie chart data
  const botTypesPieData = botTypesStats?.bot_types ? 
    Object.entries(botTypesStats.bot_types).map(([botType, count], index) => ({
      name: botType,
      value: count,
      color: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'][index % 7]
    })) : [];

  const totalBotVisits = Array.isArray(sites) ? sites.reduce((sum, site) => sum + (site.ai_bot_events || 0), 0) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <p className="text-gray-600">Мониторинг активности AI ботов на ваших сайтах</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего сайтов</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(sites) ? sites.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              Активные веб-сайты
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего визитов ботов</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBotVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              За все время
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Типы ботов</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{botTypesStats?.bot_types ? Object.keys(botTypesStats.bot_types).length : 0}</div>
            <p className="text-xs text-muted-foreground">
              Различных типов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Уникальные боты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{siteStats?.unique_visitors || 0}</div>
            <p className="text-xs text-muted-foreground">
              Различных ботов
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sites Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ваши сайты</CardTitle>
            <CardDescription>Выберите сайт для просмотра детальной аналитики</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(sites) ? sites.map((site) => (
                <div
                  key={site.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSite?.id === site.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSiteSelect(site)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{site.name || site.domain}</h3>
                      <p className="text-sm text-gray-600">
                        {site.domain} • {site.total_events?.toLocaleString() || 0} всего визитов
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copySnippet(site.site_id || site.id);
                        }}
                        title="Копировать JavaScript код"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={site.ai_bot_percentage || 0} 
                      className="h-2"
                    />
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Нет доступных сайтов</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bot Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Типы AI ботов</CardTitle>
            <CardDescription>Распределение по типам ботов</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Chart */}
      {selectedSite && dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ежедневная активность - {selectedSite.domain}</CardTitle>
            <CardDescription>Трафик за последние 7 дней</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="total_events" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Всего событий"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ai_bot_events" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="События AI ботов"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="human_events" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="События людей"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top AI Bots */}
      {siteStats && siteStats.top_bots && siteStats.top_bots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Топ AI боты</CardTitle>
            <CardDescription>Самые активные AI боты на {selectedSite?.domain}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {siteStats.top_bots.map((bot, index) => (
                <div key={bot.bot_name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <Bot className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{bot.bot_name}</h4>
                      <p className="text-sm text-gray-600">{bot.visits} визитов</p>
                    </div>
                  </div>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
