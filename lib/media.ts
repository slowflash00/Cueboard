import { createClient } from '@/lib/supabase/client';

export type StorageBucket = 'post-images' | 'video-thumbnails';

export interface UploadResult {
  url: string;
  width: number;
  height: number;
}

/**
 * Calculates image dimensions on the client side before upload to prevent CLS.
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 800,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: 800, height: 800 });
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads an image to the designated storage bucket and returns its public URL
 * along with its pre-measured dimensions.
 */
export async function uploadImage(
  file: File,
  bucket: StorageBucket = 'post-images'
): Promise<UploadResult> {
  const { width, height } = await getImageDimensions(file);
  const supabase = createClient();

  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    width,
    height,
  };
}
