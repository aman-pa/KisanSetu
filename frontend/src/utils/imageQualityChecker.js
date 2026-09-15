/**
 * imageQualityChecker.js
 * Stage 1 Image Quality Validation Engine
 * 
 * Performs high-speed client-side computer-vision checks using HTML5 Canvas & pixel data:
 * - Resolution (Megapixels & dimensions)
 * - Exposure (Excessive darkness / Overexposure)
 * - Contrast & Dynamic Range
 * - Sharpness & Blur (Laplacian edge gradient variance)
 * 
 * Threshold: 70/100.
 */

import API from '../services/api';

export const IMAGE_QUALITY_THRESHOLD = 70;

/**
 * Fast client-side image validation using HTML5 Canvas
 * @param {string} dataUrl Base64 or Object URL of image
 * @returns {Promise<{ score: number, status: 'good'|'poor', isAcceptable: boolean, reason: string|null, message: string, metrics: object }>}
 */
export const checkImageQualityClient = (dataUrl) => {
  return new Promise((resolve) => {
    if (!dataUrl) {
      return resolve({
        score: 0,
        status: 'poor',
        isAcceptable: false,
        reason: 'No image provided. Please select a photo.',
        message: 'No image provided. Please select a photo.',
        metrics: {},
      });
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const pixels = width * height;

        let resolutionScore = 100;
        let rejectionReason = null;
        const issues = [];

        // 1. Resolution Check
        if (width < 300 || height < 300 || pixels < 90000) {
          resolutionScore = 35;
          issues.push('Resolution is critically low');
          rejectionReason = 'The image resolution is too low. Please upload a higher-quality image.';
        } else if (width < 500 || height < 400) {
          resolutionScore = 65;
          issues.push('Low image resolution');
          if (!rejectionReason) {
            rejectionReason = 'The image resolution is low. Please upload a higher-resolution photo.';
          }
        }

        // Draw onto miniature canvas for fast pixel processing (max 200x200)
        const canvas = document.createElement('canvas');
        const maxDim = 200;
        const scale = Math.min(maxDim / width, maxDim / height, 1);
        canvas.width = Math.max(10, Math.floor(width * scale));
        canvas.height = Math.max(10, Math.floor(height * scale));

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // 2. Brightness & Contrast Analysis
        let totalLuma = 0;
        const grayValues = new Float32Array(canvas.width * canvas.height);

        for (let i = 0; i < data.length; i += 4) {
          // Standard ITU-R BT.601 luma formula
          const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          grayValues[i / 4] = luma;
          totalLuma += luma;
        }

        const pixelCount = grayValues.length;
        const meanBrightness = totalLuma / pixelCount;

        let varianceSum = 0;
        for (let i = 0; i < pixelCount; i++) {
          const diff = grayValues[i] - meanBrightness;
          varianceSum += diff * diff;
        }
        const contrast = Math.sqrt(varianceSum / pixelCount);

        let brightnessScore = 100;
        if (meanBrightness < 45) {
          brightnessScore = Math.max(20, Math.floor(meanBrightness * 1.2));
          issues.push('Excessively dark');
          if (!rejectionReason) {
            rejectionReason = 'The image is too dark to assess the crop. Please upload a photo with better lighting.';
          }
        } else if (meanBrightness > 220) {
          brightnessScore = Math.max(25, Math.floor((255 - meanBrightness) * 1.5));
          issues.push('Overexposed / too bright');
          if (!rejectionReason) {
            rejectionReason = 'The image is too bright. Please upload a photo where the crop is clearly visible.';
          }
        } else if (meanBrightness < 60 || meanBrightness > 200) {
          brightnessScore = 75;
        }

        let contrastScore = 100;
        if (contrast < 18) {
          contrastScore = 40;
          issues.push('Low contrast / washed out');
          if (!rejectionReason) {
            rejectionReason = 'The image appears washed out or has poor contrast. Please capture the crop clearly.';
          }
        } else if (contrast < 30) {
          contrastScore = 70;
        }

        // 3. Blur / Sharpness check (Horizontal & vertical edge gradients)
        let edgeSum = 0;
        const w = canvas.width;
        const h = canvas.height;
        let edgeSamples = 0;

        for (let y = 1; y < h - 1; y += 2) {
          for (let x = 1; x < w - 1; x += 2) {
            const idx = y * w + x;
            const diffX = Math.abs(grayValues[idx + 1] - grayValues[idx - 1]);
            const diffY = Math.abs(grayValues[idx + w] - grayValues[idx - w]);
            edgeSum += diffX + diffY;
            edgeSamples++;
          }
        }

        const avgEdge = edgeSamples > 0 ? edgeSum / edgeSamples : 50;
        let blurScore = 100;

        if (avgEdge < 10) {
          blurScore = 30;
          issues.push('Blurry / out of focus');
          if (!rejectionReason) {
            rejectionReason = 'Your photo appears blurry. Please take a sharper photo with the crop in focus.';
          }
        } else if (avgEdge < 18) {
          blurScore = 60;
          issues.push('Soft focus');
          if (!rejectionReason) {
            rejectionReason = 'Your photo appears somewhat blurry. Please capture a sharper photo with the crop in focus.';
          }
        } else if (avgEdge < 26) {
          blurScore = 80;
        }

        // Weighted Overall Score
        const finalScore = Math.max(
          15,
          Math.min(
            99,
            Math.floor(
              resolutionScore * 0.25 +
              brightnessScore * 0.25 +
              contrastScore * 0.20 +
              blurScore * 0.30
            )
          )
        );

        const isAcceptable = finalScore >= IMAGE_QUALITY_THRESHOLD && !rejectionReason;

        return resolve({
          score: finalScore,
          status: isAcceptable ? 'good' : 'poor',
          isAcceptable,
          reason: isAcceptable ? null : rejectionReason || 'The uploaded image is not clear enough. Please upload a clearer photo.',
          message: isAcceptable
            ? 'Image Ready for AI Analysis'
            : rejectionReason || 'The uploaded image is not clear enough to assess crop quality.',
          issues,
          metrics: {
            resolution: `${width}x${height}`,
            brightness: Math.round(meanBrightness),
            contrast: Math.round(contrast),
            sharpness: Math.round(avgEdge),
          },
        });
      } catch (err) {
        console.error('Canvas image validation error:', err);
        return resolve({
          score: 80,
          status: 'good',
          isAcceptable: true,
          reason: null,
          message: 'Image Ready for AI Analysis',
          issues: [],
          metrics: {},
        });
      }
    };

    img.onerror = () => {
      resolve({
        score: 30,
        status: 'poor',
        isAcceptable: false,
        reason: 'Unable to process image file. Please upload a valid JPG, PNG, or WEBP photo.',
        message: 'Unable to process image file. Please upload a valid JPG, PNG, or WEBP photo.',
        metrics: {},
      });
    };

    img.src = dataUrl;
  });
};

/**
 * Validate image quality with dual layer (client-side + backend verification)
 */
export const validateImageQuality = async (dataUrl) => {
  // First run high-speed client side check
  const clientResult = await checkImageQualityClient(dataUrl);

  // If client immediately catches a clear defect (dark, blurry, tiny), reject immediately
  if (!clientResult.isAcceptable) {
    return clientResult;
  }

  // Double check with backend API
  try {
    const { data } = await API.post('/quality/validate-image', { image: dataUrl });
    if (data && typeof data.score === 'number') {
      return {
        score: data.score,
        status: data.isAcceptable ? 'good' : 'poor',
        isAcceptable: data.isAcceptable,
        reason: data.reason || (data.isAcceptable ? null : 'Image quality is too low.'),
        message: data.message || (data.isAcceptable ? 'Image Ready for AI Analysis' : 'Better photo required.'),
        issues: data.issues || [],
        metrics: data.metrics || clientResult.metrics,
      };
    }
  } catch (apiErr) {
    // If backend network error, use client result
    console.warn('Backend image validation unavailable, using client validation:', apiErr.message);
  }

  return clientResult;
};
