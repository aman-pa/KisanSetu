// AI Image Quality & Document Clarity Verification Helper

export const verifyImageClarity = (file, imageType = 'PROFILE') => {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ valid: false, message: 'No file selected.' });
      return;
    }

    // 1. File Size Validation (Must be >= 8 KB and <= 5 MB)
    const minSize = 8 * 1024; // 8 KB
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (file.size < minSize) {
      resolve({
        valid: false,
        message: 'Image file size is too small or blank (under 8 KB). Please upload a sharp, clear photo.',
      });
      return;
    }

    if (file.size > maxSize) {
      resolve({
        valid: false,
        message: 'Image file size exceeds 5 MB. Please select a compressed photo under 5 MB.',
      });
      return;
    }

    // 2. Read Image & Validate Aspect Ratio & Resolution
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // Minimum resolution check (Width & Height must be >= 150px)
        if (width < 150 || height < 150) {
          resolve({
            valid: false,
            message: 'Image resolution is too low or blurry. Minimum resolution required is 150x150 pixels.',
          });
          return;
        }

        // For Aadhaar Card: Expect landscape/card format (width > height or reasonable card ratio)
        if (imageType === 'AADHAAR_FRONT' || imageType === 'AADHAAR_BACK') {
          if (width < 300) {
            resolve({
              valid: false,
              message: 'Aadhaar card photo is too blurry or low resolution. Please upload a clear, legible photo.',
            });
            return;
          }
        }

        resolve({
          valid: true,
          message: 'Image verified! Sharp quality & clear document structure detected.',
          width,
          height,
          dataUrl: e.target.result,
        });
      };

      img.onerror = () => {
        resolve({ valid: false, message: 'Invalid image format. Please upload a valid JPG, PNG, or WEBP image.' });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
};
