
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a user-friendly error or disable the feature.
  // For this context, we assume the key is provided.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

// Initialize with a check for API_KEY to avoid errors on creation.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateBackgroundImage = async (): Promise<string> => {
  if (!ai) {
    throw new Error("El cliente de IA de Gemini no está inicializado. Por favor, verifica tu clave de API.");
  }

  const prompt = `
    Una imagen de fondo vertical festiva para una tarjeta de cumpleaños, de 1080x1920 píxeles. El estilo debe ser alegre, elegante y tridimensional.
    - Fondo: Un degradado suave desde un azul claro y aireado en la parte inferior hasta blanco puro en la parte superior.
    - Iluminación: Un efecto de luz solar suave y cálida que brilla desde el centro superior.
    - Decoraciones:
      - Confeti plateado pequeño y brillante y diminutas estrellas luminosas esparcidas con elegancia.
      - Varios grupos de globos festivos flotando en las esquinas superior derecha e inferior izquierda. Los globos deben estar superpuestos para crear una sensación de profundidad.
      - Los globos deben ser en tonos de azul, algunos con brillo metálico y otros con textura de purpurina, atados con finas cuerdas plateadas.
      - Una cinta azul ondulada y elegante a lo largo del borde inferior.
    El ambiente general debe ser limpio, brillante y feliz. No incluir texto ni marcos para fotos.
  `;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '9:16',
        outputMimeType: 'image/png',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("La generación de la imagen falló, no se devolvieron imágenes.");
    }
  } catch (error) {
    console.error("Error al generar la imagen de fondo:", error);
    throw new Error("No se pudo generar el fondo de la tarjeta. La API puede estar ocupada o ha ocurrido un error. Por favor, inténtalo de nuevo.");
  }
};

export const generateGreeting = async (name: string, age: string, profession: string): Promise<string> => {
  if (!ai) {
    throw new Error("El cliente de IA de Gemini no está inicializado.");
  }

  const prompt = profession
    ? `Genera un mensaje de cumpleaños corto, alegre y creativo en español para ${name}, que cumple ${age} años y es ${profession}. El mensaje no debe superar las 25 palabras. Sé cálido y celebratorio, haciendo un guiño ingenioso a su profesión. Ejemplo para un programador: "¡Feliz ${age} cumpleaños, ${name}! Que tu vida compile sin errores y esté llena de funciones de alegría."`
    : `Genera un mensaje de cumpleaños corto, alegre y universal en español para ${name}, que cumple ${age} años. El mensaje no debe superar las 20 palabras. Ejemplo: "¡Felices ${age}, ${name}! Que este nuevo año de vida venga cargado de momentos inolvidables y mucha felicidad."`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error al generar el saludo:", error);
    // Fallback a un mensaje genérico en caso de error
    return `¡Felicidades por tus ${age} años, ${name}! Que este día sea tan especial como tú eres.`;
  }
};