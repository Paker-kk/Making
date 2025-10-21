import { GoogleGenAI, Modality, GenerateContentResponse, GenerateVideosOperation } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

type ImageInput = {
    href: string;
    mimeType: string;
};

export async function editImage(
  images: ImageInput[], 
  prompt: string,
  mask?: ImageInput
): Promise<{ newImageBase64: string | null; newImageMimeType: string | null; textResponse: string | null; }> {
  
  const imageParts = images.map(image => {
    const dataUrlParts = image.href.split(',');
    const base64Data = dataUrlParts.length > 1 ? dataUrlParts[1] : dataUrlParts[0];
    return {
      inlineData: {
        data: base64Data,
        mimeType: image.mimeType,
      },
    };
  });

  const maskPart = mask ? {
    inlineData: {
      data: mask.href.split(',')[1],
      mimeType: mask.mimeType,
    },
  } : null;

  const textPart = { text: prompt };

  // For inpainting with a mask, the API expects a specific order: prompt, then image, then mask.
  // For other edits, the order is less strict. This ensures the mask is applied correctly.
  const parts = maskPart
    ? [textPart, ...imageParts, maskPart]
    : [...imageParts, textPart];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let newImageBase64: string | null = null;
    let newImageMimeType: string | null = null;
    let textResponse: string | null = null;

    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          newImageBase64 = part.inlineData.data;
          newImageMimeType = part.inlineData.mimeType;
        } else if (part.text) {
          textResponse = part.text;
        }
      }
    } else {
        textResponse = "The AI response was blocked or did not contain content.";
        if (response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason) {
            textResponse += ` (Reason: ${response.candidates[0].finishReason})`;
        }
    }
    
    if (!newImageBase64) {
        // Fallback or error if no image is generated
        console.warn("API response did not contain an image part.", response);
        textResponse = textResponse || "The AI did not generate a new image. Please try a different prompt.";
    }

    return { newImageBase64, newImageMimeType, textResponse };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
}

export async function generateImageFromText(prompt: string): Promise<{ newImageBase64: string | null; newImageMimeType: string | null; textResponse: string | null; }> {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const image = response.generatedImages[0];
      return {
        newImageBase64: image.image.imageBytes,
        newImageMimeType: 'image/png',
        textResponse: null
      };
    } else {
      return {
        newImageBase64: null,
        newImageMimeType: null,
        textResponse: "The AI did not generate an image. Please try a different prompt."
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API for text-to-image:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
}

export async function generateVideo(
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  onProgress: (message: string) => void,
  image?: ImageInput
): Promise<{ videoBlob: Blob; mimeType: string }> {
  onProgress('Initializing video generation...');
  
  const imagePart = image ? {
    imageBytes: image.href.split(',')[1],
    mimeType: image.mimeType,
  } : undefined;

  let operation: GenerateVideosOperation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: prompt,
    image: imagePart,
    config: {
      numberOfVideos: 1,
      aspectRatio: aspectRatio,
    }
  });
  
  const progressMessages = [
      'Rendering frames...',
      'Compositing video...',
      'Applying final touches...',
      'Almost there...',
  ];
  let messageIndex = 0;

  onProgress('Generation started, this may take a few minutes.');

  while (!operation.done) {
    onProgress(progressMessages[messageIndex % progressMessages.length]);
    messageIndex++;
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  if (operation.error) {
    throw new Error(`Video generation failed: ${operation.error.message}`);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation completed, but no download link was found.");
  }

  onProgress('Downloading generated video...');
  const response = await fetch(`${downloadLink}&key=${API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const videoBlob = await response.blob();
  const mimeType = response.headers.get('Content-Type') || 'video/mp4';

  return { videoBlob, mimeType };
}
