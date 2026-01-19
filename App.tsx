
import React, { useState, useRef, useCallback } from 'react';
import type { CardFormData } from './types';
import CardForm from './components/CardForm';
import GeneratedCard from './components/GeneratedCard';
import SparklesIcon from './components/icons/SparklesIcon';
import PhotoIcon from './components/icons/PhotoIcon';
import { generateBackgroundImage, generateGreeting } from './services/geminiService';

const App: React.FC = () => {
  const [formData, setFormData] = useState<CardFormData>({
    name: '',
    photo: null,
    date: '',
    age: '',
    logo: null,
    profession: '',
  });
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = src;
      });
  };
  
  const drawCardOnCanvas = useCallback(async (bgBase64: string, data: CardFormData, greeting: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1080;
      canvas.height = 1920;
      
      const textColor = '#0D3D6F'; // Dark Blue
      const cheerfulFont = 'Verdana';

      const bgPromise = loadImage(`data:image/png;base64,${bgBase64}`);
      const photoPromise = data.photo ? fileToDataUrl(data.photo).then(loadImage) : Promise.resolve(null);
      const logoPromise = data.logo ? fileToDataUrl(data.logo).then(loadImage) : Promise.resolve(null);

      const [bgImage, photoImage, logoImage] = await Promise.all([bgPromise, photoPromise, logoPromise]);
      
      // 1. Draw Background
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      
      // 2. Draw Photo in a larger Polaroid
      const polaroidWidth = 800;
      const polaroidHeight = 900;
      const polaroidX = (canvas.width - polaroidWidth) / 2;
      const polaroidY = canvas.height * 0.08;
      const photoWidth = 720;
      const photoHeight = 720;
      const photoX = polaroidX + (polaroidWidth - photoWidth) / 2;
      const photoY = polaroidY + 40;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.roundRect(polaroidX, polaroidY, polaroidWidth, polaroidHeight, 20);
      ctx.fill();
      ctx.restore();

      if (photoImage) {
          // Fit image within the photo area, cropping if necessary (object-fit: cover)
          const imgAspectRatio = photoImage.width / photoImage.height;
          const photoAspectRatio = photoWidth / photoHeight;
          let sx, sy, sWidth, sHeight;

          if (imgAspectRatio > photoAspectRatio) { // image is wider
            sHeight = photoImage.height;
            sWidth = sHeight * photoAspectRatio;
            sx = (photoImage.width - sWidth) / 2;
            sy = 0;
          } else { // image is taller or same aspect ratio
            sWidth = photoImage.width;
            sHeight = sWidth / photoAspectRatio;
            sy = (photoImage.height - sHeight) / 2;
            sx = 0;
          }
          ctx.drawImage(photoImage, sx, sy, sWidth, sHeight, photoX, photoY, photoWidth, photoHeight);
      } else {
          ctx.fillStyle = '#e5e7eb';
          ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
          ctx.fillStyle = '#9ca3af';
          ctx.font = `150px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👤', photoX + photoWidth/2, photoY + photoHeight/2);
      }
      
      // 3. Draw Text with Glow Effect
      ctx.textAlign = 'center';
      ctx.fillStyle = textColor;
      
      // --- Apply a bright glow effect ---
      ctx.shadowColor = 'rgba(255, 255, 224, 0.9)'; // A bright, light-yellow glow
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // "FELIZ CUMPLEAÑOS" - Draw twice to make the glow pop
      ctx.font = `bold 80px ${cheerfulFont}`;
      const titleY = polaroidY + polaroidHeight + 110;
      ctx.fillText('¡FELIZ CUMPLEAÑOS!', canvas.width / 2, titleY);
      ctx.fillText('¡FELIZ CUMPLEAÑOS!', canvas.width / 2, titleY);
      
      // Name - with dynamic font size
      let fontSize = 120;
      ctx.font = `bold ${fontSize}px ${cheerfulFont}`;
      const nameMaxWidth = canvas.width * 0.9;
      
      while (ctx.measureText(data.name.toUpperCase()).width > nameMaxWidth && fontSize > 30) {
        fontSize -= 5;
        ctx.font = `bold ${fontSize}px ${cheerfulFont}`;
      }

      const nameY = titleY + 110 + (fontSize / 2); // Adjust Y based on new font size for better spacing
      ctx.fillText(data.name.toUpperCase(), canvas.width / 2, nameY);
      ctx.fillText(data.name.toUpperCase(), canvas.width / 2, nameY);

      // --- Apply a more subtle glow for the message ---
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(255, 255, 224, 0.7)';
      
      // AI Generated Message
      ctx.font = `italic 48px ${cheerfulFont}`;
      const messageY = nameY + (fontSize / 2) + 100; // Adjust Y based on dynamic name font size
      
      // Message wrapping logic
      const words = greeting.split(' ');
      let line = '';
      let currentY = messageY;
      const maxWidth = canvas.width * 0.8;
      const lineHeight = 60;

      for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), canvas.width / 2, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), canvas.width / 2, currentY);
      
      // --- Reset shadow to prevent it from affecting subsequent drawings ---
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // 4. Draw Logo (visibly and larger)
      if (logoImage) {
        const logoMaxWidth = 300; // Increased size
        const logoMaxHeight = 150; // Increased size
        const scale = Math.min(logoMaxWidth / logoImage.width, logoMaxHeight / logoImage.height);
        const logoWidth = logoImage.width * scale;
        const logoHeight = logoImage.height * scale;
        const logoX = canvas.width - logoWidth - 50; // 50px margin from right
        const logoY = canvas.height - logoHeight - 50; // 50px margin from bottom
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
      }

      return canvas.toDataURL('image/png');

  }, []);

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedCardUrl(null);

    try {
      const greetingPromise = generateGreeting(formData.name, formData.age, formData.profession);
      const bgPromise = generateBackgroundImage();

      const [greeting, bgBase64] = await Promise.all([greetingPromise, bgPromise]);
      
      const finalCardUrl = await drawCardOnCanvas(bgBase64, formData, greeting);
      if (finalCardUrl) {
         setGeneratedCardUrl(finalCardUrl);
      } else {
        throw new Error("No se pudo crear la imagen de la tarjeta en el lienzo.");
      }
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <div className="flex justify-center items-center gap-4">
             <SparklesIcon className="w-10 h-10 text-blue-500"/>
             <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                Generador de Tarjetas de Cumpleaños con IA
             </h1>
          </div>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Crea una tarjeta de cumpleaños digital única en segundos. ¡Completa los detalles y deja que nuestra IA haga realidad tus deseos!
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <CardForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleGenerateClick}
              isLoading={isLoading}
            />
          </div>
          <div className="flex justify-center items-start">
            <div className="w-full max-w-md">
                 <GeneratedCard 
                    cardUrl={generatedCardUrl}
                    isLoading={isLoading}
                    error={error}
                    fileName={`tarjeta-cumpleaños-${formData.name.replace(/\s/g, '_') || 'celebracion'}.png`}
                />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
