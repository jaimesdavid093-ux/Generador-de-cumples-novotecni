
import React from 'react';
import DownloadIcon from './icons/DownloadIcon';
import SparklesIcon from './icons/SparklesIcon';
import Confetti from './Confetti';

interface GeneratedCardProps {
  cardUrl: string | null;
  isLoading: boolean;
  error: string | null;
  fileName: string;
}

const GeneratedCard: React.FC<GeneratedCardProps> = ({ cardUrl, isLoading, error, fileName }) => {
  return (
    <div className="w-full aspect-[9/16] bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center p-4 relative overflow-hidden shadow-lg">
      {isLoading && (
        <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-center font-medium">Generando tu obra de arte...</p>
          <p className="mt-1 text-sm text-center">La IA está pintando el fondo y añadiendo detalles. Esto puede tardar un momento.</p>
        </div>
      )}
      {error && !isLoading && (
         <div className="text-center text-red-500">
            <p className="font-bold">¡Ups! Algo salió mal.</p>
            <p className="text-sm mt-2">{error}</p>
         </div>
      )}
      {!isLoading && !error && !cardUrl && (
        <div className="text-center text-slate-500 dark:text-slate-400">
          <SparklesIcon className="mx-auto h-12 w-12" />
          <h3 className="mt-2 text-lg font-medium">Tu Tarjeta Aparecerá Aquí</h3>
          <p className="mt-1 text-sm">Completa el formulario para crear una tarjeta de cumpleaños personalizada.</p>
        </div>
      )}
      {cardUrl && !isLoading && (
        <>
          <img src={cardUrl} alt="Tarjeta de Cumpleaños Generada" className="object-contain w-full h-full" />
          <Confetti />
          <a
            href={cardUrl}
            download={fileName}
            className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Descargar Tarjeta"
          >
            <DownloadIcon className="h-6 w-6" />
          </a>
        </>
      )}
    </div>
  );
};

export default GeneratedCard;
