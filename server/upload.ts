export async function uploadImageToStorage(base64Data: string): Promise<string> {
  try {
    // فصل البيانات الصافية للصورة
    const base64String = base64Data.replace(/^data:image\/[^;]+;base64,/, '');

    // سنسحب المفتاح من ملف البيئة الذي سنصنعه
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      throw new Error("مفتاح ImgBB غير موجود في ملف .env");
    }

    const formData = new URLSearchParams();
    formData.append('image', base64String);

    // الرفع مباشرة إلى السحابة المجانية
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.data.url; // إرجاع الرابط الدائم للصورة
    } else {
      throw new Error('فشل الرفع إلى السحابة');
    }
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
}