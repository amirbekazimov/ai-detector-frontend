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
  Eye
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
      setSites(response.data);
    } catch (error) {
      toast.error('Не удалось загрузить сайты');
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
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <CardDescription>
            {sites.length === 0 
              ? 'Сайты еще не добавлены. Добавьте первый сайт для начала отслеживания.' 
              : `${sites.length} сайт${sites.length === 1 ? '' : sites.length < 5 ? 'а' : 'ов'} настроено`
            }
          </CardDescription>
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
                  <TableHead>Всего визитов</TableHead>
                  <TableHead>Визиты AI ботов</TableHead>
                  <TableHead>Процент AI</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
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
                        <Eye className="w-4 h-4 mr-1 text-gray-400" />
                        {site.total_events?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Bot className="w-4 h-4 mr-1 text-red-500" />
                        {site.ai_bot_events?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={site.ai_bot_percentage && site.ai_bot_percentage > 20 ? 'destructive' : 'secondary'}
                      >
                        {site.ai_bot_percentage?.toFixed(1) || 0}%
                      </Badge>
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
                          onClick={() => copySnippet(site.site_id || site.id)}
                          title="Копировать код"
                        >
                          <Copy className="w-4 h-4" />
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
                          onClick={() => handleDeleteSite(site.id, site.domain)}
                          title="Удалить сайт"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
            Как добавить отслеживание AI Detector на ваш сайт
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Шаг 1: Скопируйте код отслеживания</h4>
            <p className="text-sm text-gray-600">
              Нажмите кнопку копирования рядом с вашим сайтом, чтобы получить код отслеживания.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Шаг 2: Добавьте на ваш сайт</h4>
            <p className="text-sm text-gray-600">
              Вставьте код в секцию &lt;head&gt; вашего сайта, желательно перед закрывающим тегом &lt;/head&gt;.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Шаг 3: Проверьте отслеживание</h4>
            <p className="text-sm text-gray-600">
              Посетите ваш сайт и проверьте панель управления, чтобы убедиться, что визиты отслеживаются.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Пример кода:</h4>
            <code className="text-sm text-gray-700">
              {`<!-- AI Detector Script -->
<script>
(function() {
    var script = document.createElement('script');
    script.src = 'http://localhost:8000/api/v1/tracking/YOUR_SITE_ID.js';
    script.async = true;
    document.head.appendChild(script);
})();
</script>
<!-- Конец AI Detector Script -->`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SitesPage;
