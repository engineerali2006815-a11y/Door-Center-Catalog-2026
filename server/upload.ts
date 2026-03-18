import { storagePut } from './storage';
import { nanoid } from 'nanoid';

export async function uploadImageToStorage(base64Data: string): Promise<string> {
  try {
    // Remove data:image/...;base64, prefix if present
    const base64String = base64Data.replace(/^data:image\/[^;]+;base64,/, '');
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    // Generate unique filename
    const filename = `door-${nanoid()}.jpg`;
    
    // Upload to S3
    const { url } = await storagePut(
      `doors/${filename}`,
      buffer,
      'image/jpeg'
    );
    
    return url;
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
}
