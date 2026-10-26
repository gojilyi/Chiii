/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Accept large payloads for canvas frames and audio data
  app.use(express.json({ limit: '150mb' }));
  app.use(express.urlencoded({ extended: true, limit: '150mb' }));

  // Serve @ffmpeg/core dist files locally for fast and reliable browser loading
  app.use('/ffmpeg', express.static(path.resolve(__dirname, 'node_modules/@ffmpeg/core/dist/esm')));

  /**
   * Health Check
   */
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', ffmpeg: fs.existsSync('/usr/bin/ffmpeg') });
  });

  /**
   * Native FFmpeg Video Render Endpoint
   * Combines input image/canvas + Sheikh voice recording into a 100% compliant MP4 video.
   * Command flags: -y -loop 1 -framerate 30 -i image -i audio -c:v libx264 -preset ultrafast -tune stillimage -c:a aac -b:a 128k -pix_fmt yuv420p -shortest
   */
  app.post('/api/render-ffmpeg', async (req, res) => {
    const tmpDir = os.tmpdir();
    const id = Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const tempImage = path.join(tmpDir, `img_${id}.jpg`);
    const tempAudio = path.join(tmpDir, `aud_${id}.dat`);
    const tempOutput = path.join(tmpDir, `out_${id}.mp4`);

    try {
      const {
        image,           // base64 data url or relative file path
        audio,           // base64 data url or relative file path
        audioTrimStart,  // in seconds
        audioTrimEnd,    // in seconds
        duration,        // in seconds
        width = 720,
        height = 1280,
        fps = 30,
        filename = 'الشيخ_العيد_مقطع.mp4'
      } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'صورة الإدخال مطلوبة' });
      }

      // 1. Resolve & write input image
      if (typeof image === 'string' && (image.startsWith('data:image/') || image.startsWith('data:application/'))) {
        const base64Data = image.replace(/^data:[^;]+;base64,/, '');
        await fs.promises.writeFile(tempImage, Buffer.from(base64Data, 'base64'));
      } else if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
        const resp = await fetch(image);
        const buf = await resp.arrayBuffer();
        await fs.promises.writeFile(tempImage, Buffer.from(buf));
      } else if (typeof image === 'string' && image.startsWith('/')) {
        const cleanPath = image.replace(/^\//, '');
        const localCandidates = [
          path.resolve(__dirname, 'public', cleanPath),
          path.resolve(__dirname, cleanPath),
          path.resolve(__dirname, 'src', cleanPath),
        ];
        let found = false;
        for (const cand of localCandidates) {
          if (fs.existsSync(cand)) {
            await fs.promises.copyFile(cand, tempImage);
            found = true;
            break;
          }
        }
        if (!found) {
          // Fallback to any default local image asset
          const defaultAsset = path.resolve(__dirname, 'public/assets/aistudio/29515ac3-1b7a-4437-8444-84464b32b5fe_33174229.jpeg');
          if (fs.existsSync(defaultAsset)) {
            await fs.promises.copyFile(defaultAsset, tempImage);
          } else {
            throw new Error(`تعذر العثور على ملف الصورة: ${image}`);
          }
        }
      } else {
        throw new Error('تنسيق الصورة غير مدعوم');
      }

      // 2. Resolve & write input audio
      let hasRealAudio = false;
      if (typeof audio === 'string' && (audio.startsWith('data:audio/') || audio.startsWith('data:application/'))) {
        const base64Data = audio.replace(/^data:[^;]+;base64,/, '');
        await fs.promises.writeFile(tempAudio, Buffer.from(base64Data, 'base64'));
        hasRealAudio = true;
      } else if (typeof audio === 'string' && (audio.startsWith('http://') || audio.startsWith('https://'))) {
        try {
          const resp = await fetch(audio);
          const buf = await resp.arrayBuffer();
          await fs.promises.writeFile(tempAudio, Buffer.from(buf));
          hasRealAudio = true;
        } catch (audFetchErr) {
          console.warn('[render-ffmpeg] Failed to fetch remote audio:', audFetchErr);
        }
      } else if (typeof audio === 'string' && audio.startsWith('/')) {
        const cleanPath = audio.replace(/^\//, '');
        const localCandidates = [
          path.resolve(__dirname, 'public', cleanPath),
          path.resolve(__dirname, cleanPath),
        ];
        for (const cand of localCandidates) {
          if (fs.existsSync(cand)) {
            await fs.promises.copyFile(cand, tempAudio);
            hasRealAudio = true;
            break;
          }
        }
      }

      // 3. Build FFmpeg command arguments
      const args: string[] = [
        '-y',
        '-loop', '1',
        '-framerate', String(fps),
        '-i', tempImage,
      ];

      // Audio inputs
      if (hasRealAudio) {
        if (typeof audioTrimStart === 'number' && audioTrimStart > 0) {
          args.push('-ss', String(audioTrimStart));
        }
        if (typeof audioTrimEnd === 'number' && audioTrimEnd > (audioTrimStart || 0)) {
          args.push('-to', String(audioTrimEnd));
        }
        args.push('-i', tempAudio);
      } else {
        // Fallback: silence matching duration if no audio is attached
        const targetDur = typeof duration === 'number' && duration > 0 ? duration : 5;
        args.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', String(targetDur));
      }


      // Filter graph: scale & crop to target dimensions + 30fps
      const filterGraph = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},fps=${fps}`;
      args.push('-vf', filterGraph);

      // Encoding settings: H.264 + AAC + yuv420p + ultrafast + shortest
      args.push(
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-threads', '0',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        tempOutput
      );

      console.log(`[ffmpeg] Running: ffmpeg ${args.join(' ')}`);

      // Execute FFmpeg
      await new Promise<void>((resolve, reject) => {
        execFile('/usr/bin/ffmpeg', args, (error, _stdout, stderr) => {
          if (error) {
            console.error('[ffmpeg error]:', stderr);
            return reject(new Error(stderr || error.message));
          }
          resolve();
        });
      });

      // Check output exists
      if (!fs.existsSync(tempOutput)) {
        throw new Error('فشل إنتاج ملف الفيديو النهائي');
      }

      const stat = await fs.promises.stat(tempOutput);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

      const fileStream = fs.createReadStream(tempOutput);
      fileStream.pipe(res);

      fileStream.on('close', () => {
        // Clean up
        try { fs.unlinkSync(tempImage); } catch {}
        try { if (hasRealAudio) fs.unlinkSync(tempAudio); } catch {}
        try { fs.unlinkSync(tempOutput); } catch {}
      });
    } catch (err: any) {
      console.error('[render-ffmpeg error]:', err);
      try { fs.unlinkSync(tempImage); } catch {}
      try { fs.unlinkSync(tempAudio); } catch {}
      try { fs.unlinkSync(tempOutput); } catch {}
      res.status(500).json({ error: err.message || 'حدث خطأ أثناء رندرة الفيديو بـ FFmpeg' });
    }
  });

  // Serve static assets or mount Vite middleware in development
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // HMR is disabled in AI Studio iframe environment to prevent WebSocket disconnection errors
    process.env.DISABLE_HMR = 'true';
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }


  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Sheikh Eid Studio server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
