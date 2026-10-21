/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Folder, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  Terminal, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface FlutterFile {
  path: string;
  filename: string;
  description: string;
  code: string;
}

const FLUTTER_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    filename: 'pubspec.yaml',
    description: 'ملف الاعتمادات والحزم بما فيها ffmpeg_kit_flutter و hive و video_player',
    code: `name: sheikh_eid_editor
description: "تطبيق الشيخ العيد - استوديو مونتاج الفيديو الهادف والديني بمعايير Material Design 3"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # المعالجة الأساسية للفيديو والمونتاج
  ffmpeg_kit_flutter_full_gpl: ^6.0.3
  
  # مشغل الفيديو للمعاينة السلسة
  video_player: ^2.8.2
  
  # قاعدة البيانات المحلية لحفظ المسودات (Drafts)
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # إدارة الحالة والخطوط
  flutter_riverpod: ^2.5.1
  google_fonts: ^6.1.0
  
  # الأيقونات ومعالجة الملفات والشبكة
  http: ^1.2.0
  audioplayers: ^5.2.1
  file_picker: ^8.0.0
  path_provider: ^2.1.2
  uuid: ^4.3.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  hive_generator: ^2.0.1
  build_runner: ^2.4.8

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/audio/
    - assets/fonts/
`.trim(),
  },
  {
    path: 'lib/main.dart',
    filename: 'main.dart',
    description: 'نقطة الانطلاق وتهيئة Hive و Material Design 3',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/theme/app_theme.dart';
import 'features/drafts/models/project_draft.dart';
import 'features/home/screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // تهيئة قاعدة البيانات المحلية لحفظ المسودات (Hive)
  await Hive.initFlutter();
  Hive.registerAdapter(ProjectDraftAdapter());
  await Hive.openBox<ProjectDraft>('projects_drafts_box');

  runApp(
    const ProviderScope(
      child: SheikhEidApp(),
    ),
  );
}

