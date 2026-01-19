
import React, { useState, useEffect, useCallback } from 'react';
import type { CardFormData } from '../types';
import PhotoIcon from './icons/PhotoIcon';

interface CardFormProps {
  formData: CardFormData;
  setFormData: React.Dispatch<React.SetStateAction<CardFormData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ImageInput: React.FC<{
  label: string;
  id: "photo" | "logo";
  file: File | null;
  onChange: (file: File | null) => void;
}> = ({ label, id, file, onChange }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      fileToDataUrl(file).then(setPreview);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onChange(selectedFile);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <div className="mt-1">
        <label
          htmlFor={id}
          className="relative flex justify-center items-center w-full h-32 px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Vista previa" className="max-h-full max-w-full object-contain rounded" />
          ) : (
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
              <div className="flex text-sm text-slate-600 dark:text-slate-400">
                <p className="pl-1">Sube un archivo</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG hasta 10MB</p>
            </div>
          )}
          <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
        </label>
      </div>
    </div>
  );
};

const CardForm: React.FC<CardFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = useCallback((field: "photo" | "logo", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  }, [setFormData]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Nombre del Cumpleañero
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Pedro"
            required
            className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <ImageInput label="Foto del Cumpleañero" id="photo" file={formData.photo} onChange={(file) => handleFileChange("photo", file)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Fecha del Cumpleaños
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="Ej: 15 de noviembre"
              required
              className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Edad que Cumple
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="age"
              id="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Ej: 30"
              required
              className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
       <div>
        <label htmlFor="profession" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Profesión (Opcional)
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="profession"
            id="profession"
            value={formData.profession}
            onChange={handleChange}
            placeholder="Ej: Programador, Doctora"
            className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <ImageInput label="Logo de la Empresa" id="logo" file={formData.logo} onChange={(file) => handleFileChange("logo", file)} />

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generando tu Tarjeta...' : 'Generar Tarjeta de Cumpleaños'}
        </button>
      </div>
    </form>
  );
};

export default CardForm;