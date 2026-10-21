/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ASSET_MINARET_SUNSET, 
  ASSET_QURAN_LIGHT, 
  ASSET_ARABIC_ORNAMENT 
} from './defaults';
import { ASSET_ANTIQUE_PARCHMENT } from './calligraphyDefaults';
import assetMosqueArches from '../assets/images/islamic_mosque_arches_night_1792364229198.jpg';

export const ASSET_MOSQUE_ARCHES = assetMosqueArches;

// Authentic assets for «شرح كتاب إيصال السالك إلى أصول مذهب الإمام مالك»
export const ASSET_IYSAL_LIBRARY = '/assets/aistudio/29515ac3-1b7a-4437-8444-84464b32b5fe_33174229.jpeg';
export const ASSET_IYSAL_GESTURE = '/assets/aistudio/a6ca8d52-f34a-49a0-8d14-aeb7cff7c8be_ad426c88.jpeg';
export const ASSET_IYSAL_WHITE_MOSQUE = '/assets/aistudio/b3c8d24f-b9bc-4d98-8da2-45c85e6309b6_3721dd5e.jpeg';
export const ASSET_IYSAL_WARM_LIBRARY = '/assets/aistudio/c0a8ee14-ca19-4a82-bc79-b371317fa8e3_95471931.jpeg';
export const ASSET_IYSAL_WOODEN_MINBAR = '/assets/aistudio/d46fabff-e5ec-4774-8ca9-9c4184640f96_68769579.jpeg';
export const ASSET_IYSAL_MARBLE_ARCHES = '/assets/aistudio/70daa8fe-2795-43c9-ad4a-18fa25d056fa_e9917d5f.jpeg';

export interface ReadyBackgroundItem {
  id: string;
  name: string;
  category: 'mosque' | 'parchment' | 'quran' | 'ornament' | 'iysal_salik';
  categoryLabel: string;
  assetPath: string; // assets/backgrounds/...
  imageUrl: string;
  isVideoLoop: boolean;
  recommendedRatio: '9:16' | '16:9' | 'all';
  description: string;
}

export interface VideoSpiritualEffect {
  id: string;
  name: string;
  description: string;
  badge: string;
  iconName?: string;
}

export const VIDEO_SPIRITUAL_EFFECTS: VideoSpiritualEffect[] = [
  { id: 'spiritual_glow', name: 'هالة نورانية دافئة', description: 'توهج نوراني ذهبي خافت يضفي سكينة ووقاراً على المجلس', badge: 'نوراني', iconName: 'Sparkles' },
  { id: 'audio_spectrum', name: 'موجات الصوت التفاعلية (Waveform)', description: 'أشرطة صوتية بيانية نابضة تتفاعل حياً مع طبقات صوت الشيخ', badge: 'تفاعلي', iconName: 'Activity' },
  { id: 'subtle_zoom', name: 'تقريب سينمائي بطيء (Ken Burns)', description: 'حركة كاميرا هادئة جداً تحول الصورة لفيلم وثائقي متحرك', badge: 'ديناميكي', iconName: 'ZoomIn' },
  { id: 'gold_frame', name: 'الإطار الإسلامي المذهب', description: 'إطار هندسي أرابيسك مذهب يحيط بمشهد الدرس', badge: 'زخرفي', iconName: 'Square' },
  { id: 'vignette_focus', name: 'تظليل الحواف السينمائي', description: 'تعتيم سينمائي ناعم للأطراف لتركيز النظر على الشيخ والمصحف', badge: 'سينمائي', iconName: 'Eye' },
  { id: 'light_leak', name: 'أشعة النور العلوية', description: 'انعكاس خيوط ضوء هادئة من قوس المحراب الشريف', badge: 'إشراق', iconName: 'Sun' },
  { id: 'vintage_parchment', name: 'دفء كهرماني تراثي', description: 'درجات ذهبية دافئة تحاكي المخطوطات والكتب العتيقة', badge: 'تراثي', iconName: 'BookOpen' },
  { id: 'clean', name: 'طبيعي ونقي', description: 'إخراج بصري عالي الدقة بدون أي تعديل للألوان', badge: 'أصلي', iconName: 'Layers' },
];

export interface AudioSpiritualEffect {
  id: string;
  name: string;
  description: string;
  badge: string;
}

