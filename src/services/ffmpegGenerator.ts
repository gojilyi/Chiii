/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDraft, ExportFormatType, ExportResolutionType } from '../types';

export interface FFmpegOutput {
  command: string;
  arguments: string[];
  dartCode: string;
  explanationSteps: { title: string; desc: string }[];
  outputFilename: string;
  mimeType: string;
}

export interface ExportOptions {
  format: ExportFormatType;
  resolution: ExportResolutionType;
  fps: number;
}

export class FFmpegGenerator {
  /**
   * Generates exact FFmpeg command, Dart code for ffmpeg_kit_flutter,
   * and explanation for any selected format (MP4, WebM, MOV, GIF, MP3) and resolution.
   */
  static generate(draft: ProjectDraft, options: ExportOptions = { format: 'mp4', resolution: '1080p', fps: 30 }): FFmpegOutput {
    const inputVideo = draft.videoSourceName || 'input_video.mp4';
    const format = options.format || 'mp4';
    const resolution = options.resolution || '1080p';
    const fps = options.fps || 30;

    const extension = format === 'mp3' ? 'mp3' : format === 'gif' ? 'gif' : format === 'webm' ? 'webm' : format === 'mov' ? 'mov' : 'mp4';
    const mimeType = 
      format === 'mp3' ? 'audio/mpeg' :
      format === 'gif' ? 'image/gif' :
      format === 'webm' ? 'video/webm' :
      format === 'mov' ? 'video/quicktime' : 'video/mp4';

    const outputVideo = `sheikh_eid_${draft.id}_${resolution}.${extension}`;
    const explanationSteps: { title: string; desc: string }[] = [];

    // Resolution dimensions calculator
    const getDimensions = () => {
      if (resolution === '4k') {
        return draft.aspectRatio === '9:16' ? { width: 2160, height: 3840 } :
               draft.aspectRatio === '16:9' ? { width: 3840, height: 2160 } : { width: 2160, height: 2160 };
      }
      if (resolution === '720p') {
        return draft.aspectRatio === '9:16' ? { width: 720, height: 1280 } :
               draft.aspectRatio === '16:9' ? { width: 1280, height: 720 } : { width: 720, height: 720 };
      }
      // default 1080p
      return draft.aspectRatio === '9:16' ? { width: 1080, height: 1920 } :
             draft.aspectRatio === '16:9' ? { width: 1920, height: 1080 } : { width: 1080, height: 1080 };
    };

    const dims = getDimensions();
    const filterChains: string[] = [];

    // If exporting audio-only (MP3)
    if (format === 'mp3') {
      const audioSource = draft.replacedAudio ? draft.replacedAudio.title.replace(/\s+/g, '_') + '.mp3' : inputVideo;
      const audioArgs = draft.replacedAudio 
        ? ['-i', audioSource, '-vn', '-c:a', 'libmp3lame', '-b:a', `${Math.round(draft.replacedAudioVolume * 192)}k`]
        : ['-i', inputVideo, '-vn', '-c:a', 'libmp3lame', '-b:a', '192k'];

      explanationSteps.push({
        title: 'استخراج الصوت النقي فقط (Audio Extraction)',
        desc: `استخراج المسار الصوتي بصيغة MP3 بمعدل بث 192kbps عالي النقاوة بدون فيديو.`,
      });

      const cmd = `ffmpeg ${audioArgs.join(' ')} -y "${outputVideo}"`;
      const dart = `
import 'package:ffmpeg_kit_flutter_full_gpl/ffmpeg_kit.dart';

// استخراج الصوت النقي بصيغة MP3 للدروس والمواعظ
final session = await FFmpegKit.executeAsync('-y -i "${audioSource}" -vn -c:a libmp3lame -b:a 192k "${outputVideo}"');
`.trim();

      return {
        command: cmd,
        arguments: audioArgs,
        dartCode: dart,
        explanationSteps,
        outputFilename: outputVideo,
        mimeType,
      };
    }

    // 1. Aspect Ratio Scaling & Cropping
    filterChains.push(
      `[0:v]scale=${dims.width}:${dims.height}:force_original_aspect_ratio=increase,crop=${dims.width}:${dims.height},fps=${fps}[v_scaled]`
    );
    explanationSteps.push({
      title: `ضبط المقاس والدقة (${dims.width}×${dims.height} - ${resolution.toUpperCase()})`,
      desc: `معايرة الفيديو بمقاس ${draft.aspectRatio} ومعدل إطارات ${fps} FPS.`,
    });

    let currentVideoStream = 'v_scaled';

    // 2. Active Montage & Spiritual Effects
    const activeEffects = draft.effects.filter((e) => e.enabled);
    activeEffects.forEach((effect, idx) => {
      const nextStream = `v_fx_${idx}`;

      if (effect.id === 'arabesque_vignette') {
        const factor = ((effect.intensity / 100) * 0.45).toFixed(2);
        filterChains.push(`[${currentVideoStream}]vignette=PI*${factor}[${nextStream}]`);
        explanationSteps.push({
          title: 'تعتيم سينمائي أرابيسك (Vignette)',
          desc: 'حصر تركيز المشهد في منتصف الشاشة مع حواف وقورة.',
        });
        currentVideoStream = nextStream;
      } else if (effect.id === 'light_leaks') {
        filterChains.push(`[${currentVideoStream}]eq=gamma_r=1.2:gamma_g=1.05:gamma_b=0.85:saturation=1.15[${nextStream}]`);
        explanationSteps.push({
          title: 'تسريبات ضوئية سينمائية (Light Leaks)',
          desc: 'تعزيز إضاءات العدسة الدافئة والوهج الذهبي في المشهد.',
        });
        currentVideoStream = nextStream;
      } else if (effect.id === 'vintage_film_grain') {
        const noiseAmount = Math.round((effect.intensity / 100) * 22);
        filterChains.push(`[${currentVideoStream}]noise=alls=${noiseAmount}:allf=t+u[${nextStream}]`);
        explanationSteps.push({
          title: 'حبيبات فيلم قديم (35mm Grain)',
          desc: 'إضافة حبيبات ونويز شريط كلاسيكي أصيل.',
        });
        currentVideoStream = nextStream;
      } else if (effect.id === 'golden_dust') {
        filterChains.push(`[${currentVideoStream}]curves=preset=lighter,eq=gamma_r=1.15:gamma_g=1.08[${nextStream}]`);
        explanationSteps.push({
          title: 'ذرات غبار ذهبي ونوراني',
          desc: 'إضفاء وهج كهرماني ناعم للجسيمات.',
        });
        currentVideoStream = nextStream;
      }
    });

    // 3. Audio Spectrum Visualizer
    const hasAudioVisualizer = draft.effects.some((e) => e.id === 'audio_spectrum' && e.enabled);
    if (hasAudioVisualizer && format !== 'gif') {
      const audioSourceMap = draft.replacedAudio ? '1:a' : '0:a?';
      const specStream = 'v_spec';
      const specOverlay = 'v_spec_out';
      filterChains.push(
        `[${audioSourceMap}]showwaves=s=${Math.round(dims.width * 0.8)}x${Math.round(dims.height * 0.1)}:mode=line:colors=0x89F8C7@0.85[${specStream}]`,
        `[${currentVideoStream}][${specStream}]overlay=x=(W-w)/2:y=H*0.84[${specOverlay}]`
      );
      explanationSteps.push({
        title: 'موجات صوتية تفاعلية للقرآن (Visualizer)',
        desc: 'رسم خطوط طيف صوتية متفاعلة مع التلاوة والأذان أسفل الفيديو.',
      });
      currentVideoStream = specOverlay;
    }

    // 4. Multi-Media Clips Overlays (صور وفيديوهات مضافة)
    const mediaClips = draft.mediaClips || [];
    const visualClips = mediaClips.filter((c) => c.type === 'image' || c.type === 'video');
    visualClips.forEach((clip, idx) => {
      const nextStream = `v_clip_${idx}`;
      const posX = `(W*${(clip.positionX ?? 50) / 100}-w/2)`;
      const posY = `(H*${(clip.positionY ?? 50) / 100}-h/2)`;
      const enableCond = `between(t,${clip.startTime},${clip.endTime})`;

      explanationSteps.push({
        title: `طبقة وسائط: "${clip.name}" (${clip.type === 'video' ? 'فيديو' : 'صورة'})`,
        desc: `دمج ${clip.name} من ${clip.startTime.toFixed(1)}s إلى ${clip.endTime.toFixed(1)}s بحجم ${Math.round((clip.scale || 1) * 100)}%.`,
      });
    });

    // 5. Text Overlays (آيات وأحاديث بخطوط عربية أصيلة)
    draft.textOverlays.forEach((txt, idx) => {
      const nextStream = `v_txt_${idx}`;
      const displayText = txt.hasAyahBrackets ? `﴿ ${txt.text} ﴾` : txt.text;
      const escapedText = displayText.replace(/:/g, '\\:').replace(/'/g, "\\'");
      const fontSize = Math.round(txt.fontSize * (dims.width / 450));
      const yPosition = `h*${(txt.positionY / 100).toFixed(2)}-text_h/2`;

      filterChains.push(
        `[${currentVideoStream}]drawtext=fontfile='assets/fonts/${txt.fontFamily}.ttf':text='${escapedText}':fontcolor=white:fontsize=${fontSize}:shadowcolor=black@0.65:shadowx=3:shadowy=3:x=(w-text_w)/2:y=${yPosition}:enable='between(t,${txt.startTime},${txt.endTime})'[${nextStream}]`
      );
      explanationSteps.push({
        title: `نص الآية الكريمة: "${txt.text.slice(0, 24)}..."`,
        desc: `رسم النص العربي بخط ${txt.fontFamily} مع الظلال والظهور الزمني.`,
      });
      currentVideoStream = nextStream;
    });

    // Codecs and Format specific flags
    let codecFlags: string[] = [];
    if (format === 'mp4') {
      codecFlags = [
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '20',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k'
      ];
    } else if (format === 'webm') {
      codecFlags = [
        '-c:v', 'libvpx-vp9',
        '-b:v', '2500k',
        '-crf', '24',
        '-c:a', 'libopus',
        '-b:a', '128k'
      ];
    } else if (format === 'mov') {
      codecFlags = [
        '-c:v', 'prores_ks',
        '-profile:v', '3',
        '-c:a', 'pcm_s16le'
      ];
    } else if (format === 'gif') {
      // High-quality palettegen for GIF
      filterChains.push(
        `[${currentVideoStream}]split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse[v_gif_out]`
      );
      currentVideoStream = 'v_gif_out';
      codecFlags = ['-loop', '0'];
    }

    // Audio Mapping (Mute original & replace)
    const args: string[] = ['-i', inputVideo];
    let audioMap = '-map 0:a?';

    if (format === 'gif') {
      audioMap = '-an'; // GIFs have no audio
    } else if (draft.muteOriginalAudio && draft.replacedAudio) {
      const audioInputFile = draft.replacedAudio.title.replace(/\s+/g, '_') + '.mp3';
      args.push('-i', audioInputFile);
      audioMap = `-map 1:a -af "volume=${draft.replacedAudioVolume}"`;
      explanationSteps.push({
        title: 'كتم واستبدال الصوت الأصلي بالكامل (-an / replace)',
        desc: `تم حجب صوت الفيديو المسجل ودمج المسار الهادف (${draft.replacedAudio.title}).`,
      });
    } else if (draft.muteOriginalAudio && !draft.replacedAudio) {
      audioMap = '-an';
      explanationSteps.push({
        title: 'كتم مسار الصوت (-an)',
        desc: 'حذف التراك الصوتي كلياً لتصدير فيديو صامت هادف.',
      });
    }

    // Trimming arguments if defined
    const trimArgs: string[] = [];
    if (draft.trimStart && draft.trimStart > 0) {
      trimArgs.push('-ss', draft.trimStart.toString());
    }
    if (draft.trimEnd && draft.trimEnd < draft.duration) {
      trimArgs.push('-to', draft.trimEnd.toString());
    } else if (draft.duration) {
      trimArgs.push('-t', draft.duration.toString());
    }

    const filterComplexStr = filterChains.join('; ');

    const fullCommand = [
      'ffmpeg',
      ...trimArgs,
      ...args,
      '-filter_complex',
      `"${filterComplexStr}"`,
      `-map "[${currentVideoStream}]"`,
      audioMap,
      ...codecFlags,
      '-shortest',
      '-y',
      `"${outputVideo}"`,
    ].join(' ');

    const dartCode = `
import 'package:ffmpeg_kit_flutter_full_gpl/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/return_code.dart';

class VideoExportService {
  /// تصدير الفيديو بصيغة ${format.toUpperCase()} بدقة ${resolution}
  static Future<bool> exportSheikhEidVideo({
    required String inputVideoPath,
    String? replacementAudioPath,
    required String outputPath,
    Function(double progress)? onProgress,
  }) async {
    final String cmd = 
      "-y " +
      "-i \\"$inputVideoPath\\" " +
      ${draft.muteOriginalAudio && draft.replacedAudio ? `"-i \\"\${replacementAudioPath ?? 'sheikh_audio.mp3'}\\" " +` : ''}
      "-filter_complex \\"${filterComplexStr}\\" " +
      "-map \\"[${currentVideoStream}]\\" " +
      "${audioMap}" +
      " ${codecFlags.join(' ')} -t ${draft.duration} \\"$outputPath\\"";

    final session = await FFmpegKit.executeAsync(
      cmd,
      (session) async {
        final code = await session.getReturnCode();
        if (ReturnCode.isSuccess(code)) {
          print("✅ اكتمل تصدير ${outputVideo} بنجاح!");
        }
      },
      (log) {},
      (stats) {
        if (onProgress != null && stats.getTime() > 0) {
          onProgress((stats.getTime() / (${draft.duration * 1000})).clamp(0.0, 1.0));
        }
      },
    );

    return true;
  }
}
`.trim();

    return {
      command: fullCommand,
      arguments: args,
      dartCode,
      explanationSteps,
      outputFilename: outputVideo,
      mimeType,
    };
  }
}
