import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ImageFilters {
  brightness: number;
  contrast: number;
  grayscale: number;
  sepia: number;
}

interface TextOverlay {
  text: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
}

export default function Index() {
  const [image, setImage] = useState<string | null>(null);
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    sepia: 0,
  });
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
  const [textOverlay, setTextOverlay] = useState<TextOverlay>({
    text: 'Суяргулаев А.А.',
    fontSize: 48,
    color: '#FFFFFF',
    x: 50,
    y: 50,
  });
  const [showText, setShowText] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          setOriginalAspectRatio(aspectRatio);
          setWidth(img.width);
          setHeight(img.height);
          setImage(event.target?.result as string);
          toast({
            title: 'Изображение загружено',
            description: `Размер: ${img.width}x${img.height}px`,
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWidthChange = (value: number) => {
    setWidth(value);
    if (maintainAspectRatio) {
      setHeight(Math.round(value / originalAspectRatio));
    }
  };

  const handleHeightChange = (value: number) => {
    setHeight(value);
    if (maintainAspectRatio) {
      setWidth(Math.round(value * originalAspectRatio));
    }
  };

  const applyFiltersAndText = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      
      ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)`;
      ctx.drawImage(img, 0, 0, width, height);
      
      if (showText && textOverlay.text) {
        ctx.filter = 'none';
        ctx.font = `${textOverlay.fontSize}px Roboto`;
        ctx.fillStyle = textOverlay.color;
        ctx.textBaseline = 'top';
        ctx.fillText(textOverlay.text, textOverlay.x, textOverlay.y);
      }
    };
    img.src = image;
  };

  useEffect(() => {
    if (image) {
      applyFiltersAndText();
    }
  }, [image, filters, width, height, textOverlay, showText]);

  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
    
    toast({
      title: 'Изображение сохранено',
      description: 'Файл успешно загружен на ваше устройство',
    });
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      sepia: 0,
    });
    toast({
      title: 'Фильтры сброшены',
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <header className="border-b border-[#8E9196]/20 bg-[#1A1F2C]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Icon name="Image" size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold">Редактор изображений</h1>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-[#1A1F2C] hover:bg-white/90"
            >
              <Icon name="Upload" size={18} className="mr-2" />
              Загрузить изображение
            </Button>
          </div>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-[#222831] border-[#8E9196]/20 p-6">
              <Tabs defaultValue="resize" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#1A1F2C]">
                  <TabsTrigger value="resize" className="data-[state=active]:bg-white/10">
                    <Icon name="Maximize2" size={16} className="mr-2" />
                    Размер
                  </TabsTrigger>
                  <TabsTrigger value="filters" className="data-[state=active]:bg-white/10">
                    <Icon name="Sliders" size={16} className="mr-2" />
                    Фильтры
                  </TabsTrigger>
                  <TabsTrigger value="text" className="data-[state=active]:bg-white/10">
                    <Icon name="Type" size={16} className="mr-2" />
                    Текст
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="resize" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Ширина (px)</Label>
                      <span className="text-sm text-[#8E9196]">{width}</span>
                    </div>
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="bg-[#1A1F2C] border-[#8E9196]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Высота (px)</Label>
                      <span className="text-sm text-[#8E9196]">{height}</span>
                    </div>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="bg-[#1A1F2C] border-[#8E9196]/20"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="aspect-ratio"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="aspect-ratio" className="cursor-pointer">
                      Сохранять пропорции
                    </Label>
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Яркость</Label>
                      <span className="text-sm text-[#8E9196]">{filters.brightness}%</span>
                    </div>
                    <Slider
                      value={[filters.brightness]}
                      onValueChange={([value]) => setFilters({ ...filters, brightness: value })}
                      min={0}
                      max={200}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Контрастность</Label>
                      <span className="text-sm text-[#8E9196]">{filters.contrast}%</span>
                    </div>
                    <Slider
                      value={[filters.contrast]}
                      onValueChange={([value]) => setFilters({ ...filters, contrast: value })}
                      min={0}
                      max={200}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Черно-белый</Label>
                      <span className="text-sm text-[#8E9196]">{filters.grayscale}%</span>
                    </div>
                    <Slider
                      value={[filters.grayscale]}
                      onValueChange={([value]) => setFilters({ ...filters, grayscale: value })}
                      min={0}
                      max={100}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Сепия</Label>
                      <span className="text-sm text-[#8E9196]">{filters.sepia}%</span>
                    </div>
                    <Slider
                      value={[filters.sepia]}
                      onValueChange={([value]) => setFilters({ ...filters, sepia: value })}
                      min={0}
                      max={100}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="w-full border-[#8E9196]/20 hover:bg-white/5"
                  >
                    <Icon name="RotateCcw" size={16} className="mr-2" />
                    Сбросить фильтры
                  </Button>
                </TabsContent>

                <TabsContent value="text" className="space-y-6 mt-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-text"
                      checked={showText}
                      onChange={(e) => setShowText(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="show-text" className="cursor-pointer">
                      Показать текст
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Текст</Label>
                    <Input
                      value={textOverlay.text}
                      onChange={(e) => setTextOverlay({ ...textOverlay, text: e.target.value })}
                      placeholder="Введите текст"
                      className="bg-[#1A1F2C] border-[#8E9196]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Размер шрифта</Label>
                      <span className="text-sm text-[#8E9196]">{textOverlay.fontSize}px</span>
                    </div>
                    <Slider
                      value={[textOverlay.fontSize]}
                      onValueChange={([value]) => setTextOverlay({ ...textOverlay, fontSize: value })}
                      min={12}
                      max={120}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Цвет текста</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={textOverlay.color}
                        onChange={(e) => setTextOverlay({ ...textOverlay, color: e.target.value })}
                        className="w-20 h-10 bg-[#1A1F2C] border-[#8E9196]/20"
                      />
                      <Input
                        type="text"
                        value={textOverlay.color}
                        onChange={(e) => setTextOverlay({ ...textOverlay, color: e.target.value })}
                        className="flex-1 bg-[#1A1F2C] border-[#8E9196]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Позиция X</Label>
                      <Input
                        type="number"
                        value={textOverlay.x}
                        onChange={(e) => setTextOverlay({ ...textOverlay, x: Number(e.target.value) })}
                        className="bg-[#1A1F2C] border-[#8E9196]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Позиция Y</Label>
                      <Input
                        type="number"
                        value={textOverlay.y}
                        onChange={(e) => setTextOverlay({ ...textOverlay, y: Number(e.target.value) })}
                        className="bg-[#1A1F2C] border-[#8E9196]/20"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <Button
                  onClick={downloadImage}
                  disabled={!image}
                  className="w-full bg-white text-[#1A1F2C] hover:bg-white/90"
                >
                  <Icon name="Download" size={18} className="mr-2" />
                  Скачать результат
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-[#222831] border-[#8E9196]/20 p-6 min-h-[600px]">
              {!image ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Icon name="ImagePlus" size={48} className="text-[#8E9196]" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-3">Загрузите изображение</h2>
                  <p className="text-[#8E9196] mb-6 max-w-md">
                    Выберите файл для начала редактирования. Поддерживаются форматы JPG, PNG, GIF
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-[#1A1F2C] hover:bg-white/90"
                  >
                    <Icon name="Upload" size={18} className="mr-2" />
                    Выбрать файл
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-4 text-sm text-[#8E9196]">
                    Предпросмотр результата
                  </div>
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto border border-[#8E9196]/20 rounded-lg"
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