export const AUDIO_SPIRITUAL_EFFECTS: AudioSpiritualEffect[] = [
  { id: 'spiritual_drone', name: 'نغمة السكينة والوقار', description: 'تردد هارموني خافت يبعث على الهدوء والتركيز في مجلس العلم', badge: 'سكينة' },
  { id: 'gentle_reverb', name: 'صدى وترتيل المسجد الخافت', description: 'محاكاة صوتية للأروقة الواسعة تضفي هيبة على إلقاء الشيخ', badge: 'صدى' },
  { id: 'voice_clarity', name: 'نقاء وتضخيم صوت الشيخ', description: 'تعزيز وضوح مخارج الحروف وترددات الصوت البشري الدافئة', badge: 'نقاء' },
  { id: 'water_courtyard', name: 'خرير مياه باحة الحرم', description: 'أجواء مائية هادئة مستوحاة من نافورة باحة المساجد العتيقة', badge: 'طبيعة' },
  { id: 'none', name: 'صوت الشيخ النقي فقط', description: 'بدون أي مؤثرات صوتية خلفية (تسجيل مباشر نقي)', badge: 'مباشر' },
];

export const READY_BACKGROUNDS: ReadyBackgroundItem[] = [
  // سلسلة شرح كتاب إيصال السالك إلى أصول مذهب الإمام مالك
  {
    id: 'bg_iysal_library',
    name: 'المكتبة التراثية والمصحف الشريف - إيصال السالك',
    category: 'iysal_salik',
    categoryLabel: 'شرح إيصال السالك',
    assetPath: 'assets/aistudio/29515ac3-1b7a-4437-8444-84464b32b5fe_33174229.jpeg',
    imageUrl: ASSET_IYSAL_LIBRARY,
    isVideoLoop: false,
    recommendedRatio: '16:9',
    description: 'مجلس العلم في المكتبة التراثية مع قوس ذهبي وكتاب إيصال السالك المفتوح على الحامل',
  },
  {
    id: 'bg_iysal_gesture',
    name: 'الشيخ أثناء إلقاء الدرس والشرح - إيصال السالك',
    category: 'iysal_salik',
    categoryLabel: 'شرح إيصال السالك',
    assetPath: 'assets/aistudio/a6ca8d52-f34a-49a0-8d14-aeb7cff7c8be_ad426c88.jpeg',
    imageUrl: ASSET_IYSAL_GESTURE,
    isVideoLoop: false,
    recommendedRatio: '16:9',
    description: 'الشيخ العيد يشرح أصول المذهب المالكي مع إشارة اليد في مجلس العلم المهيب',
  },
  {
    id: 'bg_iysal_white_mosque',
    name: 'محراب المسجد الأبيض والزخرفة المذهبة - إيصال السالك',
    category: 'iysal_salik',
    categoryLabel: 'شرح إيصال السالك',
    assetPath: 'assets/aistudio/b3c8d24f-b9bc-4d98-8da2-45c85e6309b6_3721dd5e.jpeg',
    imageUrl: ASSET_IYSAL_WHITE_MOSQUE,
    isVideoLoop: false,
    recommendedRatio: '16:9',
    description: 'محراب مضاء بنور ساطع مع خط الثلث الجلي لشرح كتاب إيصال السالك إلى أصول مذهب الإمام مالك',
  },
  {
    id: 'bg_iysal_warm_library',
    name: 'القوس التراثي والكتاب المفتوح - إيصال السالك',
    category: 'iysal_salik',
    categoryLabel: 'شرح إيصال السالك',
    assetPath: 'assets/aistudio/c0a8ee14-ca19-4a82-bc79-b371317fa8e3_95471931.jpeg',
    imageUrl: ASSET_IYSAL_WARM_LIBRARY,
    isVideoLoop: false,
    recommendedRatio: '16:9',
    description: 'أجواء مكتبة المخطوطات الدافئة مع القوس الإسلامي المنقوش والإضاءة السينمائية',
  },
  {
    id: 'bg_iysal_wooden_minbar',
    name: 'المنبر الخشبي المهيب ومجلس الإسناد - إيصال السالك',
    category: 'iysal_salik',
    categoryLabel: 'شرح إيصال السالك',
    assetPath: 'assets/aistudio/d46fabff-e5ec-4774-8ca9-9c4184640f96_68769579.jpeg',
    imageUrl: ASSET_IYSAL_WOODEN_MINBAR,
    isVideoLoop: false,
    recommendedRatio: '16:9',
    description: 'خلفية المنبر الخشبي التاريخي المنقوش مع كتابة مذهبة عنوان سلسلة شرح إيصال السالك',
  },
  {
    id: 'bg_iysal_marble_arches',
    name: 'الأروقة الأندلسية والزخارف المورقة - إيصال السالك',
    category: 'iysal_salik',
    categoryLabel: 'شرح إيصال السالك',
    assetPath: 'assets/aistudio/70daa8fe-2795-43c9-ad4a-18fa25d056fa_e9917d5f.jpeg',
    imageUrl: ASSET_IYSAL_MARBLE_ARCHES,
    isVideoLoop: false,
    recommendedRatio: '16:9',
    description: 'أعمدة رخامية مذهبة بطراز أندلسي فاخر لشروحات الأصول الفقهية والقواعد المالكية',
  },
  // الخلفيات العامة التراثية
  {
    id: 'bg_mosque_arches',
    name: 'أروقة المسجد التراثي والفوانيس الدافئة',
    category: 'mosque',
    categoryLabel: 'مساجد وأروقة',
    assetPath: 'assets/backgrounds/mosque_arches_night.jpg',
    imageUrl: ASSET_MOSQUE_ARCHES,
    isVideoLoop: false,
    recommendedRatio: '9:16',
    description: 'أعمدة رخامية عتيقة مع فوانيس نحاسية دافئة تناسب الدروس والمواعظ المؤثرة',
  },
  {
    id: 'bg_antique_parchment',
    name: 'المخطوطة العتيقة والشمعة وقلم الريشة',
    category: 'parchment',
    categoryLabel: 'مخطوطات وريشة',
    assetPath: 'assets/backgrounds/antique_parchment_candle.jpg',
    imageUrl: ASSET_ANTIQUE_PARCHMENT,
    isVideoLoop: false,
    recommendedRatio: '9:16',
    description: 'ورقة مخطوطة تراثية مع ضوء شمعة خافت مخصصة لكتابة خط الرقعة التلقائي',
  },
  {
    id: 'bg_minaret_sunset',
    name: 'مئذنة المسجد عند الغروب الذهبي',
    category: 'mosque',
    categoryLabel: 'مساجد وأروقة',
    assetPath: 'assets/backgrounds/minaret_sunset.jpg',
    imageUrl: ASSET_MINARET_SUNSET,
    isVideoLoop: false,
    recommendedRatio: 'all',
    description: 'قبة ومئذنة شامخة مع أشعة نورانية هادئة لمقاطع الريلز والمواعظ',
  },
  {
    id: 'bg_quran_light',
    name: 'المصحف الشريف على الحامل الخشبي العتيق',
    category: 'quran',
    categoryLabel: 'المصاحف الشريفة',
    assetPath: 'assets/backgrounds/quran_rehal_light.jpg',
    imageUrl: ASSET_QURAN_LIGHT,
    isVideoLoop: false,
    recommendedRatio: '16:9',
    description: 'مصحف شريف مفتوح في باحة المسجد مناسب للمحاضرات الكاملة وتفسير الآيات',
  },
  {
    id: 'bg_arabic_ornament',
    name: 'الزخرفة الإسلامية والأرابيسك الذهبي',
    category: 'ornament',
    categoryLabel: 'زخارف إسلامية',
    assetPath: 'assets/backgrounds/gold_arabesque_ornament.jpg',
    imageUrl: ASSET_ARABIC_ORNAMENT,
    isVideoLoop: false,
    recommendedRatio: 'all',
    description: 'نقوش أرابيسك هندسية مذهبة تناسب البطاقات الدعوية والمقاطع المربعة',
  },
];