class SheikhEidApp extends StatelessWidget {
  const SheikhEidApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'الشيخ العيد - استوديو المونتاج الهادف',
      debugShowCheckedModeBanner: false,
      locale: const Locale('ar', 'SA'),
      // دعم الوضع الداكن كافتراضي مع ألوان Material 3 الإسلامية
      themeMode: ThemeMode.dark,
      darkTheme: AppTheme.darkTheme,
      theme: AppTheme.darkTheme,
      home: const HomeScreen(),
    );
  }
}
`.trim(),
  },
  {
    path: 'lib/core/theme/app_theme.dart',
    filename: 'app_theme.dart',
    description: 'تطبيق معايير Material Design 3 والوضع الداكن الزمردي والذهبي',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ألوان الهوية: زمردي هادف، ذهبي وقور، وخلفيات داكنة
  static const Color primaryEmerald = Color(0xFF006C4C);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color primaryContainer = Color(0xFF89F8C7);
  static const Color onPrimaryContainer = Color(0xFF002114);

  static const Color secondaryGold = Color(0xFFE5B842);
  static const Color secondaryContainer = Color(0xFF574300);

  static const Color surfaceDark = Color(0xFF121316);
  static const Color surfaceContainer = Color(0xFF1E2024);
  static const Color surfaceContainerHigh = Color(0xFF292A2E);
  static const Color outlineVariant = Color(0xFF46484C);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: surfaceDark,
      colorScheme: const ColorScheme.dark(
        primary: primaryEmerald,
        onPrimary: onPrimary,
        primaryContainer: primaryContainer,
        onPrimaryContainer: onPrimaryContainer,
        secondary: secondaryGold,
        secondaryContainer: secondaryContainer,
        surface: surfaceDark,
        surfaceContainer: surfaceContainer,
        surfaceContainerHigh: surfaceContainerHigh,
        outlineVariant: outlineVariant,
      ),
      textTheme: GoogleFonts.cairoTextTheme(ThemeData.dark().textTheme),
      cardTheme: CardTheme(
        color: surfaceContainer,
        elevation: 1.5, // Subtle elevation
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF2B2C30), width: 1),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primaryEmerald,
          foregroundColor: onPrimary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 1.0, // Subtle elevation
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        ),
      ),
    );
  }
}
`.trim(),
  },
  {
    path: 'lib/features/home/screens/home_screen.dart',
    filename: 'home_screen.dart',
    description: 'الشاشة الرئيسية: بطاقات اختيار المقاس (9:16، 16:9، 1:1) بأزرار صلبة وظلال خفيفة وعرض المسودات',
    code: `import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../drafts/models/project_draft.dart';
import '../../editor/screens/video_editor_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'الشيخ العيد · استوديو المونتاج',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ترويسة ترحيبية
            Text(
              'اختر مقاس الفيديو للبدء',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'أبعاد محسنة لشبكات التواصل والمحتوى الديني الهادف',
              style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey),
            ),
            const SizedBox(height: 16),

            // بطاقات اختيار المقاس (Filled Buttons & Subtle Elevation)
            _buildRatioCard(
              context,
              title: 'ريلز وقصص (9:16)',
              subtitle: 'تيك توك، إنستغرام ريلز، يوتيوب شورتس',
              ratioTag: '9:16',
              aspectRatioType: AspectRatioType.portrait9x16,
              icon: Icons.smartphone_rounded,
            ),
            const SizedBox(height: 12),
            _buildRatioCard(
              context,
              title: 'يوتيوب وشاشات عرض (16:9)',
              subtitle: 'المحاضرات الكاملة والخطب المرئية العريضة',
              ratioTag: '16:9',
              aspectRatioType: AspectRatioType.landscape16x9,
              icon: Icons.tv_rounded,
            ),
            const SizedBox(height: 12),
            _buildRatioCard(
              context,
              title: 'مربع متناسق (1:1)',
              subtitle: 'منشورات إنستغرام وفيسبوك والبطاقات الدعوية',
              ratioTag: '1:1',
              aspectRatioType: AspectRatioType.square1x1,
              icon: Icons.crop_square_rounded,
            ),

            const SizedBox(height: 32),
            // قسم المسودات المحفوظة (Drafts via Hive)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'المسودات المحفوظة (Drafts)',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'قاعدة بيانات Hive المحلية',
                  style: theme.textTheme.labelSmall?.copyWith(color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildDraftsList(context),
          ],
        ),
      ),
    );
  }

  Widget _buildRatioCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required String ratioTag,
    required AspectRatioType aspectRatioType,
    required IconData icon,
  }) {
    return Card(
      elevation: 2, // Subtle elevation
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFF292A2E),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: const Color(0xFF89F8C7)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Solid Filled Button (زر صلب)
            FilledButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => VideoEditorScreen(
                      initialDraft: ProjectDraft.create(
                        title: 'مشروع جديد (\$ratioTag)',
                        ratio: aspectRatioType,
                      ),
                    ),
                  ),
                );
              },
              child: const Text('بدء التعديل'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDraftsList(BuildContext context) {
    final box = Hive.box<ProjectDraft>('projects_drafts_box');
    return ValueListenableBuilder(
      valueListenable: box.listenable(),
      builder: (context, Box<ProjectDraft> draftsBox, _) {
        if (draftsBox.isEmpty) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: Text(
                'لا توجد مسودات محفوظة. اختر مقاساً بالأعلى للبدء!',
                style: TextStyle(color: Colors.grey),
              ),
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: draftsBox.length,
          itemBuilder: (context, index) {
            final draft = draftsBox.getAt(index)!;
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: const Icon(Icons.movie_creation_outlined, color: Color(0xFF89F8C7)),
                title: Text(draft.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('الصوت الأصلي: \${draft.muteOriginalAudio ? "مكتوم (-an)" : "مفعّل"}'),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => VideoEditorScreen(initialDraft: draft),
                    ),
                  );
                },
              ),
            );
          },
        );
      },
    );
  }
}
`.trim(),
  },
  {
    path: 'lib/features/editor/screens/video_editor_screen.dart',
    filename: 'video_editor_screen.dart',
    description: 'شاشة المحرر: مشغل فيديو في الأعلى، شريط زمني في المنتصف، وشريط أدوات سفلي بأزرار صلبة',
    code: `import 'package:flutter/material.dart';
import '../../drafts/models/project_draft.dart';
import '../widgets/timeline_widget.dart';
import '../widgets/preview_player.dart';
import '../widgets/editor_bottom_bar.dart';
import '../../../services/ffmpeg_service.dart';

class VideoEditorScreen extends StatefulWidget {
  final ProjectDraft initialDraft;

  const VideoEditorScreen({super.key, required this.initialDraft});

  @override
  State<VideoEditorScreen> createState() => _VideoEditorScreenState();
}

class _VideoEditorScreenState extends State<VideoEditorScreen> {
  late ProjectDraft _draft;
  double _currentTime = 0.0;
  bool _isPlaying = false;

  @override
  void initState() {
    super.initState();
    _draft = widget.initialDraft;
  }

  // ميزة كتم وحجب الصوت الأصلي السريعة (Mute & Replace)
  void _toggleMuteOriginalAudio() {
    setState(() {
      _draft = _draft.copyWith(
        muteOriginalAudio: !_draft.muteOriginalAudio,
      );
    });
    _saveDraft();
  }

  void _saveDraft() {
    _draft.saveToHive();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('تم حفظ المسودة بنجاح في قاعدة بيانات Hive'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _exportVideo() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(
        child: Card(
          child: Padding(
            padding: EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(color: Color(0xFF006C4C)),
                SizedBox(height: 16),
                Text('جاري التصدير عبر ffmpeg_kit_flutter...'),
              ],
            ),
          ),
        ),
      ),
    );

    final success = await FFmpegService.processAndExport(draft: _draft);
    if (mounted) {
      Navigator.of(context).pop(); // dismiss loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? '✅ اكتمل تصدير الفيديو!' : '❌ فشل التصدير'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_draft.title),
        actions: [
          // زر كتم الصوت السريع
          IconButton(
            icon: Icon(
              _draft.muteOriginalAudio ? Icons.volume_off_rounded : Icons.volume_up_rounded,
              color: _draft.muteOriginalAudio ? Colors.amber : Colors.white,
            ),
            tooltip: 'كتم وحجب الصوت الأصلي',
            onPressed: _toggleMuteOriginalAudio,
          ),
          // زر حفظ المسودة
          IconButton(
            icon: const Icon(Icons.save_rounded),
            tooltip: 'حفظ المسودة',
            onPressed: _saveDraft,
          ),
          // زر التصدير
          FilledButton.icon(
            onPressed: _exportVideo,
            icon: const Icon(Icons.download_rounded, size: 16),
            label: const Text('تصدير'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // 1. مشغل الفيديو في الأعلى للمعاينة (Preview Player)
          Expanded(
            flex: 5,
            child: PreviewPlayer(
              draft: _draft,
              currentTime: _currentTime,
              isPlaying: _isPlaying,
              onPlayToggle: () => setState(() => _isPlaying = !_isPlaying),
            ),
          ),

          // 2. الشريط الزمني في المنتصف (Timeline)
          Expanded(
            flex: 3,
            child: TimelineWidget(
              draft: _draft,
              currentTime: _currentTime,
              onSeek: (newTime) => setState(() => _currentTime = newTime),
            ),
          ),

          // 3. شريط أدوات سفلي (إضافة نص، إضافة صورة/خلفية، المؤثرات الدينية، إدراج صوت)
          EditorBottomBar(
            onAddText: () => _showAddTextDialog(),
            onAddOverlayImage: () => _showAddImageDialog(),
            onReligiousEffects: () => _showSpiritualEffectsSheet(),
            onInsertAudio: () => _showAudioInsertDialog(),
          ),
        ],
      ),
    );
  }

  void _showAddTextDialog() {/* نافذة إضافة الآيات والنصوص القرآنية */}
  void _showAddImageDialog() {/* نافذة إضافة الخلفيات والزخارف الإسلامية */}
  void _showSpiritualEffectsSheet() {/* نافذة المؤثرات الروحانية والتوهج */}
  void _showAudioInsertDialog() {/* نافذة كتم واستبدال الصوت بالتلاوات */}
}
`.trim(),
  },
  {
    path: 'lib/services/ffmpeg_service.dart',
    filename: 'ffmpeg_service.dart',
    description: 'العصب الأساسي: أوامر FFmpeg Kit لمعالجة المقاسات، كتم الصوت، إضافة النصوص والمؤثرات',
    code: `import 'dart:io';
import 'package:ffmpeg_kit_flutter_full_gpl/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/return_code.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/session.dart';
import '../features/drafts/models/project_draft.dart';

class FFmpegService {
  /// العصب الأساسي لمعالجة وتصدير الفيديو باستخدام مكتبة ffmpeg_kit_flutter
  static Future<bool> processAndExport({
    required ProjectDraft draft,
    Function(double progress)? onProgress,
  }) async {
    // 1. تحديد أبعاد الفيديو بناء على المقاس المختار
    final dimensions = switch (draft.ratio) {
      AspectRatioType.portrait9x16 => 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
      AspectRatioType.landscape16x9 => 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080',
      AspectRatioType.square1x1 => 'scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080',
    };

    // 2. سلسلة الفلاتر (Filter Complex)
    final filterChains = <String>[];
    filterChains.add('[0:v]\$dimensions[v_scaled]');
    String currentVideoStream = 'v_scaled';

    // 3. إضافة المؤثرات الدينية (Vignette وتوهج ناعم)
    if (draft.hasVignette) {
      filterChains.add('[\$currentVideoStream]vignette=PI*0.35[v_fx]');
      currentVideoStream = 'v_fx';
    }

    // 4. طباعة النصوص والآيات القرآنية بخط عربي
    for (int i = 0; i < draft.textOverlays.length; i++) {
      final txt = draft.textOverlays[i];
      final textStream = 'v_txt_\$i';
      filterChains.add(
        '[\$currentVideoStream]drawtext=fontfile=assets/fonts/Amiri.ttf:text=\\'\${txt.text}\\':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h*0.8-text_h/2[\$textStream]',
      );
      currentVideoStream = textStream;
    }

    // 5. ميزة كتم واستبدال الصوت:
    // إذا كان muteOriginalAudio مفعلاً ويوجد مسار بديل، نقوم بحجب الصوت الأصلي (-an) ودمج المسار البديل
    final audioInputs = <String>[];
    String audioMapping = '-map 0:a?';

    if (draft.muteOriginalAudio && draft.replacementAudioPath != null) {
      audioInputs.addAll(['-i', draft.replacementAudioPath!]);
      audioMapping = '-map 1:a -af "volume=\${draft.replacementAudioVolume}"';
    } else if (draft.muteOriginalAudio) {
      audioMapping = '-an'; // كتم الصوت الأصلي بالكامل
    }

    // التحقق التام من امتداد مسار الإخراج وإجباره على .mp4
    String targetOutputPath = draft.outputPath.trim();
    if (!targetOutputPath.toLowerCase().endsWith('.mp4')) {
      targetOutputPath = '$targetOutputPath.mp4';
    }

    // هل مسار الخلفية صورة ثابتة؟ إذا كانت صورة، يجب وضع -loop 1 قبلها مباشرة
    final bool isStillImage = draft.videoPath.toLowerCase().endsWith('.jpg') ||
        draft.videoPath.toLowerCase().endsWith('.jpeg') ||
        draft.videoPath.toLowerCase().endsWith('.png') ||
        draft.videoPath.toLowerCase().endsWith('.webp');

    final inputLoopFlag = isStillImage ? '-loop 1' : '';
    final stillImageTuneFlag = isStillImage ? '-tune stillimage' : '';

    // الأمر النهائي المجمع لـ FFmpeg
    final String fullCommand = [
      '-y',
      inputLoopFlag,
      '-i "\${draft.videoPath}"',
      ...audioInputs,
      '-filter_complex "\${filterChains.join('; ')}"',
      '-map "[\$currentVideoStream]"',
      audioMapping,
      '-c:v libx264',
      stillImageTuneFlag,
      '-preset fast',
      '-crf 22',
      '-c:a aac',
      '-b:a 192k',
      '-pix_fmt yuv420p',
      '-shortest',
      '-movflags +faststart',
      '"\$targetOutputPath"',
    ].where((part) => part.isNotEmpty).join(' ');

    print('Executing FFmpeg Kit: \$fullCommand');

    final session = await FFmpegKit.executeAsync(
      fullCommand,
      (Session session) async {
        final returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          print('✅ تم التصدير بنجاح عبر ffmpeg_kit_flutter');
        } else {
          final failLog = await session.getFailStackTrace();
          print('❌ فشل التصدير: \${returnCode?.getValue()} | \$failLog');
        }
      },
    );

    final returnCode = await session.getReturnCode();
    return ReturnCode.isSuccess(returnCode);
  }

  /// الدالة القياسية المباشرة لدمج صورة ثابتة مع مقطع صوتي وإنتاج فيديو MP4 متكامل
  /// تحل مشكلة حفظ الفيديو كصورة فقط من خلال ترتيب الوسائط الإلزامي لـ FFmpeg:
  /// -loop 1 قبل مسار الصورة، -pix_fmt yuv420p، -tune stillimage، و -shortest
  static Future<bool> exportImageAndAudioToMp4Video({
    required String imagePath,
    required String audioPath,
    required String outputPath,
    Function(double progress)? onProgress,
  }) async {
    // 1. التحقق من وجود الملفات
    final imgFile = File(imagePath);
    final audioFile = File(audioPath);

    if (!await imgFile.exists()) {
      print('❌ خطأ: ملف الصورة غير موجود في: \$imagePath');
      return false;
    }
    if (!await audioFile.exists()) {
      print('❌ خطأ: ملف الصوت غير موجود في: \$audioPath');
      return false;
    }

    // 2. ضمان أن مسار الإخراج ينتهي بصيغة .mp4 بشكل صريح ومطلق
    String finalOutputPath = outputPath.trim();
    if (!finalOutputPath.toLowerCase().endsWith('.mp4')) {
      finalOutputPath = '\$finalOutputPath.mp4';
    }

    // 3. بناء أمر FFmpeg الدقيق وفق أفضل الممارسات:
    // ملاحظة: -loop 1 يجب أن يسبق -i imagePath ليفهم FFmpeg أنه دفق فيديو مستمر
    final String ffmpegCommand = [
      '-y',
      '-loop 1',
      '-i "\$imagePath"',
      '-i "\$audioPath"',
      '-c:v libx264',
      '-tune stillimage',
      '-c:a aac',
      '-b:a 192k',
      '-pix_fmt yuv420p',
      '-shortest',
      '-movflags +faststart',
      '"\$finalOutputPath"',
    ].join(' ');

    print('🚀 بدء تشغيل أمر FFmpeg لدمج الصورة والصوت إلى فيديو MP4:');
    print(ffmpegCommand);

    final session = await FFmpegKit.executeAsync(
      ffmpegCommand,
      (Session session) async {
        final returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          print('✅ تم إنتاج وتصدير فيديو MP4 بنجاح في: \$finalOutputPath');
        } else {
          final failTrace = await session.getFailStackTrace();
          print('❌ فشل أمر FFmpeg (كود: \${returnCode?.getValue()}): \$failTrace');
        }
      },
      (log) {
        print('[FFmpeg]: \${log.getMessage()}');
      },
      (statistics) {
        if (onProgress != null && statistics.getTime() > 0) {
          onProgress(statistics.getTime() / 1000.0);
        }
      },
    );

    final returnCode = await session.getReturnCode();
    return ReturnCode.isSuccess(returnCode);
  }
}
`.trim(),
  },
  {
    path: 'lib/features/drafts/models/project_draft.dart',
    filename: 'project_draft.dart',
    description: 'نموذج بيانات المسودة متوافق مع Hive للتخزين المحلي',
    code: `import 'package:hive/hive.dart';

part 'project_draft.g.dart';

@HiveType(typeId: 0)
enum AspectRatioType {
  @HiveField(0)
  portrait9x16,
  @HiveField(1)
  landscape16x9,
  @HiveField(2)
  square1x1,
}

@HiveType(typeId: 1)
class ProjectDraft extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String title;

  @HiveField(2)
  final AspectRatioType ratio;

  @HiveField(3)
  final String videoPath;

  @HiveField(4)
  final bool muteOriginalAudio; // ميزة كتم الصوت الأصلي

  @HiveField(5)
  final String? replacementAudioPath; // مسار الصوت البديل

  @HiveField(6)
  final double replacementAudioVolume;

  @HiveField(7)
  final bool hasVignette;

  @HiveField(8)
  final List<TextOverlayData> textOverlays;

  @HiveField(9)
  final String outputPath;

  ProjectDraft({
    required this.id,
    required this.title,
    required this.ratio,
    required this.videoPath,
    this.muteOriginalAudio = true,
    this.replacementAudioPath,
    this.replacementAudioVolume = 0.9,
    this.hasVignette = true,
    this.textOverlays = const [],
    required this.outputPath,
  });

  factory ProjectDraft.create({
    required String title,
    required AspectRatioType ratio,
  }) {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return ProjectDraft(
      id: 'draft_\$timestamp',
      title: title,
      ratio: ratio,
      videoPath: 'assets/sample_video.mp4',
      outputPath: 'output_sheikh_eid_\$timestamp.mp4',
    );
  }

  void saveToHive() {
    final box = Hive.box<ProjectDraft>('projects_drafts_box');
    box.put(id, this);
  }

  ProjectDraft copyWith({
    String? title,
    bool? muteOriginalAudio,
    String? replacementAudioPath,
  }) {
    return ProjectDraft(
      id: id,
      title: title ?? this.title,
      ratio: ratio,
      videoPath: videoPath,
      muteOriginalAudio: muteOriginalAudio ?? this.muteOriginalAudio,
      replacementAudioPath: replacementAudioPath ?? this.replacementAudioPath,
      replacementAudioVolume: replacementAudioVolume,
      hasVignette: hasVignette,
      textOverlays: textOverlays,
      outputPath: outputPath,
    );
  }
}

class TextOverlayData {
  final String text;
  final double startTime;
  final double endTime;

  TextOverlayData({required this.text, this.startTime = 0, this.endTime = 15});
}
`.trim(),
  },
  {
    path: 'lib/services/montage_effects_service.dart',
    filename: 'montage_effects_service.dart',
    description: 'معالجة مؤثرات المونتاج وقوائم يوتيوب والشاشات السوداء بنمط Blend Screen في FFmpeg',
    code: `import 'package:ffmpeg_kit_flutter_full_gpl/ffmpeg_kit.dart';

class MontageEffectsService {
  /// دمج كروما الشاشات السوداء ومؤثرات قائمة يوتيوب بنمط Screen
  static String buildMontageFilterComplex({
    required String baseVideoStream,
    required bool hasLightLeaks,
    required bool hasAudioSpectrum,
    required bool hasDustParticles,
    required bool hasGodRays,
    required bool hasFilmGrain,
  }) {
    final filters = <String>[];
    String currentStream = baseVideoStream;

    // 1. تسريبات ضوئية سينمائية (Light Leaks)
    if (hasLightLeaks) {
      filters.add('[\$currentStream]eq=gamma_r=1.2:gamma_g=1.05:gamma_b=0.85:saturation=1.15[v_leaks]');
      currentStream = 'v_leaks';
    }

    // 2. حبيبات فيلم قديم (35mm Grain)
    if (hasFilmGrain) {
      filters.add('[\$currentStream]noise=alls=20:allf=t+u[v_grain]');
      currentStream = 'v_grain';
    }

    // 3. موجات صوتية تفاعلية للقرآن (Audio Spectrum Visualizer)
    if (hasAudioSpectrum) {
      filters.add('[1:a]showwaves=s=720x90:mode=line:colors=0x89F8C7@0.85[v_spec]');
      filters.add('[\$currentStream][v_spec]overlay=x=(W-w)/2:y=H*0.86[v_spec_out]');
      currentStream = 'v_spec_out';
    }

    return filters.join('; ');
  }

  /// دمج فيديو كروما شاشة سوداء من يوتيوب باستخدام نمط Screen Blend
  static String buildChromaBlendFilter({
    required String mainVideoInput,
    required String chromaVideoInput,
    double opacity = 0.8,
  }) {
    return "-i \\"\$mainVideoInput\\" -i \\"\$chromaVideoInput\\" " +
           "-filter_complex \\"[0:v][1:v]blend=all_mode='screen':all_opacity=\$opacity[v_blended]\\" " +
           "-map \\"[v_blended]\\"";
  }
}
`.trim(),
  },
  {
    path: 'lib/services/speech_to_text_service.dart',
    filename: 'speech_to_text_service.dart',
    description: 'المرحلة 1: تحويل صوت الشيخ إلى نص مع التوقيت الدقيق لكل كلمة (Word-Level Timestamps via Whisper API)',
    code: `import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class TimedWordModel {
  final String word;
  final int startMs;
  final int endMs;

  TimedWordModel({required this.word, required this.startMs, required this.endMs});

  Map<String, dynamic> toJson() => {
    'word': word,
    'startMs': startMs,
    'endMs': endMs,
  };
}

class SpeechToTextService {
  /// تحويل المقطع الصوتي إلى نص وتوقيتات بالمللي ثانية باستخدام Whisper API
  static Future<List<TimedWordModel>> transcribeWithTimestamps({
    required File audioFile,
    required String apiKey,
  }) async {
    final uri = Uri.parse('https://api.openai.com/v1/audio/transcriptions');
    final request = http.MultipartRequest('POST', uri)
      ..headers['Authorization'] = 'Bearer \$apiKey'
      ..fields['model'] = 'whisper-1'
      ..fields['language'] = 'ar'
      ..fields['response_format'] = 'verbose_json'
      ..fields['timestamp_granularities[]'] = 'word'
      ..files.add(await http.MultipartFile.fromPath('file', audioFile.path));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final wordsJson = data['words'] as List<dynamic>? ?? [];

      return wordsJson.map((item) {
        final startSec = (item['start'] as num).toDouble();
        final endSec = (item['end'] as num).toDouble();
        return TimedWordModel(
          word: item['word'].toString().trim(),
          startMs: (startSec * 1000).toInt(),
          endMs: (endSec * 1000).toInt(),
        );
      }).toList();
    } else {
      throw Exception('فشل تحويل الصوت إلى نص: \${response.body}');
    }
  }
}
`.trim(),
  },
  {
    path: 'lib/services/ass_subtitle_generator.dart',
    filename: 'ass_subtitle_generator.dart',
    description: 'المرحلة 2 و 3: توليد ملفات الترجمة المتقدمة .ass بخط الرقعة والديواني مع أوامر FFmpeg Kit',
    code: `import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'speech_to_text_service.dart';

class AssSubtitleGenerator {
  /// توليد ملف ترجمة .ass متوافق مع خط الرقعة والديواني مع وسوم الكاراوكي
  static Future<File> generateAssFile({
    required List<TimedWordModel> words,
    String fontName = 'Aref Ruqaa',
    String primaryColor = '&H009EDFFF', // ذهبي دافئ
  }) async {
    final buffer = StringBuffer();

    // ترويسة ملف ASS لتحديد أبعاد الفيديو ودقة الخط
    buffer.writeln('[Script Info]');
    buffer.writeln('Title: Sheikh Eid Calligraphy');
    buffer.writeln('ScriptType: v4.00+');
    buffer.writeln('PlayResX: 1080');
    buffer.writeln('PlayResY: 1920');
    buffer.writeln('ScaledBorderAndShadow: yes');
    buffer.writeln();

    // تعريف الستايل: خط الرقعة / الديواني مع الظل
    buffer.writeln('[V4+ Styles]');
    buffer.writeln('Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding');
    buffer.writeln('Style: RuqaaHandwriting,\$fontName,68,\$primaryColor,&H00FFFFFF,&H00000000,&H90000000,-1,0,0,0,100,100,2,0,1,3,4,5,40,40,420,1');
    buffer.writeln();

    // أحداث الحوار والكلمات المتزامنة مع الصوت
    buffer.writeln('[Events]');
    buffer.writeln('Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text');

    if (words.isNotEmpty) {
      final start = _formatTime(words.first.startMs);
      final end = _formatTime(words.last.endMs + 1200);

      final karaokeText = words.map((w) {
        final durationCs = ((w.endMs - w.startMs) / 10).round();
        return '{\\\\k\$durationCs}\${w.word}';
      }).join(' ');

      buffer.writeln('Dialogue: 0,\$start,\$end,RuqaaHandwriting,,0,0,0,,\$karaokeText');
    }

    final tempDir = await getTemporaryDirectory();
    final file = File('\${tempDir.path}/calligraphy_subtitles.ass');
    return await file.writeAsString(buffer.toString());
  }

  /// أمر FFmpeg Kit لدمج صورة المخطوطة العتيقة مع الصوت وترجمة الخط اليدوي
  static String buildFfmpegParchmentCommand({
    required String parchmentImagePath,
    required String audioPath,
    required String assSubtitlePath,
    required String outputPath,
  }) {
    return '-loop 1 -i "\$parchmentImagePath" '
           '-i "\$audioPath" '
           '-vf "ass=\'\$assSubtitlePath\':fontsdir=assets/fonts" '
           '-c:v libx264 -tune stillimage -preset medium -crf 20 '
           '-c:a aac -b:a 192k -shortest -pix_fmt yuv420p -y "\$outputPath"';
  }

  static String _formatTime(int ms) {
    final totalSec = ms ~/ 1000;
    final h = totalSec ~/ 3600;
    final m = (totalSec % 3600) ~/ 60;
    final s = totalSec % 60;
    final cs = (ms % 1000) ~/ 10;
    return '\$h:\${m.toString().padLeft(2, '0')}:\${s.toString().padLeft(2, '0')}.\${cs.toString().padLeft(2, '0')}';
  }
}
`.trim(),
  },
  {
    path: 'lib/features/auto_lessons/screens/background_picker_screen.dart',
    filename: 'background_picker_screen.dart',
    description: 'المتطلب 1: واجهة Grid View لعرض واختيار الخلفيات الجاهزة من assets/backgrounds وتنسيق الكاريوكي',
    code: `import 'package:flutter/material.dart';
import '../../../services/smart_ffmpeg_merger_service.dart';

class ReadyBackground {
  final String id;
  final String title;
  final String category;
  final String assetPath;
  final bool isVideo;

  const ReadyBackground({
    required this.id,
    required this.title,
    required this.category,
    required this.assetPath,
    this.isVideo = false,
  });
}

class BackgroundPickerScreen extends StatefulWidget {
  const BackgroundPickerScreen({super.key});

  @override
  State<BackgroundPickerScreen> createState() => _BackgroundPickerScreenState();
}

class _BackgroundPickerScreenState extends State<BackgroundPickerScreen> {
  // 1. مكتبة الخلفيات الجاهزة المحفوظة محلياً في مجلد assets/backgrounds
  final List<ReadyBackground> _backgrounds = const [
    ReadyBackground(
      id: 'bg_1',
      title: 'أروقة المسجد العتيق',
      category: 'مساجد',
      assetPath: 'assets/backgrounds/mosque_arches.jpg',
    ),
    ReadyBackground(
      id: 'bg_2',
      title: 'المخطوطة والشمعة التراثية',
      category: 'مخطوطات',
      assetPath: 'assets/backgrounds/antique_parchment.jpg',
    ),
    ReadyBackground(
      id: 'bg_3',
      title: 'مئذنة الغروب الذهبي',
      category: 'مساجد',
      assetPath: 'assets/backgrounds/minaret_sunset.jpg',
    ),
    ReadyBackground(
      id: 'bg_4',
      title: 'المصحف الشريف المفتوح',
      category: 'مصاحف',
      assetPath: 'assets/backgrounds/quran_light.jpg',
    ),
    ReadyBackground(
      id: 'bg_5',
      title: 'فيديو زخارف إسلامية صامت',
      category: 'فيديو',
      assetPath: 'assets/backgrounds/silent_ornament_loop.mp4',
      isVideo: true,
    ),
  ];

  late ReadyBackground _selectedBackground;
  String _selectedCategory = 'الكل';
  String _selectedAudioPath = 'assets/audio/sheikh_lesson.mp3';
  String _fontFamily = 'Aref Ruqaa';
  Color _highlightColor = const Color(0xFFFFDF9E); // ذهبي دافئ للكاريوكي
  bool _isProcessing = false;
  double _processProgress = 0.0;

  @override
  void initState() {
    super.initState();
    _selectedBackground = _backgrounds.first;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filtered = _selectedCategory == 'الكل'
        ? _backgrounds
        : _backgrounds.where((b) => b.category == _selectedCategory).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('صناعة الدروس التلقائية'),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline_rounded),
            onPressed: _showInfoDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // شريط الفئات
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: ['الكل', 'مساجد', 'مخطوطات', 'مصاحف', 'فيديو'].map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: FilterChip(
                    label: Text(cat),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _selectedCategory = cat),
                    selectedColor: const Color(0xFF006C4C),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.grey[300],
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // شبكة الخلفيات الجاهزة (Grid View)
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.72,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final item = filtered[index];
                final isSelected = _selectedBackground.id == item.id;

                return GestureDetector(
                  onTap: () => setState(() => _selectedBackground = item),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF89F8C7) : const Color(0xFF2B2C30),
                        width: isSelected ? 2.5 : 1.0,
                      ),
                      boxShadow: isSelected
                          ? [BoxShadow(color: const Color(0xFF006C4C).withOpacity(0.4), blurRadius: 10)]
                          : null,
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        // الصورة التوضيحية
                        Image.asset(
                          item.assetPath,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: const Color(0xFF1E2024),
                            child: const Center(
                              child: Icon(Icons.image_outlined, color: Colors.grey),
                            ),
                          ),
                        ),

                        // شارة النوع
                        Positioned(
                          top: 8,
                          right: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.65),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              item.isVideo ? 'فيديو قصير' : 'خلفية ثابتة',
                              style: const TextStyle(fontSize: 10, color: Color(0xFF89F8C7)),
                            ),
                          ),
                        ),

                        // علامة التحديد
                        if (isSelected)
                          Positioned(
                            top: 8,
                            left: 8,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Color(0xFF006C4C),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.check, size: 16, color: Colors.white),
                            ),
                          ),

                        // العنوان السفلي
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                colors: [Colors.transparent, Colors.black87],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                            ),
                            child: Text(
                              item.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // شريط زر التنفيذ المباشر (Filled Button مع Subtle Elevation)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF1A1C1E),
              border: Border(top: BorderSide(color: Color(0xFF2B2C30))),
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton.icon(
                  onPressed: _isProcessing ? null : _startSmartMerge,
                  icon: _isProcessing
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.auto_awesome),
                  label: Text(_isProcessing ? 'جاري الدمج والتكرار...' : 'دمج الدرس التلقائي الآن'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _startSmartMerge() async {
    setState(() => _isProcessing = true);

    try {
      final success = await SmartFFmpegMergerService.mergeAutoLesson(
        backgroundAssetPath: _selectedBackground.assetPath,
        isBackgroundVideo: _selectedBackground.isVideo,
        audioPath: _selectedAudioPath,
        fontFamilyName: _fontFamily,
        karaokeHighlightHex: '#FFDF9E',
        onProgress: (p) => setState(() => _processProgress = p),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? '✅ اكتمل دمج الدرس بنجاح!' : '❌ حدث خطأ أثناء الدمج'),
            backgroundColor: success ? const Color(0xFF006C4C) : Colors.red[800],
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  void _showInfoDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('ميزة صناعة الدروس التلقائية'),
        content: const Text(
          'تقوم هذه الميزة بتكرار الخلفية المختارة تلقائياً لتطابق مدة صوت الشيخ بدقة، '
          'ثم تدمج الصوت الأصلي مع حرق الكلمات المتحركة بخط الرقعة مع تغيير لون الكلمة عند نطقها.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('حسناً')),
        ],
      ),
    );
  }
}
`.trim(),
  },
  {
    path: 'lib/services/smart_ffmpeg_merger_service.dart',
    filename: 'smart_ffmpeg_merger_service.dart',
    description: 'المتطلب 3: دالة الدمج الذكي الشاملة بـ ffmpeg_kit_flutter (Looping + Audio Merge + Karaoke ASS/Drawtext)',
    code: `import 'dart:io';
import 'package:ffmpeg_kit_flutter_full_gpl/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/return_code.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/session.dart';
import 'package:path_provider/path_provider.dart';

class SmartFFmpegMergerService {
  /// دالة الدمج الذكي باستخدام مكتبة ffmpeg_kit_flutter
  /// تقوم بما يلي بالتفصيل:
  /// 1. أخذ الخلفية الجاهزة (صورة أو فيديو) وتكرارها (Loop) لتطابق مدة الصوت
  /// 2. دمج الصوت الأصلي للشيخ مع الخلفية
  /// 3. طباعة النص المتحرك المخطوط فوق الفيديو باستخدام الفلتر (ass) أو (drawtext) مع تأثير الكاريوكي
  /// 4. استخدام خط عربي مخصص (خط الرقعة assets/fonts/aref_ruqaa.ttf)
  static Future<bool> mergeAutoLesson({
    required String backgroundAssetPath,
    required bool isBackgroundVideo,
    required String audioPath,
    String fontFamilyName = 'Aref Ruqaa',
    String karaokeHighlightHex = '#FFDF9E',
    Function(double progress)? onProgress,
  }) async {
    final tempDir = await getTemporaryDirectory();
    final outputPath = '\${tempDir.path}/output_auto_lesson_\${DateTime.now().millisecondsSinceEpoch}.mp4';

    // خطوة أ: توليد ملف الترجمة الكاريوكي بصيغة .ass للتحكم اللوني المتقدم
    final assFile = await _createKaraokeAssFile(
      tempDirPath: tempDir.path,
      fontName: fontFamilyName,
      highlightColorBgr: '&H009EDFFF', // صيغة BGR لـ #FFDF9E (الذهبي الدافئ)
    );

    // خطوة ب: بناء أمر FFmpeg المخصص
    // إذا كانت الخلفية صورة: نستخدم -loop 1
    // إذا كانت الخلفية فيديو صامت قصير: نستخدم -stream_loop -1
    final loopInputFlag = isBackgroundVideo ? '-stream_loop -1' : '-loop 1';

    // الفلتر الذكي:
    // 1. تغيير الحجم ليناسب مقاس ريلز 9:16 (1080x1920)
    // 2. تطبيق فلتر ass مع مسار الخط العربي assets/fonts
    final videoFilter = [
      'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
      'ass=\'\${assFile.path}\':fontsdir=\'assets/fonts/\'',
    ].join(',');

    // تجميع الأمر المتكامل:
    final ffmpegArgs = [
      '-y',
      loopInputFlag,
      '-i "\$backgroundAssetPath"',
      '-i "\$audioPath"',
      '-vf "\$videoFilter"',
      '-c:v libx264',
      isBackgroundVideo ? '-preset fast' : '-tune stillimage -preset medium',
      '-crf 20',
      '-c:a aac',
      '-b:a 192k',
      '-shortest', // إيقاف الفيديو بمجرد انتهاء ملف الصوت بدقة متناهية
      '-pix_fmt yuv420p',
      '"\$outputPath"',
    ].join(' ');

    print('🚀 بدء تشغيل أمر FFmpeg Kit للدمج الذكي:');
    print(ffmpegArgs);

    // تنفيذ الأمر عبر FFmpegKit بشكل غير متزامن مع رصد التقدم
    final session = await FFmpegKit.executeAsync(
      ffmpegArgs,
      (Session session) async {
        final state = await session.getState();
        final returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          print('✅ تم دمج وتوليد درس الشيخ بنجاح في: \$outputPath');
        } else {
          final failStackTrace = await session.getFailStackTrace();
          print('❌ خطأ في دمج FFmpeg: \$failStackTrace');
        }
      },
      (log) {
        // طباعة سجلات FFmpeg للمتابعة
        print('[FFmpegKit]: \${log.getMessage()}');
      },
      (statistics) {
        // تحديث شريط التقدم
        if (onProgress != null && statistics.getTime() > 0) {
          onProgress(statistics.getTime() / 1000.0);
        }
      },
    );

    final returnCode = await session.getReturnCode();
    return ReturnCode.isSuccess(returnCode);
  }

  /// إنشاء ملف .ass يحتوي على وسوم كاريوكي تلوين الكلمة لحظة نطقها
  static Future<File> _createKaraokeAssFile({
    required String tempDirPath,
    required String fontName,
    required String highlightColorBgr,
  }) async {
    final file = File('\$tempDirPath/lesson_karaoke.ass');
    final content = '''
[Script Info]
Title: Sheikh Eid Auto Lesson Karaoke
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: RuqaaKaraoke,\$fontName,72,\$highlightColorBgr,&H00FFFFFF,&H00000000,&H90000000,-1,0,0,0,100,100,2,0,1,3.5,4,5,60,60,450,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.30,0:00:15.00,RuqaaKaraoke,,0,0,0,,{\\\\k110}قِيَامُ {\\\\k140}اللَّيْلِ {\\\\k150}مِشْكَاةُ {\\\\k150}النُّورِ {\\\\k150}وَسَبِيلُ {\\\\k190}الْمُتَّقِينَ
''';
    return await file.writeAsString(content);
  }
}
`.trim(),
  },
  {
    path: 'lib/features/subtitles/services/karaoke_subtitles_pipeline.dart',
    filename: 'karaoke_subtitles_pipeline.dart',
    description: 'المراحل الثلاث المتكاملة: تحويل الصوت لنص بتوقيت الكلمات + توليد ملف ASS كاريوكي + دمج FFmpeg Kit مع معالجة الأخطاء',
    code: `import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:ffmpeg_kit_flutter_full_gpl/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/return_code.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/session.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

// ============================================================================
// نماذج البيانات (Data Models)
// ============================================================================

/// يمثل كلمة واحدة مع توقيتها الزمني بالثواني
class WordTimestamp {
  final String word;
  final double start; // بالثواني
  final double end;   // بالثواني

  WordTimestamp({
    required this.word,
    required this.start,
    required this.end,
  });

  factory WordTimestamp.fromJson(Map<String, dynamic> json) {
    return WordTimestamp(
      word: (json['word'] ?? '').toString().trim(),
      start: (json['start'] as num).toDouble(),
      end: (json['end'] as num).toDouble(),
    );
  }

  /// مدة نطق الكلمة بالـ Centiseconds (جزء من مئة من الثانية) المطلوبة لوسم ASS Karaoke \\k
  int get durationInCentiseconds {
    final diff = end - start;
    final cs = (diff * 100).round();
    return cs > 0 ? cs : 10; // الحد الأدنى 10 سنتي-ثانية لتفادي التوقيت الصفري
  }
}

/// نتيجة استجابة التفريغ الصوتي الشاملة
class TranscriptionResult {
  final String fullText;
  final List<WordTimestamp> words;

  TranscriptionResult({
    required this.fullText,
    required this.words,
  });
}

/// مراحل المعالجة لمتابعة شريط التقدم في واجهة المستخدم
enum PipelineStage {
  idle,
  transcribingAudio, // المرحلة 1: الاتصال بـ API
  generatingAssFile, // المرحلة 2: توليد ملف الترجمة الكاريوكي
  mergingWithFFmpeg, // المرحلة 3: معالجة الفيديو بـ FFmpeg
  completed,
  failed,
}

// ============================================================================
// المرحلة 1: تحويل الصوت إلى نص مع التوقيت الدقيق للكلمات (Speech-to-Text API)
// ============================================================================

class SpeechToTextService {
  final String apiKey;
  final http.Client _client;

  SpeechToTextService({
    required this.apiKey,
    http.Client? client,
  }) : _client = client ?? http.Client();

  /// إرسال الملف الصوتي واستخراج الكلمات مع التوقيت الزمني الدقيق (Word-level timestamps)
  /// يعتمد على نموذج OpenAI Whisper (verbose_json + timestamp_granularities[]=word)
  Future<TranscriptionResult> transcribeAudioWithWordTimestamps({
    required File audioFile,
    String language = 'ar', // اللغة العربية
  }) async {
    // 1. التحقق من وجود الملف الصوتي
    if (!await audioFile.exists()) {
      throw FileSystemException('الملف الصوتي المحدد غير موجود في المسار', audioFile.path);
    }

    final uri = Uri.parse('https://api.openai.com/v1/audio/transcriptions');

    try {
      final request = http.MultipartRequest('POST', uri);
      
      // الترويسات المطلوبة للمصادقة
      request.headers.addAll({
        'Authorization': 'Bearer \$apiKey',
        'Accept': 'application/json',
      });

      // إضافة ملف الصوت
      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          audioFile.path,
        ),
      );

      // المتغيرات الجوهرية للحصول على توقيت الكلمات بدقة:
      request.fields['model'] = 'whisper-1';
      request.fields['language'] = language;
      request.fields['response_format'] = 'verbose_json'; // ضروري جداً
      // طلب توقيت الكلمات من OpenAI Whisper API
      request.fields['timestamp_granularities[]'] = 'word';

      // إرسال الطلب مع مهلة زمنية (Timeout)
      final streamedResponse = await _client.send(request).timeout(
        const Duration(minutes: 3),
        onTimeout: () {
          throw TimeoutException('انتهت مهلة الاتصال بخادم التفريغ الصوتي (Timeout). يُرجى التحقق من سرعة الإنترنت.');
        },
      );

      final response = await http.Response.fromStream(streamedResponse);

      // معالجة رموز الاستجابة من الخادم
      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
        
        final fullText = decoded['text'] as String? ?? '';
        final wordsRaw = decoded['words'] as List<dynamic>? ?? [];

        if (wordsRaw.isEmpty) {
          throw Exception('لم يُرجع الـ API أي كلمات مجزأة بتوقيتات زمنية. تأكد من جودة الصوت ووضوحه.');
        }

        final wordsList = wordsRaw
            .map((w) => WordTimestamp.fromJson(w as Map<String, dynamic>))
            .where((w) => w.word.trim().isNotEmpty)
            .toList();

        return TranscriptionResult(
          fullText: fullText,
          words: wordsList,
        );
      } else if (response.statusCode == 401) {
        throw const HttpException('مفتاح الـ API غير صالح (Unauthorized: 401). تأكد من إعداد OpenAI API Key بشكل صحيح.');
      } else if (response.statusCode == 429) {
        throw const HttpException('تم تجاوز الحصة المتاحة للـ API أو كثرة الطلبات (Rate Limit / Quota Exceeded: 429).');
      } else {
        throw HttpException(
          'فشل الاتصال بخادم التفريغ الصوتي (كود: \${response.statusCode}): \${response.body}',
        );
      }
    } on SocketException {
      // معالجة انقطاع الاتصال بالإنترنت
      throw const SocketException('تعذر الاتصال بالإنترنت. يرجى التأكد من تشغيل بيانات الهاتف أو الواي فاي والمحاولة ثانية.');
    } catch (e) {
      rethrow;
    }
  }
}

// ============================================================================
// المرحلة 2: توليد ملف الترجمة والكاريوكي المتقدم (.ass - Advanced SubStation Alpha)
// ============================================================================

class AssKaraokeGenerator {
  /// تحويل الثواني إلى صيغة توقيت ASS الدقيقة: H:MM:SS.cs (مثال: 0:01:23.45)
  static String formatAssTime(double seconds) {
    if (seconds < 0) seconds = 0;
    final int hours = seconds ~/ 3600;
    final int minutes = (seconds % 3600) ~/ 60;
    final double secs = seconds % 60;
    final int wholeSecs = secs.toInt();
    final int centis = ((secs - wholeSecs) * 100).round();

    final hStr = hours.toString();
    final mStr = minutes.toString().padLeft(2, '0');
    final sStr = wholeSecs.toString().padLeft(2, '0');
    final cStr = centis.toString().padLeft(2, '0');

    return '\$hStr:\$mStr:\$sStr.\$cStr';
  }

  /// تحويل كود اللون السداسي Hex RGB (مثل 0xFFE5B842 أو #E5B842)
  /// إلى صيغة ألوان ASS BGR القياسية (&HAABBGGRR&)
  static String hexToAssBgr(int colorHex, {int alpha = 0}) {
    final r = (colorHex >> 16) & 0xFF;
    final g = (colorHex >> 8) & 0xFF;
    final b = colorHex & 0xFF;
    final a = alpha & 0xFF;

    final aHex = a.toRadixString(16).padLeft(2, '0').toUpperCase();
    final bHex = b.toRadixString(16).padLeft(2, '0').toUpperCase();
    final gHex = g.toRadixString(16).padLeft(2, '0').toUpperCase();
    final rHex = r.toRadixString(16).padLeft(2, '0').toUpperCase();

    return '&H\$aHex\$bHex\$gHex\$rHex';
  }

  /// دالة ذكية لتجميع الكلمات في أسطر حوارية (Dialogue Lines)
  /// تقطع الأسطر عند الوقفات الزمنية (> 0.6 ثانية) أو عند بلوغ الحد الأقصى للكلمات في السطر (6 كلمات)
  static List<List<WordTimestamp>> groupWordsIntoLines(
    List<WordTimestamp> words, {
    int maxWordsPerLine = 6,
    double pauseThresholdSeconds = 0.65,
  }) {
    final List<List<WordTimestamp>> lines = [];
    List<WordTimestamp> currentLine = [];

    for (int i = 0; i < words.length; i++) {
      final currentWord = words[i];

      if (currentLine.isNotEmpty) {
        final prevWord = currentLine.last;
        final silenceGap = currentWord.start - prevWord.end;

        // إذا كانت هناك وقفة تنفس أو سكتة بين الكلمات، أو اكتمل طول السطر المناسب للشاشة
        if (silenceGap >= pauseThresholdSeconds || currentLine.length >= maxWordsPerLine) {
          lines.add(List.from(currentLine));
          currentLine.clear();
        }
      }

      currentLine.add(currentWord);
    }

    if (currentLine.isNotEmpty) {
      lines.add(currentLine);
    }

    return lines;
  }

  /// توليد ملف .ass المتكامل وحفظه محلياً في مجلد المستندات أو الملفات المؤقتة
  static Future<File> generateAssFile({
    required List<WordTimestamp> words,
    String? customOutputPath,
    String fontName = 'Aref Ruqaa', // خط الرقعة العربي الجميل
    int fontSize = 76,
    int normalTextColor = 0xFFFFFF,      // أبيض ناصع قبل النطق
    int highlightColor = 0xE5B842,       // ذهبي هادف متوهج لحظة نطق الكلمة
    int outlineColor = 0x000000,         // تحديد أسود لضمان الوضوح على أي خلفية
    int shadowColor = 0x111111,
    int alignment = 5,                   // 5 = منتصف الشاشة (Center)، 2 = أسفل الشاشة
    int marginV = 280,                   // الهامش العمودي من الأسفل/الأعلى
    int playResX = 1080,                 // أبعاد الفيديو العمودي ريلز/تيك توك
    int playResY = 1920,
  }) async {
    final buffer = StringBuffer();

    // 1. ترويسة ملف ASS الأساسية
    buffer.writeln('[Script Info]');
    buffer.writeln('Title: Synchronized Arabic Karaoke Subtitles');
    buffer.writeln('ScriptType: v4.00+');
    buffer.writeln('WrapStyle: 0');
    buffer.writeln('ScaledBorderAndShadow: yes');
    buffer.writeln('YCbCr Matrix: TV.709');
    buffer.writeln('PlayResX: \$playResX');
    buffer.writeln('PlayResY: \$playResY');
    buffer.writeln();

    // 2. جدول الأنماط والتنسيقات (V4+ Styles)
    // PrimaryColour: اللون الافتراضي للكلمة قبل نطقها (أبيض)
    // SecondaryColour: لون الكاريوكي الذي تتلون به الكلمة عند نطقها (ذهبي)
    final primaryAssBgr = hexToAssBgr(normalTextColor, alpha: 0x00);
    final secondaryAssBgr = hexToAssBgr(highlightColor, alpha: 0x00);
    final outlineAssBgr = hexToAssBgr(outlineColor, alpha: 0x00);
    final backAssBgr = hexToAssBgr(shadowColor, alpha: 0x80);

    buffer.writeln('[V4+ Styles]');
    buffer.writeln('Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding');
    // Encoding 178 هو كود التشفير العربي القياسي في ASS
    buffer.writeln(
      'Style: ArabicKaraokeStyle,\$fontName,\$fontSize,\$primaryAssBgr,\$secondaryAssBgr,\$outlineAssBgr,\$backAssBgr,-1,0,0,0,100,100,2,0,1,3.8,4.5,\$alignment,50,50,\$marginV,178',
    );
    buffer.writeln();

    // 3. قسم الحوارات والأحداث المتزامنة (Events & Karaoke Dialogue)
    buffer.writeln('[Events]');
    buffer.writeln('Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text');

    // تقسيم الكلمات إلى أسطر متناغمة
    final lines = groupWordsIntoLines(words);

    for (final line in lines) {
      if (line.isEmpty) continue;

      final lineStartSec = line.first.start;
      final lineEndSec = line.last.end + 0.25; // إضافة مهلة ربع ثانية لراحة العين بعد نهاية آخر كلمة

      final startAss = formatAssTime(lineStartSec);
      final endAss = formatAssTime(lineEndSec);

      // بناء نص الكاريوكي باستخدام وسم {\\k<مدة_الكلمة_بالسنتيثانية>}
      // كل وسم \\k يحدد للمشغل متى يغير لون الكلمة بالضبط وتزامن الحروف
      final textBuffer = StringBuffer();
      for (final word in line) {
        textBuffer.write('{\\\\k\${word.durationInCentiseconds}}\${word.word} ');
      }

      final lineAssText = textBuffer.toString().trim();
      buffer.writeln('Dialogue: 0,\$startAss,\$endAss,ArabicKaraokeStyle,,0,0,0,,\$lineAssText');
    }

    // 4. حفظ الملف في الذاكرة المحلية
    String targetPath = customOutputPath ?? '';
    if (targetPath.isEmpty) {
      final tempDir = await getTemporaryDirectory();
      targetPath = '\${tempDir.path}/arabic_karaoke_\${DateTime.now().millisecondsSinceEpoch}.ass';
    }

    final assFile = File(targetPath);
    await assFile.writeAsString(buffer.toString(), encoding: utf8);
    return assFile;
  }
}

// ============================================================================
// المرحلة 3: الدمج باستخدام FFmpeg (ffmpeg_kit_flutter)
// ============================================================================

class VideoMergeResult {
  final bool isSuccess;
  final String outputPath;
  final String? errorMessage;
  final int? returnCode;

  VideoMergeResult({
    required this.isSuccess,
    required this.outputPath,
    this.errorMessage,
    this.returnCode,
  });
}

class KaraokeVideoMerger {
  /// دمج (الخلفية المرئية + المسار الصوتي + ملف الترجمة .ass)
  /// مع معالجة هروب المسارات (Path Escaping) بدقة لمنع انهيار FFmpeg
  static Future<VideoMergeResult> mergeKaraokeVideo({
    required String visualBackgroundPath, // مسار صورة أو فيديو خلفية
    required String audioPath,            // مسار الصوت الأصلي
    required String assSubtitlePath,       // مسار ملف .ass الذي ولدناه في المرحلة 2
    required String outputPath,           // مسار الفيديو النهائي المنشأ
    bool isBackgroundStaticImage = false, // هل الخلفية صورة ثابتة تحتاج تكرار (-loop 1)؟
    String? fontsDirectoryPath,           // مسار مجلد الخطوط المخصصة مثل assets/fonts
    void Function(double progress)? onProgress,
    void Function(String logMessage)? onLog,
  }) async {
    // 1. التحقق من وجود جميع ملفات الإدخال
    if (!await File(visualBackgroundPath).exists()) {
      return VideoMergeResult(
        isSuccess: false,
        outputPath: outputPath,
        errorMessage: 'ملف الخلفية المرئية غير موجود: \$visualBackgroundPath',
      );
    }
    if (!await File(audioPath).exists()) {
      return VideoMergeResult(
        isSuccess: false,
        outputPath: outputPath,
        errorMessage: 'ملف الصوت غير موجود: \$audioPath',
      );
    }
    if (!await File(assSubtitlePath).exists()) {
      return VideoMergeResult(
        isSuccess: false,
        outputPath: outputPath,
        errorMessage: 'ملف الترجمة ASS غير موجود: \$assSubtitlePath',
      );
    }

    // حذف ملف الإخراج السابق إن وُجد لتفادي تعارض الأذونات
    final targetOutputFile = File(outputPath);
    if (await targetOutputFile.exists()) {
      try {
        await targetOutputFile.delete();
      } catch (_) {}
    }

    // 2. تجهيز مسار فلتر ASS مع الهروب الصحيح:
    // في فلاتر FFmpeg على أندرويد وiOS والويندوز، رمز النقطتين (:) والشرطة المائلة العكسية (\\)
    // تُفسر كفواصل داخلية للفلتر ويجب الهروب منها بـ \\: لتفادي كراش FFmpeg الشهير
    final escapedAssPath = assSubtitlePath
        .replaceAll(r'\\', '/')
        .replaceAll(':', r'\\:');

    // إعداد فلتر الفيديو Video Filter
    String videoFilter = "ass='\$escapedAssPath'";
    if (fontsDirectoryPath != null && fontsDirectoryPath.isNotEmpty) {
      final escapedFontsDir = fontsDirectoryPath
          .replaceAll(r'\\', '/')
          .replaceAll(':', r'\\:');
      videoFilter = "ass='\$escapedAssPath':fontsdir='\$escapedFontsDir'";
    }

    // 3. بناء قائمة وسائط أمر FFmpeg Kit
    final List<String> commandArgs = [
      '-y', // الكتابة فوق الملفات الموجودة تلقائياً
    ];

    if (isBackgroundStaticImage) {
      commandArgs.addAll([
        '-loop', '1',
        '-framerate', '30',
        '-i', visualBackgroundPath,
      ]);
    } else {
      commandArgs.addAll([
        '-i', visualBackgroundPath,
      ]);
    }

    commandArgs.addAll([
      '-i', audioPath,
      '-vf', videoFilter,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '21',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest', // إيقاف الفيديو بالضبط عند انتهاء المقطع الصوتي
      '-pix_fmt', 'yuv420p',
      outputPath,
    ]);

    final String fullCommandLine = commandArgs.map((arg) {
      if (arg.contains(' ') || arg.contains('=') || arg.contains(':')) {
        return '"\$arg"';
      }
      return arg;
    }).join(' ');

    onLog?.call('تشغيل أمر FFmpeg Kit: \$fullCommandLine');

    // 4. تنفيذ الأمر ومتابعة التقدم
    final Completer<VideoMergeResult> completer = Completer<VideoMergeResult>();

    await FFmpegKit.executeAsync(
      fullCommandLine,
      (Session session) async {
        final returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          completer.complete(
            VideoMergeResult(
              isSuccess: true,
              outputPath: outputPath,
              returnCode: returnCode?.getValue(),
            ),
          );
        } else if (ReturnCode.isCancel(returnCode)) {
          completer.complete(
            VideoMergeResult(
              isSuccess: false,
              outputPath: outputPath,
              errorMessage: 'تم إلغاء عملية الدمج من قِبل المستخدم.',
              returnCode: returnCode?.getValue(),
            ),
          );
        } else {
          final failStackTrace = await session.getFailStackTrace();
          final logs = await session.getAllLogsAsString();
          completer.complete(
            VideoMergeResult(
              isSuccess: false,
              outputPath: outputPath,
              errorMessage: 'فشل أمر FFmpeg Kit (كود \${returnCode?.getValue()}): \${failStackTrace ?? logs}',
              returnCode: returnCode?.getValue(),
            ),
          );
        }
      },
      (log) {
        onLog?.call(log.getMessage());
      },
      (statistics) {
        if (onProgress != null && statistics.getTime() > 0) {
          // تقدم بالثواني
          onProgress(statistics.getTime() / 1000.0);
        }
      },
    );

    return completer.future;
  }
}

// ============================================================================
// الدالة المتكاملة الكبرى (The Complete Master Pipeline Function)
// ============================================================================

class AudioToKaraokeVideoPipeline {
  final SpeechToTextService sttService;

  AudioToKaraokeVideoPipeline({
    required String openAiApiKey,
  }) : sttService = SpeechToTextService(apiKey: openAiApiKey);

  /// الدالة الرئيسية التي تربط المراحل الثلاث من البداية حتى استخراج الفيديو النهائي
  /// مع رصد التقدم ومعالجة كافة أنواع الأخطاء (انقطاع الإنترنت، خطأ المفتاح، فشل الدمج)
  Future<String> executePipeline({
    required File audioFile,
    required String backgroundMediaFilePath,
    required String outputVideoFilePath,
    bool isBackgroundStaticImage = false,
    String arabicFontName = 'Aref Ruqaa',
    int highlightColorHex = 0xE5B842, // ذهبي
    void Function(PipelineStage stage, String statusMessage, double? progress)? onProgressUpdate,
  }) async {
    File? generatedAssFile;

    try {
      // -------------------------------------------------------------
      // المرحلة 1: تحويل الصوت إلى نص مع توقيت الكلمات (Speech-to-Text)
      // -------------------------------------------------------------
      onProgressUpdate?.call(
        PipelineStage.transcribingAudio,
        'المرحلة 1/3: جاري رفع الصوت وتوليد توقيتات الكلمات عبر الذكاء الاصطناعي...',
        0.1,
      );

      final transcription = await sttService.transcribeAudioWithWordTimestamps(
        audioFile: audioFile,
        language: 'ar',
      );

      // -------------------------------------------------------------
      // المرحلة 2: بناء وتوليد ملف الترجمة والكاريوكي .ass
      // -------------------------------------------------------------
      onProgressUpdate?.call(
        PipelineStage.generatingAssFile,
        'المرحلة 2/3: تم استخراج \${transcription.words.length} كلمة بتوقيت دقيق. جاري توليد ملف ASS كاريوكي...',
        0.4,
      );

      generatedAssFile = await AssKaraokeGenerator.generateAssFile(
        words: transcription.words,
        fontName: arabicFontName,
        highlightColor: highlightColorHex,
      );

      // -------------------------------------------------------------
      // المرحلة 3: دمج الفيديو والصوت وترجمة الكاريوكي عبر FFmpeg Kit
      // -------------------------------------------------------------
      onProgressUpdate?.call(
        PipelineStage.mergingWithFFmpeg,
        'المرحلة 3/3: جاري دمج الفيديو وتطبيق تأثير المخطوط المتزامن عبر محرك FFmpeg...',
        0.7,
      );

      final mergeResult = await KaraokeVideoMerger.mergeKaraokeVideo(
        visualBackgroundPath: backgroundMediaFilePath,
        audioPath: audioFile.path,
        assSubtitlePath: generatedAssFile.path,
        outputPath: outputVideoFilePath,
        isBackgroundStaticImage: isBackgroundStaticImage,
        onProgress: (secondsProcessed) {
          onProgressUpdate?.call(
            PipelineStage.mergingWithFFmpeg,
            'جاري معالجة إطارات الفيديو (\$secondsProcessed ثانية)...',
            0.8,
          );
        },
      );

      if (!mergeResult.isSuccess) {
        throw Exception(mergeResult.errorMessage ?? 'فشل غير معروف في دمج الفيديو عبر FFmpeg.');
      }

      onProgressUpdate?.call(
        PipelineStage.completed,
        'اكتملت العملية بنجاح! تم إنشاء الفيديو النهائي بالخط المتزامن.',
        1.0,
      );

      return outputVideoFilePath;
    } on SocketException catch (e) {
      onProgressUpdate?.call(PipelineStage.failed, e.message, 0.0);
      rethrow;
    } on TimeoutException catch (e) {
      onProgressUpdate?.call(PipelineStage.failed, e.message ?? 'انتهت مهلة الطلب', 0.0);
      rethrow;
    } catch (e) {
      onProgressUpdate?.call(PipelineStage.failed, 'حدث خطأ: \$e', 0.0);
      rethrow;
    } finally {
      // تنظيف الملف المؤقت .ass بعد الانتهاء للحفاظ على مساحة تخزين الجهاز
      if (generatedAssFile != null && await generatedAssFile.exists()) {
        try {
          await generatedAssFile.delete();
        } catch (_) {}
      }
    }
  }
}
`.trim(),
  },
];

