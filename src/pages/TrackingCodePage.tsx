import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Copy, 
  ExternalLink,
  Bot,
  Code,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { sitesApi, type TrackingCode } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const TrackingCodePage: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [trackingData, setTrackingData] = useState<TrackingCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [serverCodeData, setServerCodeData] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('php');
  const [showServerCode, setShowServerCode] = useState(false);

  useEffect(() => {
    fetchTrackingCode();
  }, [siteId]);

  const fetchTrackingCode = async () => {
    if (!siteId) return;

    try {
      setIsLoading(true);
      const response = await sitesApi.getTrackingCode(siteId);
      setTrackingData(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось загрузить tracking code');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServerCode = async () => {
    if (!siteId) return;

    try {
      const response = await sitesApi.getServerCode(siteId, selectedLanguage);
      setServerCodeData(response.data);
      setShowServerCode(true);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось загрузить server code');
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success(`${section} скопирован в буфер обмена!`);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast.error('Не удалось скопировать');
    }
  };

  const testServerPage = () => {
    if (trackingData?.server_page_url) {
      window.open(trackingData.server_page_url, '_blank');
      toast.info('Открыта страница для тестирования серверной детекции');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Сайт не найден</h1>
          <p className="text-gray-600">Не удалось загрузить данные tracking кода</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tracking Code - {trackingData.site_name}
        </h1>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <span className="text-lg text-gray-600">{trackingData.domain}</span>
          <Badge variant="secondary">Site ID: {trackingData.site_id}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JavaScript Tracking Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-green-600" />
              JavaScript Tracking Code
            </CardTitle>
            <CardDescription>
              Вставьте этот код на ваш сайт для автоматической детекции AI ботов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {trackingData.tracking_code}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => copyToClipboard(trackingData.tracking_code, 'JavaScript код')}
                className="flex items-center gap-2"
                variant={copiedSection === 'JavaScript код' ? 'default' : 'outline'}
              >
                {copiedSection === 'JavaScript код' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedSection === 'JavaScript код' ? 'Скопировано!' : 'Копировать'}
              </Button>
              <Button 
                onClick={() => window.open(trackingData.script_url, '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Открыть Script URL
              </Button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800">Автоматическая детекция</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Этот скрипт автоматически детектирует ChatGPT, GPTBot, Perplexity и другие AI боты при посещении вашего сайта.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Server-Side Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              Server-Side Detection
            </CardTitle>
            <CardDescription>
              Альтернативный метод детекции для AI ботов, которые не выполняют JavaScript
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">Server Page URL:</span>
              </div>
              <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                {trackingData.server_page_url}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => copyToClipboard(trackingData.server_page_url, 'Server URL')}
                className="flex items-center gap-2"
                variant={copiedSection === 'Server URL' ? 'default' : 'outline'}
              >
                {copiedSection === 'Server URL' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedSection === 'Server URL' ? 'Скопировано!' : 'Копировать URL'}
              </Button>
              <Button 
                onClick={testServerPage}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Протестировать
              </Button>
            </div>
            
            {/* Server Code Section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Code className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">Server Code Integration:</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="nodejs">Node.js</SelectItem>
                      <SelectItem value="nginx">Nginx</SelectItem>
                      <SelectItem value="apache">Apache</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={fetchServerCode}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    Получить Server Code
                  </Button>
                </div>
                
                {showServerCode && serverCodeData && (
                  <div className="space-y-3">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-96">
                      <pre className="whitespace-pre-wrap">{serverCodeData.server_code}</pre>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(serverCodeData.server_code, 'Server Code')}
                        className="flex items-center gap-2"
                        variant={copiedSection === 'Server Code' ? 'default' : 'outline'}
                        size="sm"
                      >
                        {copiedSection === 'Server Code' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedSection === 'Server Code' ? 'Скопировано!' : 'Копировать'}
                      </Button>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-800 text-sm">Файл готов для использования</h4>
                          <p className="text-xs text-blue-700 mt-1">
                            Сохраните код как файл {serverCodeData.filename} на вашем сервере и включите его в ваши страницы.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-purple-800">Для тестирования</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Дайте этот URL ChatGPT для проверки серверной детекции. Работает даже когда JavaScript отключен.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Пошаговые инструкции</CardTitle>
          <CardDescription>
            Следуйте этим шагам для настройки AI бот детекции
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{trackingData.instructions.step1}</h4>
                <p className="text-sm text-gray-600 mt-1">Рекомендуется размещать перед закрывающим тегом &lt;/body&gt;</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{trackingData.instructions.step2}</h4>
                <p className="text-sm text-gray-600 mt-1">Может занять несколько минут для начала детекции</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{trackingData.instructions.step3}</h4>
                <p className="text-sm text-gray-600 mt-1">Дайт ChatGPT Server Page URL для проверки работы</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{trackingData.instructions.step4}</h4>
                <p className="text-sm text-gray-600 mt-1">Статистика обновляется в реальном времени</p>
              </div>
            </div>
            {trackingData.instructions.note && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Важное замечание</h4>
                    <p className="text-sm text-yellow-700 mt-1">{trackingData.instructions.note}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supported AI Bots */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Поддерживаемые AI боты</CardTitle>
          <CardDescription>
            Наша система детектирует следующие AI системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Bot className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium">ChatGPT</div>
              <div className="text-xs text-gray-500">User + GPTBot</div>
            </div>
            <div className="text-center">
              <Bot className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Perplexity</div>
              <div className="text-xs text-gray-500">PerplexityBot</div>
            </div>
            <div className="text-center">
              <Bot className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Claude</div>
              <div className="text-xs text-gray-500">Anthropic</div>
            </div>
            <div className="text-center">
              <Bot className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Google Bard</div>
              <div className="text-xs text-gray-500">BardBot</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default TrackingCodePage;