export interface SheikhLessonItem {
  id: string;
  seriesId?: 'iysal_salik' | 'general';
  seriesTitle?: string;
  title: string;
  sheikh: string;
  durationSec: number;
  text: string;
  defaultBgId?: string;
  defaultAudioEffect?: string;
  defaultVisualEffect?: string;
  effectLabel?: string;
  words: {
    id: string;
    word: string;
    startMs: number;
    endMs: number;
  }[];
}

// قائمة دروس شرح كتاب إيصال السالك إلى أصول مذهب الإمام مالك
export const IYSAL_SALIK_LESSONS: SheikhLessonItem[] = [
  {
    id: 'iysal_lesson_1',
    seriesId: 'iysal_salik',
    seriesTitle: 'شرح كتاب إيصال السالك',
    title: 'الدرس 1: المقدمة والتعريف بكتاب إيصال السالك وأصول مذهب مالك',
    sheikh: 'الشيخ العيد - شرح إيصال السالك',
    durationSec: 18,
    defaultBgId: 'bg_iysal_library',
    defaultAudioEffect: 'spiritual_drone',
    defaultVisualEffect: 'spiritual_glow',
    effectLabel: 'هالة نورانية + نغمة سكينة',
    text: 'الْحَمْدُ لِلَّهِ الَّذِي فَضَّلَ مَذْهَبَ إِمَامِ دَارِ الْهِجْرَةِ وَبَيَّنَ مَعَالِمَهُ بِأَصَحِّ الْأَدِلَّةِ وَأَوْضَحِ السُّبُلِ',
    words: [
      { id: 'is1', word: 'الْحَمْدُ', startMs: 300, endMs: 1400 },
      { id: 'is2', word: 'لِلَّهِ', startMs: 1500, endMs: 2600 },
      { id: 'is3', word: 'الَّذِي', startMs: 2700, endMs: 3800 },
      { id: 'is4', word: 'فَضَّلَ', startMs: 3900, endMs: 5200 },
      { id: 'is5', word: 'مَذْهَبَ', startMs: 5300, endMs: 6600 },
      { id: 'is6', word: 'إِمَامِ', startMs: 6700, endMs: 8000 },
      { id: 'is7', word: 'دَارِ', startMs: 8100, endMs: 9300 },
      { id: 'is8', word: 'الْهِجْرَةِ', startMs: 9400, endMs: 11100 },
      { id: 'is9', word: 'وَبَيَّنَ', startMs: 11200, endMs: 12500 },
      { id: 'is10', word: 'مَعَالِمَهُ', startMs: 12600, endMs: 14300 },
      { id: 'is11', word: 'بِأَصَحِّ', startMs: 14400, endMs: 15900 },
      { id: 'is12', word: 'الْأَدِلَّةِ', startMs: 16000, endMs: 17700 },
    ],
  },
  {
    id: 'iysal_lesson_2',
    seriesId: 'iysal_salik',
    seriesTitle: 'شرح كتاب إيصال السالك',
    title: 'الدرس 2: الأصل الأول - نصوص كتاب الله العزيز وظاهره ومفهومه',
    sheikh: 'الشيخ العيد - شرح إيصال السالك',
    durationSec: 16,
    defaultBgId: 'bg_iysal_gesture',
    defaultAudioEffect: 'gentle_reverb',
    defaultVisualEffect: 'audio_spectrum',
    effectLabel: 'موجات صوتية + صدى المسجد',
    text: 'وَالْأَصْلُ الْأَوَّلُ كِتَابُ اللَّهِ الْعَزِيزِ وَظَاهِرُهُ وَمَفْهُومُهُ وَفَحْوَاهُ وَتَنْبِيهُهُ',
    words: [
      { id: 'is13', word: 'وَالْأَصْلُ', startMs: 300, endMs: 1600 },
      { id: 'is14', word: 'الْأَوَّلُ', startMs: 1700, endMs: 3100 },
      { id: 'is15', word: 'كِتَابُ', startMs: 3200, endMs: 4600 },
      { id: 'is16', word: 'اللَّهِ', startMs: 4700, endMs: 6000 },
      { id: 'is17', word: 'الْعَزِيزِ', startMs: 6100, endMs: 7800 },
      { id: 'is18', word: 'وَظَاهِرُهُ', startMs: 7900, endMs: 9700 },
      { id: 'is19', word: 'وَمَفْهُومُهُ', startMs: 9800, endMs: 11800 },
      { id: 'is20', word: 'وَفَحْوَاهُ', startMs: 11900, endMs: 13700 },
      { id: 'is21', word: 'وَتَنْبِيهُهُ', startMs: 13800, endMs: 15800 },
    ],
  },
  {
    id: 'iysal_lesson_3',
    seriesId: 'iysal_salik',
    seriesTitle: 'شرح كتاب إيصال السالك',
    title: 'الدرس 3: الأصل الثاني - سنة النبي المصطفى ﷺ المتواترة والآحاد',
    sheikh: 'الشيخ العيد - شرح إيصال السالك',
    durationSec: 17,
    defaultBgId: 'bg_iysal_white_mosque',
    defaultAudioEffect: 'voice_clarity',
    defaultVisualEffect: 'gold_frame',
    effectLabel: 'إطار مذهب + نقاء الصوت',
    text: 'وَسُنَّةُ رَسُولِ اللَّهِ ﷺ الْمُتَوَاتِرُ مِنْهَا وَالْآحَادُ وَتَقْدِيمُ الْمُتَوَاتِرِ عِنْدَ التَّعَارُضِ',
    words: [
      { id: 'is22', word: 'وَسُنَّةُ', startMs: 300, endMs: 1600 },
      { id: 'is23', word: 'رَسُولِ', startMs: 1700, endMs: 3000 },
      { id: 'is24', word: 'اللَّهِ', startMs: 3100, endMs: 4300 },
      { id: 'is25', word: 'ﷺ', startMs: 4400, endMs: 5800 },
      { id: 'is26', word: 'الْمُتَوَاتِرُ', startMs: 5900, endMs: 7700 },
      { id: 'is27', word: 'مِنْهَا', startMs: 7800, endMs: 9200 },
      { id: 'is28', word: 'وَالْآحَادُ', startMs: 9300, endMs: 11200 },
      { id: 'is29', word: 'وَتَقْدِيمُ', startMs: 11300, endMs: 13100 },
      { id: 'is30', word: 'الْمُتَوَاتِرِ', startMs: 13200, endMs: 15100 },
      { id: 'is31', word: 'عِنْدَ التَّعَارُضِ', startMs: 15200, endMs: 16800 },
    ],
  },
  {
    id: 'iysal_lesson_4',
    seriesId: 'iysal_salik',
    seriesTitle: 'شرح كتاب إيصال السالك',
    title: 'الدرس 4: الأصل الثالث - عمل أهل المدينة والإجماع عند المالكية',
    sheikh: 'الشيخ العيد - شرح إيصال السالك',
    durationSec: 18,
    defaultBgId: 'bg_iysal_wooden_minbar',
    defaultAudioEffect: 'spiritual_drone',
    defaultVisualEffect: 'subtle_zoom',
    effectLabel: 'زوم سينمائي + سكينة وقار',
    text: 'وَعَمَلُ أَهْلِ الْمَدِينَةِ حُجَّةٌ قَاطِعَةٌ عِنْدَ الْإِمَامِ مَالِكٍ رَحِمَهُ اللَّهُ تَعَالَى',
    words: [
      { id: 'is32', word: 'وَعَمَلُ', startMs: 300, endMs: 1600 },
      { id: 'is33', word: 'أَهْلِ', startMs: 1700, endMs: 3000 },
      { id: 'is34', word: 'الْمَدِينَةِ', startMs: 3100, endMs: 4800 },
      { id: 'is35', word: 'حُجَّةٌ', startMs: 4900, endMs: 6500 },
      { id: 'is36', word: 'قَاطِعَةٌ', startMs: 6600, endMs: 8400 },
      { id: 'is37', word: 'عِنْدَ', startMs: 8500, endMs: 9900 },
      { id: 'is38', word: 'الْإِمَامِ', startMs: 10000, endMs: 11700 },
      { id: 'is39', word: 'مَالِكٍ', startMs: 11800, endMs: 13500 },
      { id: 'is40', word: 'رَحِمَهُ', startMs: 13600, endMs: 15300 },
      { id: 'is41', word: 'اللَّهُ تَعَالَى', startMs: 15400, endMs: 17800 },
    ],
  },
  {
    id: 'iysal_lesson_5',
    seriesId: 'iysal_salik',
    seriesTitle: 'شرح كتاب إيصال السالك',
    title: 'الدرس 5: الأصل الرابع - المصالح المرسلة وسد الذرائع والاستحسان',
    sheikh: 'الشيخ العيد - شرح إيصال السالك',
    durationSec: 19,
    defaultBgId: 'bg_iysal_marble_arches',
    defaultAudioEffect: 'water_courtyard',
    defaultVisualEffect: 'light_leak',
    effectLabel: 'أشعة نور + خرير باحة الحرم',
    text: 'وَالْمَصَالِحُ الْمُرْسَلَةُ وَسَدُّ الذَّرَائِعِ مِنْ أَبْرَزِ قَوَاعِدِ مَذْهَبِ الْمَالِكِيَّةِ فِي رِعَايَةِ الْمَقَاصِدِ',
    words: [
      { id: 'is42', word: 'وَالْمَصَالِحُ', startMs: 300, endMs: 1800 },
      { id: 'is43', word: 'الْمُرْسَلَةُ', startMs: 1900, endMs: 3600 },
      { id: 'is44', word: 'وَسَدُّ', startMs: 3700, endMs: 5100 },
      { id: 'is45', word: 'الذَّرَائِعِ', startMs: 5200, endMs: 7000 },
      { id: 'is46', word: 'مِنْ', startMs: 7100, endMs: 8300 },
      { id: 'is47', word: 'أَبْرَزِ', startMs: 8400, endMs: 9900 },
      { id: 'is48', word: 'قَوَاعِدِ', startMs: 10000, endMs: 11700 },
      { id: 'is49', word: 'مَذْهَبِ', startMs: 11800, endMs: 13400 },
      { id: 'is50', word: 'الْمَالِكِيَّةِ', startMs: 13500, endMs: 15500 },
      { id: 'is51', word: 'فِي رِعَايَةِ الْمَقَاصِدِ', startMs: 15600, endMs: 18800 },
    ],
  },
  {
    id: 'iysal_lesson_6',
    seriesId: 'iysal_salik',
    seriesTitle: 'شرح كتاب إيصال السالك',
    title: 'الدرس 6: الأصل الخامس - العرف والعادة وقاعدة درء المفاسد',
    sheikh: 'الشيخ العيد - شرح إيصال السالك',
    durationSec: 18,
    defaultBgId: 'bg_iysal_warm_library',
    defaultAudioEffect: 'gentle_reverb',
    defaultVisualEffect: 'vignette_focus',
    effectLabel: 'تظليل سينمائي + صدى المسجد',
    text: 'وَالْعَادَةُ مُحَكَّمَةٌ إِذَا اطَّرَدَتْ وَدَرْءُ الْمَفَاسِدِ أَوْلَى مِنْ جَلْبِ الْمَصَالِحِ فِي أُصُولِ الشَّرِيعَةِ',
    words: [
      { id: 'is52', word: 'وَالْعَادَةُ', startMs: 300, endMs: 1700 },
      { id: 'is53', word: 'مُحَكَّمَةٌ', startMs: 1800, endMs: 3400 },
      { id: 'is54', word: 'إِذَا', startMs: 3500, endMs: 4700 },
      { id: 'is55', word: 'اطَّرَدَتْ', startMs: 4800, endMs: 6500 },
      { id: 'is56', word: 'وَدَرْءُ', startMs: 6600, endMs: 8000 },
      { id: 'is57', word: 'الْمَفَاسِدِ', startMs: 8100, endMs: 9900 },
      { id: 'is58', word: 'أَوْلَى', startMs: 10000, endMs: 11500 },
      { id: 'is59', word: 'مِنْ جَلْبِ', startMs: 11600, endMs: 13200 },
      { id: 'is60', word: 'الْمَصَالِحِ', startMs: 13300, endMs: 15200 },
      { id: 'is61', word: 'فِي أُصُولِ الشَّرِيعَةِ', startMs: 15300, endMs: 17800 },
    ],
  },
];

