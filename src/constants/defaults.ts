/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AspectRatioOption, AudioTrackConfig, SpiritualEffect, TextOverlay, MontageChromaOverlay, ParticleOverlayItem } from '../types';
import assetMinaretSunset from '../assets/images/islamic_minaret_sunset_1792362066189.jpg';
import assetQuranLight from '../assets/images/quran_golden_light_1792362066937.jpg';
import assetArabicOrnament from '../assets/images/arabic_islamic_ornament_1792362065806.jpg';

export const ASSET_MINARET_SUNSET = assetMinaretSunset;
export const ASSET_QURAN_LIGHT = assetQuranLight;
export const ASSET_ARABIC_ORNAMENT = assetArabicOrnament;

export const USER_REQUESTED_YOUTUBE_PLAYLIST = 'https://youtube.com/playlist?list=PLrLWduRCe1BSpKi0qav8gSjrLIIUKZ4gn&si=-NP_TMWxDVhZAIvW';

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  {
    id: '9:16',
    title: 'ريلز وقصص (9:16)',
    subtitle: 'تيك توك، إنستغرام ريلز، شورتس',
    dimensions: '1080 × 1920',
    iconName: 'Smartphone',
    widthRatio: 9,
    heightRatio: 16,
    recommendedFor: 'الأكثر شيوعاً للمقاطع الدعوية القصيرة'
  },
  {
    id: '16:9',
    title: 'فيديو أفقي (16:9)',
    subtitle: 'يوتيوب والشاشات العريضة',
    dimensions: '1920 × 1080',
    iconName: 'Monitor',
    widthRatio: 16,
    heightRatio: 9,
    recommendedFor: 'للخطب والدروس والمحاضرات الكاملة'
  },
  {
    id: '1:1',
    title: 'مربع متناسق (1:1)',
    subtitle: 'منشورات إنستغرام وفيسبوك',
    dimensions: '1080 × 1080',
    iconName: 'Square',
    widthRatio: 1,
    heightRatio: 1,
    recommendedFor: 'للأقوال والبطاقات الدعوية المربعة'
  }
];

export const DEFAULT_SPIRITUAL_EFFECTS: SpiritualEffect[] = [
  // --- التأثيرات النورانية الأساسية ---
  {
    id: 'spiritual_glow',
    name: 'توهج روحاني ناعم',
    description: 'إضاءة نورانية خافتة تمنح المشهد قدسية وسكينة بصرية',
    intensity: 65,
    enabled: true,
    category: 'lighting',
    tag: 'نوراني'
  },
  {
    id: 'golden_dust',
    name: 'حبيبات نورانية متطايرة (Dust Particles)',
    description: 'ذرات غبار ذهبية وبوكيه تسبح في مسار الضوء ببطء وهدوء',
    intensity: 55,
    enabled: false,
    category: 'particles',
    tag: 'كروما شائعة'
  },
  {
    id: 'light_leaks',
    name: 'تسريبات ضوئية سينمائية (Light Leaks)',
    description: 'ومضات ضوئية دافئة ومتحركة تحاكي عدسات السينما الاحترافية',
    intensity: 60,
    enabled: true,
    category: 'lighting',
    tag: 'مؤثرات المونتاج'
  },
  {
    id: 'audio_spectrum',
    name: 'موجات صوتية قرآنية (Audio Spectrum)',
    description: 'طيف صوتي متحرك ينبض بدقة مع نغمات التلاوة والأذان',
    intensity: 70,
    enabled: true,
    category: 'visualizer',
    tag: 'تفاعلي'
  },
  {
    id: 'god_rays',
    name: 'أشعة النور الإلهية (God Rays)',
    description: 'خيوط نورانية منحدرة من السماء تخترق المشهد بوقار',
    intensity: 50,
    enabled: false,
    category: 'lighting',
    tag: 'روحاني'
  },
  {
    id: 'heavenly_clouds',
    name: 'سحاب وضباب روحاني (Heavenly Mist)',
    description: 'طبقات ضباب بيضاء خفيفة تتهادى أسفل المشهد لجو من الخشوع',
    intensity: 45,
    enabled: false,
    category: 'particles',
    tag: 'هدوء'
  },
  {
    id: 'vintage_film_grain',
    name: 'حبيبات فيلم قديم (Retro 35mm Grain)',
    description: 'تعتيق بصري كلاسيكي وخطوط شريط قديم يمنح الفيديو طابعاً أصيلاً',
    intensity: 40,
    enabled: false,
    category: 'vintage',
    tag: 'سينمائي'
  },
  {
    id: 'arabesque_vignette',
    name: 'إطار إسلامي ناعم (Vignette)',
    description: 'تعتيم سينمائي هادئ مع زوايا أرابيسك تحصر التركيز في المنتصف',
    intensity: 55,
    enabled: true,
    category: 'lighting',
    tag: 'تركيز'
  },
  {
    id: 'warm_dawn',
    name: 'أشعة الفجر الدافئة (Warm Dawn)',
    description: 'تدريج لوني دافئ يحاكي شروق شمس الفجر الصادق',
    intensity: 40,
    enabled: false,
    category: 'lighting',
    tag: 'دفء'
  },
  {
    id: 'pulse_heartbeat',
    name: 'نبض المشهد (Pulse & Heartbeat)',
    description: 'حركة نبضية رقيقة تحاكي وجيب القلب مع الآيات المؤثرة',
    intensity: 35,
    enabled: false,
    category: 'motion',
    tag: 'تفاعلي'
  },
  {
    id: 'focus_reveal',
    name: 'ظهور بالفوكس والضبابية (Gaussian Reveal)',
    description: 'انتقال تدريجي ناعم من الضبابية للوضوح التام للآية',
    intensity: 50,
    enabled: false,
    category: 'motion',
    tag: 'انتقال'
  },
  {
    id: 'islamic_gold_frame',
    name: 'إطار أرابيسك مذهب (Animated Gold Frame)',
    description: 'حواف هندسية إسلامية مذهبة تحيط بكادر الفيديو بنمط راقٍ',
    intensity: 65,
    enabled: false,
    category: 'lighting',
    tag: 'إسلامي'
  }
];