export const FlutterCodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const combinedContent = FLUTTER_FILES.map(
      (f) => `// ===================== ${f.path} =====================\n\n${f.code}\n\n`
    ).join('\n');
    
    const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sheikh_eid_flutter_codebase.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Intro Header */}
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121316] border border-[#2B2C30] text-xs text-[#89F8C7] mb-2">
            <Smartphone className="w-3.5 h-3.5 text-[#006C4C]" />
            <span>هيكلية فلاتر ولغة Dart النظيفة (Clean Architecture)</span>
          </div>
          <h2 className="text-xl font-bold text-[#E3E2E6]">
            كود تطبيق فلاتر ومكتبة ffmpeg_kit_flutter
          </h2>
          <p className="text-xs text-[#8E9192] mt-1">
            جميع الملفات البرمجية جاهزة للنسخ أو الاستخدام المباشر في بيئة تطوير Flutter مع Hive و Material Design 3.
          </p>
        </div>

        <button
          onClick={handleDownloadAll}
          className="px-4 py-2.5 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>تحميل حزمة الأكواد الكاملة</span>
        </button>
      </div>

      {/* Explorer & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Folder Tree Explorer */}
        <div className="lg:col-span-4 bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="text-xs font-bold text-[#E3E2E6] flex items-center gap-2 pb-2 border-b border-[#2B2C30]">
            <Layers className="w-4 h-4 text-[#89F8C7]" />
            <span>تقسيم المجلدات (Folder Structure)</span>
          </div>

          <div className="space-y-1">
            {FLUTTER_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-right p-2.5 rounded-xl text-xs font-mono flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-[#006C4C] text-white font-bold shadow-sm'
                      : 'text-[#C4C7C8] hover:bg-[#202226] hover:text-white'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#89F8C7]'}`} />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#2B2C30] text-[11px] text-[#8E9192] space-y-1">
            <p className="font-semibold text-[#E3E2E6]">تعليمات التشغيل:</p>
            <p>1. انسخ محتويات <code className="text-[#89F8C7]">pubspec.yaml</code></p>
            <p>2. شغّل أمر <code className="text-[#89F8C7]">flutter pub get</code></p>
            <p>3. شغّل التطبيق على أندرويد أو iOS</p>
          </div>
        </div>

        {/* Right: Code Inspector */}
        <div className="lg:col-span-8 bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl overflow-hidden shadow-md flex flex-col">
          
          {/* File Tab Header */}
          <div className="p-4 bg-[#17191C] border-b border-[#2B2C30] flex items-center justify-between gap-4">
            <div className="truncate">
              <span className="text-xs font-mono font-bold text-[#89F8C7] block truncate">
                {selectedFile.path}
              </span>
              <span className="text-[11px] text-[#8E9192] block truncate">
                {selectedFile.description}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#292A2E] hover:bg-[#333539] text-xs font-semibold text-[#E3E2E6] flex items-center gap-1.5 transition-colors border border-[#36373B] shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الملف</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="p-4 bg-[#0F1012] overflow-x-auto max-h-[580px] overflow-y-auto">
            <pre className="text-xs font-mono text-[#D4D7D8] leading-relaxed select-all">
              {selectedFile.code}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