export const GENERAL_SHEIKH_LESSONS: SheikhLessonItem[] = [
  {
    id: 'lesson_1',
    seriesId: 'general',
    seriesTitle: 'مواعظ عامة',
    title: 'درس: فضائل قيام الليل وثمرات الخلوة بالله',
    sheikh: 'الشيخ العيد',
    durationSec: 16,
    defaultBgId: 'bg_mosque_arches',
    text: 'قِيَامُ اللَّيْلِ مِشْكَاةُ النُّورِ وَسَبِيلُ الْمُتَّقِينَ فِيهِ تَسْكُنُ الْأَرْوَاحُ وَتَطْمَئِنُّ الْقُلُوبُ بِذِكْرِ اللَّهِ',
    words: [
      { id: 'l1', word: 'قِيَامُ', startMs: 300, endMs: 1400 },
      { id: 'l2', word: 'اللَّيْلِ', startMs: 1500, endMs: 2900 },
      { id: 'l3', word: 'مِشْكَاةُ', startMs: 3000, endMs: 4400 },
      { id: 'l4', word: 'النُّورِ', startMs: 4500, endMs: 6000 },
      { id: 'l5', word: 'وَسَبِيلُ', startMs: 6100, endMs: 7600 },
      { id: 'l6', word: 'الْمُتَّقِينَ', startMs: 7700, endMs: 9600 },
      { id: 'l7', word: 'فِيهِ', startMs: 9700, endMs: 10800 },
      { id: 'l8', word: 'تَسْكُنُ', startMs: 10900, endMs: 12200 },
      { id: 'l9', word: 'الْأَرْوَاحُ', startMs: 12300, endMs: 14500 },
    ],
  },
  {
    id: 'lesson_2',
    seriesId: 'general',
    seriesTitle: 'تلاوات خاشعة',
    title: 'تلاوة خاشعة: وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا',
    sheikh: 'الشيخ العيد - سورة الطور',
    durationSec: 14,
    defaultBgId: 'bg_quran_light',
    text: 'وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا وَسَبِّحْ بِحَمْدِ رَبِّكَ حِينَ تَقُومُ',
    words: [
      { id: 'l10', word: 'وَاصْبِرْ', startMs: 400, endMs: 1900 },
      { id: 'l11', word: 'لِحُكْمِ', startMs: 2000, endMs: 3500 },
      { id: 'l12', word: 'رَبِّكَ', startMs: 3600, endMs: 5100 },
      { id: 'l13', word: 'فَإِنَّكَ', startMs: 5200, endMs: 6900 },
      { id: 'l14', word: 'بِأَعْيُنِنَا', startMs: 7000, endMs: 9300 },
      { id: 'l15', word: 'وَسَبِّحْ', startMs: 9400, endMs: 11000 },
      { id: 'l16', word: 'بِحَمْدِ', startMs: 11100, endMs: 12500 },
      { id: 'l17', word: 'رَبِّكَ', startMs: 12600, endMs: 13900 },
    ],
  },
  {
    id: 'lesson_3',
    seriesId: 'general',
    seriesTitle: 'مواعظ الجمعة',
    title: 'موعظة الجمعة: الدُّنْيَا ظِلٌّ زَائِلٌ وَالْآخِرَةُ هِيَ دَارُ الْقَرَارِ',
    sheikh: 'الشيخ العيد',
    durationSec: 12,
    defaultBgId: 'bg_minaret_sunset',
    text: 'الدُّنْيَا ظِلٌّ زَائِلٌ وَالْآخِرَةُ خَيْرٌ وَأَبْقَى فَاغْنَمْ أَيَّامَكَ فِي طَاعَةِ الرَّحْمَٰنِ',
    words: [
      { id: 'l20', word: 'الدُّنْيَا', startMs: 400, endMs: 1800 },
      { id: 'l21', word: 'ظِلٌّ', startMs: 1900, endMs: 3100 },
      { id: 'l22', word: 'زَائِلٌ', startMs: 3200, endMs: 4800 },
      { id: 'l23', word: 'وَالْآخِرَةُ', startMs: 4900, endMs: 6600 },
      { id: 'l24', word: 'خَيْرٌ', startMs: 6700, endMs: 8100 },
      { id: 'l25', word: 'وَأَبْقَى', startMs: 8200, endMs: 10400 },
    ],
  },
];

// All lessons combined with Iysal Salik leading first
export const SAMPLE_SHEIKH_LESSONS: SheikhLessonItem[] = [
  ...IYSAL_SALIK_LESSONS,
  ...GENERAL_SHEIKH_LESSONS,
];
