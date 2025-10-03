import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Globe, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink,
  Calendar,
  Bot,
  Eye,
  Code
} from 'lucide-react';
import { sitesApi, type Site } from '@/lib/api';
import { toast } from 'sonner';

const SitesPage: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setIsLoading(true);
      const response = await sitesApi.getSites();
      console.log('Sites API response:', response.data);
      
      // Ensure we have an array
      const sitesData = Array.isArray(response.data) ? response.data : [];
      setSites(sitesData);
    } catch (error) {
      console.error('Sites fetch error:', error);
      toast.error('Не удалось загрузить сайты');
      setSites([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !newName.trim()) return;

    try {
      setIsCreating(true);
      await sitesApi.createSite(newName.trim(), newDomain.trim());
      toast.success('Сайт успешно создан!');
      setNewDomain('');
      setNewName('');
      setIsDialogOpen(false);
      fetchSites();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось создать сайт');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSite = async (siteId: string, domain: string) => {
    if (!confirm(`Are you sure you want to delete ${domain}? This action cannot be undone.`)) {
      return;
    }

    try {
      await sitesApi.deleteSite(siteId);
      toast.success('Сайт успешно удален!');
      fetchSites();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось удалить сайт');
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление сайтами</h1>
          <p className="text-gray-600">Управляйте отслеживаемыми сайтами и получайте коды отслеживания</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить сайт
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый сайт</DialogTitle>
              <DialogDescription>
                Добавьте новый веб-сайт для начала отслеживания визитов AI ботов
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название сайта</Label>
                <Input
                  id="name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Мой сайт"
                  required
                />
                <p className="text-sm text-gray-600">
                  Введите понятное название для вашего сайта
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Домен</Label>
                <Input
                  id="domain"
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  required
                />
                <p className="text-sm text-gray-600">
                  Введите домен без http:// или https://
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Создание...' : 'Создать сайт'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши сайты</CardTitle>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет сайтов</h3>
              <p className="mt-1 text-sm text-gray-500">
                Начните с добавления вашего первого веб-сайта.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить сайт
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Домен</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Визиты AI ботов</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites && sites.length > 0 ? sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-400" />
                        {site.name || site.domain}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {site.domain}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Активен</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Bot className="w-4 h-4 mr-1 text-red-500" />
                        {site.ai_bot_events?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(site.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/sites/${site.site_id || site.id}`}
                          title="Просмотр деталей"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copySnippet(site.site_id || String(site.id))}
                          title="Копировать код"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/sites/${String(site.id)}/tracking-code`, '_blank')}
                          title="Получить Tracking Code"
                        >
                          <Code className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://${site.domain}`, '_blank')}
                          title="Посетить сайт"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSite(String(site.id), site.domain)}
                          title="Удалить сайт"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Сайты не найдены. Создайте первый сайт для начала работы.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Руководство по интеграции</CardTitle>
          <CardDescription>
            Два метода детекции: JavaScript (простой) и Server-side (надежный)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Method Selection */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Выберите подходящий метод интеграции:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h5 className="font-medium text-green-800">🌐 JavaScript Method</h5>
                <p className="text-sm text-green-700 mt-1">Требует javascript включен</p>
              </div>
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <h5 className="font-medium text-purple-800">🛡️ Server-side Method</h5>
                <p className="text-sm text-purple-700 mt-1">Работает с любыми ботами</p>
              </div>
            </div>
          </div>

          {/* JavaScript Integration */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Bot className="w-5 h-5 mr-2 text-green-600" />
              JavaScript Метод (Client-side)
            </h3>
            <div className="space-y-2">
              <h4 className="font-medium">Шаг 1: Получите код отслеживания</h4>
              <p className="text-sm text-gray-600">
                Нажмите кнопку <code className="bg-gray-100 px-1 rounded">Code</code> рядом с вашим сайтом, чтобы получить готовый к установке код.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Шаг 2: Добавьте на ваш сайт</h4>
              <p className="text-sm text-gray-600">
                Вставьте код перед закрывающим тегом <code>&lt;/body&gt;</code> на всех страницах вашего сайта.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Пример кода:</h4>
              <code className="text-sm text-gray-700 block">
{`<!-- AI Detector Tracking Code -->
<script src="http://localhost:8000/api/v1/tracking/YOUR_SITE_ID.js"></script>
<!-- End AI Detector -->`}
              </code>
            </div>
          </div>

          {/* Server-side Integration */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Globe className="w-5 h-5 mr-2 text-purple-600" />
              Server-side Метод (Backend)
            </h3>
            <div className="space-y-2">
              <h4 className="font-medium">Шаг 1: Получите server code</h4>
              <p className="text-sm text-gray-600">
                Нажмите кнопку <code className="bg-gray-100 px-1 rounded">Code</code> и выберите ваш язык программирования (PHP, Python, Node.js, Nginx, Apache).
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Шаг 2: Установите на сервер</h4>
              <p className="text-sm text-gray-600">
                Разместите сгенерированный код на вашем сервере и интегрируйте с вашим веб-фреймворком.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-sm mb-1">PHP</h5>
                <code className="text-xs text-gray-600 block">
{`include_once 'ai_detector_*.php';`}
                </code>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-sm mb-1">Python</h5>
                <code className="text-xs text-gray-600 block">
{`from ai_detector import *
app.before_request()()`}
                </code>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-sm mb-1">Node.js</h5>
                <code className="text-xs text-gray-600 block">
{`app.use(detector.middleware());`}
                </code>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Сравнение методов</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Особенность</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">JavaScript</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Server-side</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm">Простота установки</td>
                    <td className="px-4 py-2 text-center">
                      <Badge className="bg-green-100 text-green-800">⭐⭐⭐</Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge className="bg-orange-100 text-orange-800">⭐⭐</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm">Детекция ChatGPT</td>
                    <td className="px-4 py-2 text-center">
                      <Badge className="bg-red-100 text-red-800">❌</Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge className="bg-green-100 text-green-800">✅</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm">Детекция других ботов</td>
                    <td className="px-4 py-2 text-center">
                      <Badge className="bg-green-100 text-green-800">✅</Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge className="bg-green-100 text-green-800">✅</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm">IP детекция</td>
                    <td className="px-4 py-2 text-center">
                      <Badge className="bg-gray-100 text-gray-800">❓</Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge className="bg-green-100 text-green-800">✅</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">💡 Рекомендация:</h4>
            <p className="text-sm text-amber-700">
              Для <strong>100% надежной детекции</strong> рекомендуется использовать <strong>Server-side метод</strong>. 
              Он детектирует ChatGPT и другие AI боты даже когда JavaScript отключен.
              JavaScript метод подходит для быстрого старта и детекции современных ботов.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SitesPage;