export const DEFAULT_CHROMA_OVERLAYS: MontageChromaOverlay[] = [
  {
    id: 'chroma_light_leaks',
    name: 'كروما شاشة سوداء: تسريب ضوئي دافئ (Light Leak #1)',
    blendMode: 'screen',
    opacity: 0.8,
    enabled: true,
    type: 'light_flare',
    youtubeLink: USER_REQUESTED_YOUTUBE_PLAYLIST,
  },
  {
    id: 'chroma_gold_bokeh',
    name: 'كروما شاشة سوداء: ذرات بوكيه متلألئة (Gold Bokeh #2)',
    blendMode: 'screen',
    opacity: 0.75,
    enabled: true,
    type: 'particles',
    youtubeLink: USER_REQUESTED_YOUTUBE_PLAYLIST,
  },
  {
    id: 'chroma_audio_visualizer',
    name: 'كروما شاشة سوداء: أمواج صوتية للقرآن (Spectrum #3)',
    blendMode: 'screen',
    opacity: 0.85,
    enabled: true,
    type: 'spectrum',
    youtubeLink: USER_REQUESTED_YOUTUBE_PLAYLIST,
  },
  {
    id: 'chroma_spiritual_mist',
    name: 'كروما شاشة سوداء: ضباب الفجر الانسيابي (Mist #4)',
    blendMode: 'screen',
    opacity: 0.65,
    enabled: false,
    type: 'clouds',
    youtubeLink: USER_REQUESTED_YOUTUBE_PLAYLIST,
  },
  {
    id: 'chroma_retro_scratches',
    name: 'كروما شاشة سوداء: خدوش شريط سينمائي (Film Scratches #5)',
    blendMode: 'screen',
    opacity: 0.5,
    enabled: false,
    type: 'film_burn',
    youtubeLink: USER_REQUESTED_YOUTUBE_PLAYLIST,
  }
];

export const DEFAULT_PARTICLE_OVERLAYS: ParticleOverlayItem[] = [
  {
    id: 'golden_dust',
    name: 'الغبار الذهبي الطافي',
    nameEn: 'Floating Golden Dust',
    description: 'ذرات غبار نورانية ذهبية تسبح ببطء وانسيابية مع ارتعاش ضوئي لطيف يضفي وقاراً وسكينة',
    enabled: false,
    intensity: 65,
    particleCount: 45,
    speed: 'calm',
    blendMode: 'screen',
    colorPalette: 'gold',
    ffmpegFilterCode: `blend=all_mode='screen':all_opacity=0.75`,
  },
  {
    id: 'soft_lights_bokeh',
    name: 'أضواء البوكيه الهادئة',
    nameEn: 'Soft Ambient Bokeh Orbs',
    description: 'كرات ضوئية دائرية ناعمة وشبه شفافة تتلاشى وتتحرك بنعومة فائقة لمحاكاة عدسات السينما',
    enabled: false,
    intensity: 60,
    particleCount: 18,
    speed: 'slow',
    blendMode: 'screen',
    colorPalette: 'soft_white',
    ffmpegFilterCode: `blend=all_mode='screen':all_opacity=0.60`,
  },
  {
    id: 'dawn_god_rays',
    name: 'أشعة الضياء الفجرية',
    nameEn: 'Soft Spiritual Dawn Rays',
    description: 'حزم ضوئية ناعمة تنسدل من زاوية الكادر العلوية وتمنح المشهد هيبة نورانية هادئة',
    enabled: false,
    intensity: 55,
    particleCount: 8,
    speed: 'slow',
    blendMode: 'screen',
    colorPalette: 'gold',
    ffmpegFilterCode: `eq=gamma_r=1.2:gamma_g=1.05:gamma_b=0.9`,
  },
  {
    id: 'emerald_sparkles',
    name: 'بريق الزمرد الروحاني',
    nameEn: 'Emerald Spiritual Sparkles',
    description: 'ذرات خضراء زمردية متلألئة بأربع رؤوس تومض بلطف مع الآيات القرآنية والأذكار',
    enabled: false,
    intensity: 70,
    particleCount: 28,
    speed: 'calm',
    blendMode: 'lighter',
    colorPalette: 'emerald',
    ffmpegFilterCode: `blend=all_mode='lighter':all_opacity=0.70`,
  },
  {
    id: 'celestial_stardust',
    name: 'الوميض السماوي (ستاردست)',
    nameEn: 'Celestial Stardust',
    description: 'غبار نجوم متناهي الصغر ووميض هادئ يضيء المشهد بنفحات ليلة القدر وقيام الليل',
    enabled: false,
    intensity: 50,
    particleCount: 85,
    speed: 'slow',
    blendMode: 'screen',
    colorPalette: 'soft_white',
    ffmpegFilterCode: `noise=alls=15:allf=t+u,blend=all_mode='screen'`,
  },
  {
    id: 'candle_shimmer',
    name: 'وهج الشموع والسكينة',
    nameEn: 'Warm Candlelight Shimmer',
    description: 'تموجات نورانية كهرمانية دافئة من الأسفل تحاكي إضاءة الشموع للمخطوطات والدروس التراثية',
    enabled: false,
    intensity: 55,
    particleCount: 22,
    speed: 'calm',
    blendMode: 'screen',
    colorPalette: 'amber',
    ffmpegFilterCode: `curves=preset=lighter,eq=gamma_r=1.25:gamma_g=1.05`,
  },
];

export const DEFAULT_AUDIO_LIBRARY: AudioTrackConfig[] = [
  {
    id: 'track-recitation-1',
    title: 'تلاوة خاشعة - سورة الفاتحة',
    artist: 'الشيخ العيد',
    category: 'quran',
    duration: 35,
    type: 'synth',
    synthPreset: 'spiritual_drone'
  },
  {
    id: 'track-adhan',
    title: 'أذان الفجر الندي',
    artist: 'مقام البيات',
    category: 'adhan',
    duration: 48,
    type: 'synth',
    synthPreset: 'adhan_harmony'
  },
  {
    id: 'track-nasheed-1',
    title: 'أنشودة هادفة - يا خالق الأكوان',
    artist: 'كورال هادف (بدون إيقاع)',
    category: 'nasheed',
    duration: 60,
    type: 'synth',
    synthPreset: 'choral_peace'
  },
  {
    id: 'track-ambient-peace',
    title: 'سكينة الفجر وخرير الماء',
    artist: 'أصوات طبيعة هادئة',
    category: 'ambient',
    duration: 120,
    type: 'synth',
    synthPreset: 'dawn_nature'
  }
];

export const QURANIC_VERSE_PRESETS = [
  {
    surah: 'طه: 114',
    text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    category: 'العلم والتعلم'
  },
  {
    surah: 'الرعد: 28',
    text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    category: 'الطمأنينة'
  },
  {
    surah: 'الإنشراح: 6',
    text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    category: 'الأمل والفرج'
  },
  {
    surah: 'البقرة: 153',
    text: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    category: 'الصبر'
  },
  {
    surah: 'الفاتحة: 2',
    text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    category: 'الحمد والثناء'
  },
  {
    surah: 'الإسراء: 82',
    text: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ',
    category: 'الشفاء والرحمة'
  }
];

export const HADITH_PRESETS = [
  {
    source: 'صحيح البخاري',
    text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    category: 'القرآن الكريم'
  },
  {
    source: 'صحيح مسلم',
    text: 'الدِّينُ النَّصِيحَةُ',
    category: 'الأخلاق'
  },
  {
    source: 'متفق عليه',
    text: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ',
    category: 'البشاشة'
  },
  {
    source: 'الترمذي',
    text: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ',
    category: 'التقوى'
  }
];

export const DEFAULT_TEXT_OVERLAY: TextOverlay = {
  id: 'text-default-1',
  text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
  fontFamily: 'Amiri',
  fontSize: 26,
  color: '#FFFFFF',
  hasAyahBrackets: true,
  alignment: 'center',
  positionX: 50,
  positionY: 80,
  startTime: 0,
  endTime: 15,
  animation: 'fade'
};
