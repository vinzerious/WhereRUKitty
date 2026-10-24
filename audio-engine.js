/**
 * WhereRUKitty — Feline Bioacoustic & Physical-Modeling Sound Engine
 * Uses Web Audio API formant synthesis, modal resonance, and stochastic impulse modeling
 * to generate 12 distinct feline vocalizations and domestic lure acoustics offline.
 */

export const SOUND_CATALOG = [
  {
    id: 'mother-trill',
    category: 'vocal',
    categoryLabel: 'เรียกให้แมวร้องตอบ',
    title: 'แม่แมวเรียกหาลูก',
    subtitle: 'Mother Cat Chirrup (Prrt-ek)',
    freqBand: '280 – 1,950 Hz',
    durationSec: 2.6,
    purpose: 'กระตุ้นสัญชาตญาณขานรับกลับ (ได้ผลสูงสุดเวลาแมวแอบ)',
    bestFor: ['vocal', 'timid', 'curious']
  },
  {
    id: 'kitten-mew',
    category: 'vocal',
    categoryLabel: 'เรียกให้แมวร้องตอบ',
    title: 'ลูกแมวร้องเรียกหา',
    subtitle: 'Lost Kitten High Mew',
    freqBand: '780 – 3,100 Hz',
    durationSec: 2.4,
    purpose: 'ทำให้แมวโตเดินออกมาดูต้นเสียง หรือร้องเหมียวถามกลับ',
    bestFor: ['vocal', 'curious']
  },
  {
    id: 'greeting-meow',
    category: 'vocal',
    categoryLabel: 'เรียกให้แมวร้องตอบ',
    title: 'เหมียวทักทายอ้อนๆ',
    subtitle: 'Friendly Greeting Meow',
    freqBand: '360 – 1,650 Hz',
    durationSec: 2.2,
    purpose: 'เสียงทักทายโทนเป็นมิตร ลดความระแวงเวลาแมวซ่อนใต้เตียง',
    bestFor: ['vocal', 'timid']
  },
  {
    id: 'purr-chirp',
    category: 'vocal',
    categoryLabel: 'เรียกให้แมวร้องตอบ',
    title: 'กรนครืดๆ สลับเรียกเบาๆ',
    subtitle: 'Comfort Purr & Soft Trill',
    freqBand: '26 – 640 Hz',
    durationSec: 3.0,
    purpose: 'คลื่นความถี่ต่ำช่วยให้แมวขี้กลัวรู้สึกปลอดภัยและคลานออกมา',
    bestFor: ['timid', 'vocal']
  },
  {
    id: 'wet-can',
    category: 'food',
    categoryLabel: 'ล่อด้วยเสียงของกิน',
    title: 'เปิดกระป๋องอาหารเปียก',
    subtitle: 'Wet Food Can Pull-Tab & Pop',
    freqBand: '900 – 5,800 Hz',
    durationSec: 2.5,
    purpose: 'จำลองเสียงงัดห่วงโลหะ + ฝาป๊อป + เคาะขอบกระป๋อง',
    bestFor: ['food', 'curious']
  },
  {
    id: 'treat-shake',
    category: 'food',
    categoryLabel: 'ล่อด้วยเสียงของกิน',
    title: 'เขย่าถุงขนม/อาหารเม็ด',
    subtitle: 'Treat Bag & Kibble Shake',
    freqBand: '650 – 6,400 Hz',
    durationSec: 2.4,
    purpose: 'เสียงเม็ดขนมกระทบซองฟอยล์เป็นจังหวะ เรียกแมวสายกิน',
    bestFor: ['food']
  },
  {
    id: 'bowl-clink',
    category: 'food',
    categoryLabel: 'ล่อด้วยเสียงของกิน',
    title: 'เคาะชามเซรามิกเรียกกินข้าว',
    subtitle: 'Ceramic Bowl & Spoon Clink',
    freqBand: '1,180 – 4,620 Hz',
    durationSec: 2.3,
    purpose: 'เสียงช้อนเคาะขอบชามกระเบื้องกังวาน ทะลุผ่านประตูห้องได้ดี',
    bestFor: ['food']
  },
  {
    id: 'foil-crinkle',
    category: 'food',
    categoryLabel: 'ล่อด้วยเสียงของกิน',
    title: 'ขยำซองขนมแมวเลีย',
    subtitle: 'Sachet & Foil Crinkle',
    freqBand: '2,800 – 7,800 Hz',
    durationSec: 2.2,
    purpose: 'เสียงกรอบแกรบความถี่สูงที่หูแมวจับทิศทางได้แม่นยำมาก',
    bestFor: ['food', 'hunter']
  },
  {
    id: 'bird-chirp',
    category: 'prey',
    categoryLabel: 'กระตุ้นสัญชาตญาณนักล่า',
    title: 'นกกระจอกร้องริมหน้าต่าง',
    subtitle: 'Window Sparrow Chirp',
    freqBand: '2,600 – 4,400 Hz',
    durationSec: 2.5,
    purpose: 'กระตุ้นให้แมวทำเสียงแคร็กๆ (Ek-ek-ek) หรือโผล่หัวออกมาส่อง',
    bestFor: ['hunter', 'curious']
  },
  {
    id: 'mouse-squeak',
    category: 'prey',
    categoryLabel: 'กระตุ้นสัญชาตญาณนักล่า',
    title: 'หนูจี๊ดๆ วิ่งตามซอก',
    subtitle: 'Rodent Squeak & Scurry',
    freqBand: '3,800 – 5,600 Hz',
    durationSec: 2.3,
    purpose: 'ดึงความสนใจแมวที่แอบหลับในตู้หรือใต้โซฟาให้หูตั้งทันที',
    bestFor: ['hunter']
  },
  {
    id: 'pss-click',
    category: 'sonic',
    categoryLabel: 'ความถี่พิเศษ & เสียงคุณ',
    title: 'เสียงจุ๊ปาก & ชู่วๆ เรียกแมว',
    subtitle: 'Pss-Pss-Pss & Tongue Clicks',
    freqBand: '1,400 – 7,500 Hz',
    durationSec: 2.4,
    purpose: 'เสียงเรียกคุ้นเคยของทาสแมว ผสมจังหวะเดาะลิ้นความถี่ชัด',
    bestFor: ['curious', 'vocal', 'timid']
  },
  {
    id: 'ear-perk-sweep',
    category: 'sonic',
    categoryLabel: 'ความถี่พิเศษ & เสียงคุณ',
    title: 'คลื่นความถี่กระตุ้นหูแมว',
    subtitle: 'Feline Ear-Perk Chime (3–6 kHz)',
    freqBand: '3,000 – 6,200 Hz',
    durationSec: 2.6,
    purpose: 'ฮาร์มอนิกย่านที่ใบหูแมวไวที่สุด ช่วยให้แมวหันหูและโผล่หน้าออกมา',
    bestFor: ['curious', 'hunter']
  }
];

export const SCENARIO_PRESETS = [
  {
    id: 'vocal-reply',
    title: 'ให้แมวร้องเหมียวตอบรับ',
    subtitle: 'เน้นเสียงแม่แมว + ลูกแมว + เว้นช่วงเงียบ 4 วินาทีเพื่อฟังเสียงขานรับ',
    sequence: ['mother-trill', 'kitten-mew', 'greeting-meow'],
    callSeconds: 3,
    listenSeconds: 4,
    gentleMode: false,
    pitch: 1.0
  },
  {
    id: 'food-lure',
    title: 'ล่อแมวหิวออกจากที่ซ่อน',
    subtitle: 'คอมโบเปิดกระป๋องอาหารเปียก + เขย่าถุงขนม + เคาะชามข้าว',
    sequence: ['wet-can', 'treat-shake', 'bowl-clink'],
    callSeconds: 3,
    listenSeconds: 3,
    gentleMode: false,
    pitch: 1.0
  },
  {
    id: 'timid-safe',
    title: 'แมวขี้กลัว / เพิ่งย้ายบ้าน',
    subtitle: 'โทนเสียงนุ่ม ลดความถี่แหลม ใช้เสียงกรนสลับเสียงแม่แมวเรียกเบาๆ',
    sequence: ['purr-chirp', 'mother-trill', 'greeting-meow'],
    callSeconds: 3,
    listenSeconds: 5,
    gentleMode: true,
    pitch: 0.94
  },
  {
    id: 'hunter-peek',
    title: 'ล่อนักล่าจอมซนให้โผล่หัว',
    subtitle: 'เสียงนกกระจอก + ขยำซองฟอยล์ + คลื่นความถี่กระตุ้นใบหู',
    sequence: ['bird-chirp', 'foil-crinkle', 'ear-perk-sweep'],
    callSeconds: 3,
    listenSeconds: 4,
    gentleMode: false,
    pitch: 1.05
  }
];

export const DOG_SOUND_CATALOG = [
  {
    id: 'dog-puppy-whine',
    category: 'vocal',
    categoryLabel: 'เรียกให้เห่า/ขานรับ',
    title: 'ลูกหมาอ้อนเรียกหา',
    subtitle: 'Playful Puppy Whine & Yip',
    freqBand: '420 – 2,400 Hz',
    durationSec: 2.5,
    purpose: 'กระตุ้นสัญชาตญาณความเป็นห่วงและอยากรู้อยากเห็นของสุนัขให้เดินออกมาดูต้นเสียง',
    bestFor: ['vocal', 'curious']
  },
  {
    id: 'dog-friendly-woof',
    category: 'vocal',
    categoryLabel: 'เรียกให้เห่า/ขานรับ',
    title: 'โฮ่งทักทายชวนเล่น',
    subtitle: 'Friendly Play-Bow Double Bark',
    freqBand: '180 – 1,450 Hz',
    durationSec: 2.2,
    purpose: 'เสียงเห่าสั้น 2 จังหวะโทนเป็นมิตร กระตุ้นให้สุนัขเห่าตอบหรือวิ่งมาดูหน้าห้อง',
    bestFor: ['vocal', 'curious']
  },
  {
    id: 'dog-howl-call',
    category: 'vocal',
    categoryLabel: 'เรียกให้เห่า/ขานรับ',
    title: 'หอนเรียกฝูงสั้นๆ',
    subtitle: 'Pack Harmonic Howl Call',
    freqBand: '260 – 1,180 Hz',
    durationSec: 2.8,
    purpose: 'คลื่นเสียงหอนไล่ระดับฮาร์มอนิก กระตุ้นให้สุนัขขานรับด้วยการหอนหรือเห่าบอกพิกัด',
    bestFor: ['vocal']
  },
  {
    id: 'dog-heartbeat-calm',
    category: 'vocal',
    categoryLabel: 'เรียกให้เห่า/ขานรับ',
    title: 'หัวใจเต้น & ลมหายใจปลอบใจ',
    subtitle: 'Calming Heartbeat & Soft Pant',
    freqBand: '35 – 520 Hz',
    durationSec: 2.8,
    purpose: 'คลื่นความถี่ต่ำช่วยลดความตื่นกลัวเวลาสุนัขซ่อนจากเสียงฟ้าร้องหรือประทัด',
    bestFor: ['timid', 'vocal']
  },
  {
    id: 'treat-shake',
    category: 'food',
    categoryLabel: 'ล่อด้วยเสียงของกิน',
    title: 'เขย่ากระปุกขนม/อาหารเม็ด',
    subtitle: 'Dog Treat Jar & Kibble Shake',
    freqBand: '650 – 6,400 Hz',
    durationSec: 2.4,
    purpose: 'เสียงเขย่าถุงขนมและอาหารเม็ดที่สุนัขได้ยินเมื่อไหร่จะวิ่งหูตั้งมาหาทันที',
    bestFor: ['food']
  },
  {
    id: 'bowl-clink',
    category: 'food',
    categoryLabel: 'ล่อด้วยเสียงของกิน',
    title: 'เคาะชามข้าวเรียกมื้ออาหาร',
    subtitle: 'Stainless/Ceramic Dog Bowl Clink',
    freqBand: '1,180 – 4,620 Hz',
    durationSec: 2.3,
    purpose: 'เสียงช้อนเคาะชามข้าวสัญญาณเวลาอาหาร ทะลุผ่านประตูห้องและชั้นบ้านได้ดี',
    bestFor: ['food']
  },
  {
    id: 'wet-can',
    category: 'food',
    categoryLabel: 'ล่อด้วยเสียงของกิน',
    title: 'เปิดกระป๋องอาหารเปียก',
    subtitle: 'Wet Dog Food Can Pull-Tab',
    freqBand: '900 – 5,800 Hz',
    durationSec: 2.5,
    purpose: 'เสียงงัดห่วงโลหะเปิดกระป๋องอาหารเปียก ดึงดูดสุนัขที่แอบหลับในมุมอับ',
    bestFor: ['food', 'curious']
  },
  {
    id: 'foil-crinkle',
    category: 'food',
    categoryLabel: 'ล่อด้วยเสียงของกิน',
    title: 'แกะซองขนมขัดฟัน/สแน็ค',
    subtitle: 'Dental Chew Wrapper Crinkle',
    freqBand: '2,800 – 7,800 Hz',
    durationSec: 2.2,
    purpose: 'เสียงฉีกแกะซองพลาสติกขนมสุนัขความถี่ชัดที่ดึงความสนใจได้ทันที',
    bestFor: ['food', 'hunter']
  },
  {
    id: 'dog-squeaky-toy',
    category: 'prey',
    categoryLabel: 'ของเล่น & เสียงหน้าบ้าน',
    title: 'ตุ๊กตายางบีบปิ๊บๆ',
    subtitle: 'High-Pitch Squeaky Toy',
    freqBand: '2,200 – 4,800 Hz',
    durationSec: 2.4,
    purpose: 'เสียงบีบตุ๊กตายางจังหวะสั้น-ยาว สุนัขทุกสายพันธุ์ได้ยินแล้วต้องเอียงคอและวิ่งมาหา',
    bestFor: ['hunter', 'curious']
  },
  {
    id: 'dog-doorbell',
    category: 'prey',
    categoryLabel: 'ของเล่น & เสียงหน้าบ้าน',
    title: 'กริ่งหน้าบ้าน & เคาะประตู',
    subtitle: 'Front Doorbell Ding-Dong & Knock',
    freqBand: '520 – 2,800 Hz',
    durationSec: 2.5,
    purpose: 'จำลองเสียงกริ่ง Ding-Dong ตามด้วยเสียงเคาะประตู กระตุ้นให้สุนัขวิ่งออกมาหน้าห้องทันที',
    bestFor: ['hunter', 'vocal']
  },
  {
    id: 'dog-whistle',
    category: 'sonic',
    categoryLabel: 'ความถี่พิเศษ & เสียงคุณ',
    title: 'นกหวีดความถี่สูงเรียกสุนัข',
    subtitle: 'High-Freq Dog Whistle (9–14 kHz)',
    freqBand: '8,500 – 13,800 Hz',
    durationSec: 2.5,
    purpose: 'คลื่นความถี่สูงระดับนกหวีดฝึกสุนัข ดึงให้สุนัขหูตั้งและหันหาต้นเสียงจากระยะไกล',
    bestFor: ['curious', 'hunter']
  },
  {
    id: 'dog-kiss-whistle',
    category: 'sonic',
    categoryLabel: 'ความถี่พิเศษ & เสียงคุณ',
    title: 'ผิวปากเรียก & จุ๊ปากชวนเดินเล่น',
    subtitle: 'Owner Lip-Whistle & Kiss Clicks',
    freqBand: '1,200 – 4,200 Hz',
    durationSec: 2.4,
    purpose: 'เสียงผิวปากสองจังหวะสลับเสียงจุ๊ปาก เหมือนเวลาเรียกสุนัขไปเดินเล่นนอกบ้าน',
    bestFor: ['curious', 'vocal', 'timid']
  }
];

export const DOG_SCENARIO_PRESETS = [
  {
    id: 'dog-squeak-lure',
    title: 'ล่อด้วยตุ๊กตายาง & กริ่งบ้าน',
    subtitle: 'เน้นเสียงตุ๊กตายางบีบปิ๊บๆ + กริ่งหน้าบ้าน + ผิวปากชวนเดินเล่น ให้วิ่งออกมาทันที',
    sequence: ['dog-squeaky-toy', 'dog-doorbell', 'dog-kiss-whistle'],
    callSeconds: 3,
    listenSeconds: 3,
    gentleMode: false,
    pitch: 1.0
  },
  {
    id: 'dog-food-rush',
    title: 'ล่อหมาหิวด้วยเสียงของกิน',
    subtitle: 'คอมโบเขย่ากระปุกขนม + เคาะชามข้าว + แกะซองขนมขัดฟัน',
    sequence: ['treat-shake', 'bowl-clink', 'foil-crinkle'],
    callSeconds: 3,
    listenSeconds: 3,
    gentleMode: false,
    pitch: 1.0
  },
  {
    id: 'dog-vocal-reply',
    title: 'ให้เห่าหรือหอนขานรับบอกพิกัด',
    subtitle: 'เน้นเสียงลูกหมาอ้อน + หอนเรียกฝูง + เว้นช่วงเงียบ 4 วินาทีเพื่อฟังเสียงเห่าตอบ',
    sequence: ['dog-puppy-whine', 'dog-howl-call', 'dog-friendly-woof'],
    callSeconds: 3,
    listenSeconds: 4,
    gentleMode: false,
    pitch: 1.0
  },
  {
    id: 'dog-thunder-calm',
    title: 'หมาขี้กลัวฟ้าร้อง / ประทัด',
    subtitle: 'โทนเสียงนุ่ม ลดความถี่แหลม ใช้จังหวะหัวใจเต้นสลับเสียงผิวปากและลูกหมาเบาๆ',
    sequence: ['dog-heartbeat-calm', 'dog-kiss-whistle', 'dog-puppy-whine'],
    callSeconds: 3,
    listenSeconds: 5,
    gentleMode: true,
    pitch: 0.94
  }
];

export class FelineAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.gentleFilter = null;
    this.outputAnalyser = null;
    this.micAnalyser = null;
    this.micStream = null;
    this.micSource = null;

    this.volume = 0.85;
    this.pitch = 1.0;
    this.gentleMode = false;
    this.activeNodes = [];
    this.customAudioDataUrl = localStorage.getItem('whererukitty_custom_voice') || null;
    this.activeCustomAudioEl = null;
    this.simulatedSpikeUntil = 0;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.gentleFilter = this.ctx.createBiquadFilter();
      this.gentleFilter.type = 'lowpass';
      this.gentleFilter.frequency.value = this.gentleMode ? 4200 : 16000;
      this.gentleFilter.Q.value = 0.7;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;

      this.outputAnalyser = this.ctx.createAnalyser();
      this.outputAnalyser.fftSize = 256;
      this.outputAnalyser.smoothingTimeConstant = 0.75;

      this.gentleFilter.connect(this.masterGain);
      this.masterGain.connect(this.outputAnalyser);
      this.outputAnalyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  setPitch(val) {
    this.pitch = Math.max(0.75, Math.min(1.25, val));
  }

  setGentleMode(enabled) {
    this.gentleMode = Boolean(enabled);
    if (this.gentleFilter && this.ctx) {
      const targetFreq = this.gentleMode ? 3800 : 16000;
      this.gentleFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
    }
  }

  stopAllSounds() {
    const now = this.ctx ? this.ctx.currentTime : 0;
    for (const item of this.activeNodes) {
      try {
        if (item.gain && this.ctx) {
          item.gain.gain.cancelScheduledValues(now);
          item.gain.gain.setTargetAtTime(0.0001, now, 0.03);
        }
        if (item.node && typeof item.node.stop === 'function') {
          item.node.stop(now + 0.06);
        }
      } catch (_) {
        // Ignore already stopped nodes
      }
    }
    this.activeNodes = [];
    if (this.activeCustomAudioEl) {
      try {
        this.activeCustomAudioEl.pause();
        this.activeCustomAudioEl.currentTime = 0;
      } catch (_) {}
      this.activeCustomAudioEl = null;
    }
  }

  createNoiseBuffer(durationSec = 2.0) {
    const ctx = this.ensureContext();
    const length = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  registerNode(node, gain) {
    this.activeNodes.push({ node, gain });
  }

  /**
   * Play any sound ID from SOUND_CATALOG or 'custom-voice'
   */
  playSound(soundId) {
    const ctx = this.ensureContext();
    this.stopAllSounds();

    const p = this.pitch * (this.gentleMode ? 0.94 : 1.0);
    const now = ctx.currentTime;

    if (soundId === 'custom-voice') {
      return this.playCustomVoice(now, p);
    }

    switch (soundId) {
      case 'mother-trill':
        this.synthMotherTrill(now, p);
        break;
      case 'kitten-mew':
        this.synthKittenMew(now, p);
        break;
      case 'greeting-meow':
        this.synthGreetingMeow(now, p);
        break;
      case 'purr-chirp':
        this.synthPurrChirp(now, p);
        break;
      case 'wet-can':
        this.synthWetCan(now, p);
        break;
      case 'treat-shake':
        this.synthTreatShake(now, p);
        break;
      case 'bowl-clink':
        this.synthBowlClink(now, p);
        break;
      case 'foil-crinkle':
        this.synthFoilCrinkle(now, p);
        break;
      case 'bird-chirp':
        this.synthBirdChirp(now, p);
        break;
      case 'mouse-squeak':
        this.synthMouseSqueak(now, p);
        break;
      case 'pss-click':
        this.synthPssClick(now, p);
        break;
      case 'ear-perk-sweep':
        this.synthEarPerkSweep(now, p);
        break;
      case 'dog-puppy-whine':
        this.synthDogPuppyWhine(now, p);
        break;
      case 'dog-friendly-woof':
        this.synthDogFriendlyWoof(now, p);
        break;
      case 'dog-howl-call':
        this.synthDogHowlCall(now, p);
        break;
      case 'dog-heartbeat-calm':
        this.synthDogHeartbeatCalm(now, p);
        break;
      case 'dog-squeaky-toy':
        this.synthDogSqueakyToy(now, p);
        break;
      case 'dog-doorbell':
        this.synthDogDoorbell(now, p);
        break;
      case 'dog-whistle':
        this.synthDogWhistle(now, p);
        break;
      case 'dog-kiss-whistle':
        this.synthDogKissWhistle(now, p);
        break;
      default:
        this.synthMotherTrill(now, p);
        break;
    }
  }

  /**
   * 1. Mother Cat Chirrup (Prrt-ek): Rolled glottal trill + ascending formant chirp
   */
  synthMotherTrill(now, p) {
    const ctx = this.ctx;
    const phrases = [
      { offset: 0.05, dur: 0.68, fStart: 270 * p, fPeak: 610 * p, fEnd: 520 * p },
      { offset: 1.05, dur: 0.78, fStart: 290 * p, fPeak: 660 * p, fEnd: 540 * p },
      { offset: 2.0, dur: 0.45, fStart: 340 * p, fPeak: 580 * p, fEnd: 460 * p }
    ];

    for (const ph of phrases) {
      const t0 = now + ph.offset;
      const tEnd = t0 + ph.dur;

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(ph.fStart, t0);
      osc.frequency.exponentialRampToValueAtTime(ph.fPeak, t0 + ph.dur * 0.65);
      osc.frequency.exponentialRampToValueAtTime(ph.fEnd, tEnd);

      // 28 Hz glottal roll modulation during the first 60% ("Prrrrt")
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(28, t0);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(42 * p, t0);
      lfoGain.gain.linearRampToValueAtTime(8 * p, tEnd);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Formant 1 & Formant 2 vocal tract filters
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(580 * p, t0);
      f1.frequency.exponentialRampToValueAtTime(920 * p, t0 + ph.dur * 0.7);
      f1.Q.value = 4.2;

      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.setValueAtTime(1650 * p, t0);
      f2.frequency.exponentialRampToValueAtTime(2250 * p, t0 + ph.dur * 0.7);
      f2.Q.value = 5.0;

      // Amplitude modulation at 28Hz for realistic purr-trill texture
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      const steps = Math.floor(ph.dur * 28);
      for (let i = 0; i < steps; i++) {
        const st = t0 + (i / steps) * ph.dur * 0.65;
        const pulse = i % 2 === 0 ? 0.52 : 0.16;
        env.gain.linearRampToValueAtTime(pulse, st);
      }
      env.gain.linearRampToValueAtTime(0.6, t0 + ph.dur * 0.72);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(f1);
      osc.connect(f2);
      f1.connect(env);
      f2.connect(env);
      env.connect(this.gentleFilter);

      osc.start(t0);
      lfo.start(t0);
      osc.stop(tEnd + 0.04);
      lfo.stop(tEnd + 0.04);
      this.registerNode(osc, env);
    }
  }

  /**
   * 2. Lost Kitten High Mew: High fundamental + formant glide
   */
  synthKittenMew(now, p) {
    const ctx = this.ctx;
    const calls = [
      { offset: 0.08, dur: 0.72, f0: 760 * p, fPeak: 1020 * p, fEnd: 680 * p },
      { offset: 1.15, dur: 0.85, f0: 810 * p, fPeak: 1080 * p, fEnd: 700 * p }
    ];

    for (const c of calls) {
      const t0 = now + c.offset;
      const tEnd = t0 + c.dur;

      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(c.f0, t0);
      osc1.frequency.exponentialRampToValueAtTime(c.fPeak, t0 + c.dur * 0.28);
      osc1.frequency.exponentialRampToValueAtTime(c.fEnd, tEnd);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(c.f0 * 2, t0);
      osc2.frequency.exponentialRampToValueAtTime(c.fPeak * 2, t0 + c.dur * 0.28);
      osc2.frequency.exponentialRampToValueAtTime(c.fEnd * 2, tEnd);

      // Vibrato
      const vib = ctx.createOscillator();
      vib.frequency.value = 6.5;
      const vibG = ctx.createGain();
      vibG.gain.value = 14 * p;
      vib.connect(vibG);
      vibG.connect(osc1.frequency);

      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(980 * p, t0);
      f1.frequency.exponentialRampToValueAtTime(1320 * p, t0 + c.dur * 0.35);
      f1.frequency.exponentialRampToValueAtTime(860 * p, tEnd);
      f1.Q.value = 3.8;

      const f2 = ctx.createBiquadFilter();
      f2.type = 'peaking';
      f2.frequency.setValueAtTime(2800 * p, t0);
      f2.gain.value = 8;
      f2.Q.value = 3.5;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.55, t0 + 0.08);
      env.gain.linearRampToValueAtTime(0.42, t0 + c.dur * 0.7);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc1.connect(f1);
      osc2.connect(f1);
      f1.connect(f2);
      f2.connect(env);
      env.connect(this.gentleFilter);

      osc1.start(t0);
      osc2.start(t0);
      vib.start(t0);
      osc1.stop(tEnd + 0.05);
      osc2.stop(tEnd + 0.05);
      vib.stop(tEnd + 0.05);
      this.registerNode(osc1, env);
    }
  }

  /**
   * 3. Friendly Greeting Meow ("Mrrr-oww")
   */
  synthGreetingMeow(now, p) {
    const ctx = this.ctx;
    const phrases = [
      { offset: 0.06, dur: 0.88, fStart: 350 * p, fPeak: 550 * p, fEnd: 380 * p },
      { offset: 1.22, dur: 0.76, fStart: 380 * p, fPeak: 590 * p, fEnd: 410 * p }
    ];

    for (const ph of phrases) {
      const t0 = now + ph.offset;
      const tEnd = t0 + ph.dur;

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(ph.fStart, t0);
      osc.frequency.exponentialRampToValueAtTime(ph.fPeak, t0 + ph.dur * 0.38);
      osc.frequency.exponentialRampToValueAtTime(ph.fEnd, tEnd);

      // Vowel articulation: [m] -> [a] -> [o] -> [u]
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.Q.value = 3.5;
      f1.frequency.setValueAtTime(420 * p, t0);
      f1.frequency.exponentialRampToValueAtTime(880 * p, t0 + ph.dur * 0.4);
      f1.frequency.exponentialRampToValueAtTime(460 * p, tEnd);

      const f2 = ctx.createBiquadFilter();
      f2.type = 'peaking';
      f2.Q.value = 4.0;
      f2.gain.value = 9;
      f2.frequency.setValueAtTime(1150 * p, t0);
      f2.frequency.exponentialRampToValueAtTime(1750 * p, t0 + ph.dur * 0.4);
      f2.frequency.exponentialRampToValueAtTime(980 * p, tEnd);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.55, t0 + 0.12);
      env.gain.linearRampToValueAtTime(0.48, t0 + ph.dur * 0.65);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(f1);
      f1.connect(f2);
      f2.connect(env);
      env.connect(this.gentleFilter);

      osc.start(t0);
      osc.stop(tEnd + 0.05);
      this.registerNode(osc, env);
    }
  }

  /**
   * 4. Comfort Purr & Soft Trill (26 Hz respiratory purr + gentle chirp)
   */
  synthPurrChirp(now, p) {
    const ctx = this.ctx;
    const dur = 2.8;
    const tEnd = now + dur;

    const carrier = ctx.createOscillator();
    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(52 * p, now);

    const sub = ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(104 * p, now);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(280 * p, now);
    lowpass.Q.value = 2.2;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, now);

    // 26 Hz purr pulses modulated by inhale/exhale swell
    const pulseRate = 26;
    const totalPulses = Math.floor(dur * pulseRate);
    for (let i = 0; i < totalPulses; i++) {
      const t = now + (i / pulseRate);
      const breathPhase = Math.sin((i / totalPulses) * Math.PI * 2);
      const breathAmp = 0.25 + 0.28 * Math.abs(breathPhase);
      const pulseAmp = i % 2 === 0 ? breathAmp : breathAmp * 0.22;
      env.gain.linearRampToValueAtTime(pulseAmp, t);
    }
    env.gain.exponentialRampToValueAtTime(0.001, tEnd);

    carrier.connect(lowpass);
    sub.connect(lowpass);
    lowpass.connect(env);
    env.connect(this.gentleFilter);

    carrier.start(now);
    sub.start(now);
    carrier.stop(tEnd + 0.05);
    sub.stop(tEnd + 0.05);
    this.registerNode(carrier, env);

    // Add a gentle reassuring chirp in the middle
    const chirpStart = now + 1.25;
    const chirpOsc = ctx.createOscillator();
    chirpOsc.type = 'triangle';
    chirpOsc.frequency.setValueAtTime(340 * p, chirpStart);
    chirpOsc.frequency.exponentialRampToValueAtTime(580 * p, chirpStart + 0.26);
    const chirpEnv = ctx.createGain();
    chirpEnv.gain.setValueAtTime(0.001, chirpStart);
    chirpEnv.gain.linearRampToValueAtTime(0.32, chirpStart + 0.05);
    chirpEnv.gain.exponentialRampToValueAtTime(0.001, chirpStart + 0.32);
    chirpOsc.connect(chirpEnv);
    chirpEnv.connect(this.gentleFilter);
    chirpOsc.start(chirpStart);
    chirpOsc.stop(chirpStart + 0.35);
    this.registerNode(chirpOsc, chirpEnv);
  }

  /**
   * 5. Wet Food Can Pull-Tab & Lid Pop:
   *    Stage A (0.08s): Metallic pull-ring click
   *    Stage B (0.45s): Vacuum seal pop + hiss
   *    Stage C (0.85s - 1.55s): Corrugated tin lid peel scrape
   *    Stage D (1.85s, 2.12s): Metal spoon tapping the can rim
   */
  synthWetCan(now, p) {
    const ctx = this.ctx;
    const noiseBuf = this.createNoiseBuffer(2.5);

    // Stage A: Pull-tab metallic click
    this.triggerModalImpact(now + 0.08, [1680 * p, 3120 * p, 5400 * p], 0.09, 0.5);

    // Stage B: Vacuum seal pop
    this.triggerModalImpact(now + 0.44, [620 * p, 1450 * p, 2850 * p], 0.14, 0.65);

    // Stage C: Lid peel metallic friction (6 rapid ratcheting micro-scrapes)
    for (let i = 0; i < 7; i++) {
      const t = now + 0.78 + i * 0.09;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime((1900 + i * 260) * p, t);
      bp.Q.value = 6.5;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.45, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      src.connect(bp);
      bp.connect(g);
      g.connect(this.gentleFilter);
      src.start(t, 0, 0.09);
      this.registerNode(src, g);
    }

    // Stage D: Spoon tap on tin rim ("Tink-tink!")
    this.triggerModalImpact(now + 1.68, [1420 * p, 2980 * p, 4890 * p], 0.22, 0.58);
    this.triggerModalImpact(now + 1.96, [1460 * p, 3040 * p, 5020 * p], 0.26, 0.62);
    this.triggerModalImpact(now + 2.22, [1440 * p, 3010 * p, 4950 * p], 0.28, 0.54);
  }

  /**
   * 6. Treat Bag & Kibble Shake:
   *    4 energetic shakes of a Mylar pouch with rattling dry treats inside
   */
  synthTreatShake(now, p) {
    const ctx = this.ctx;
    const noiseBuf = this.createNoiseBuffer(2.5);
    const shakeTimes = [0.06, 0.42, 0.78, 1.18, 1.54, 1.9];

    for (let s = 0; s < shakeTimes.length; s++) {
      const tShake = now + shakeTimes[s];

      // Mylar bag crinkle burst
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.setValueAtTime((3800 + (s % 2) * 900) * p, tShake);
      hp.Q.value = 2.4;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, tShake);
      g.gain.linearRampToValueAtTime(0.42, tShake + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, tShake + 0.22);

      src.connect(hp);
      hp.connect(g);
      g.connect(this.gentleFilter);
      src.start(tShake, (s * 0.2) % 1.5, 0.24);
      this.registerNode(src, g);

      // 5 kibble pellet collisions per shake
      for (let k = 0; k < 5; k++) {
        const tk = tShake + 0.02 + k * 0.032;
        const baseF = (780 + ((k * 230 + s * 110) % 950)) * p;
        this.triggerModalImpact(tk, [baseF, baseF * 1.72], 0.045, 0.28);
      }
    }
  }

  /**
   * 7. Ceramic Bowl & Spoon Clink
   */
  synthBowlClink(now, p) {
    const strikes = [
      { t: 0.06, amp: 0.65, shift: 1.0 },
      { t: 0.32, amp: 0.58, shift: 1.02 },
      { t: 0.82, amp: 0.68, shift: 0.99 },
      { t: 1.08, amp: 0.55, shift: 1.03 },
      { t: 1.34, amp: 0.62, shift: 1.01 },
      { t: 1.82, amp: 0.66, shift: 1.0 }
    ];

    for (const st of strikes) {
      const f = p * st.shift;
      this.triggerModalImpact(
        now + st.t,
        [1180 * f, 2740 * f, 4620 * f, 6480 * f],
        0.38,
        st.amp
      );
    }
  }

  /**
   * 8. Foil Crinkle Wrapper: Stochastic high-frequency micro-impulses
   */
  synthFoilCrinkle(now, p) {
    const ctx = this.ctx;
    const noiseBuf = this.createNoiseBuffer(2.4);

    for (let i = 0; i < 28; i++) {
      const t = now + 0.04 + i * 0.072 + (i % 3) * 0.012;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      const center = (3200 + ((i * 670) % 4400)) * p;
      bp.frequency.setValueAtTime(center, t);
      bp.Q.value = 5.5;

      const g = ctx.createGain();
      const peak = 0.25 + ((i * 17) % 30) / 100;
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.048);

      src.connect(bp);
      bp.connect(g);
      g.connect(this.gentleFilter);
      src.start(t, (i * 0.07) % 1.8, 0.055);
      this.registerNode(src, g);
    }
  }

  /**
   * 9. Window Sparrow Chirp: Syringeal FM sweeps
   */
  synthBirdChirp(now, p) {
    const ctx = this.ctx;
    const notes = [
      { t: 0.06, dur: 0.11, f1: 2800 * p, f2: 4100 * p, f3: 3200 * p },
      { t: 0.22, dur: 0.14, f1: 3100 * p, f2: 4450 * p, f3: 2900 * p },
      { t: 0.58, dur: 0.09, f1: 3400 * p, f2: 4200 * p, f3: 3600 * p },
      { t: 0.72, dur: 0.18, f1: 2700 * p, f2: 4600 * p, f3: 3100 * p },
      { t: 1.25, dur: 0.12, f1: 2950 * p, f2: 4300 * p, f3: 3300 * p },
      { t: 1.42, dur: 0.12, f1: 3150 * p, f2: 4500 * p, f3: 3400 * p },
      { t: 1.6, dur: 0.22, f1: 2650 * p, f2: 4250 * p, f3: 2850 * p },
      { t: 2.05, dur: 0.15, f1: 3000 * p, f2: 4400 * p, f3: 3150 * p }
    ];

    for (const n of notes) {
      const t0 = now + n.t;
      const tEnd = t0 + n.dur;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f1, t0);
      osc.frequency.exponentialRampToValueAtTime(n.f2, t0 + n.dur * 0.45);
      osc.frequency.exponentialRampToValueAtTime(n.f3, tEnd);

      // FM modulator for bird throat texture
      const mod = ctx.createOscillator();
      mod.frequency.value = 55;
      const modG = ctx.createGain();
      modG.gain.value = 120 * p;
      mod.connect(modG);
      modG.connect(osc.frequency);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.48, t0 + 0.018);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(env);
      env.connect(this.gentleFilter);

      osc.start(t0);
      mod.start(t0);
      osc.stop(tEnd + 0.02);
      mod.stop(tEnd + 0.02);
      this.registerNode(osc, env);
    }
  }

  /**
   * 10. Mouse Squeak & Scurry
   */
  synthMouseSqueak(now, p) {
    const ctx = this.ctx;
    const squeaks = [
      { t: 0.08, dur: 0.09, fStart: 3900 * p, fPeak: 5400 * p },
      { t: 0.22, dur: 0.08, fStart: 4200 * p, fPeak: 5600 * p },
      { t: 0.35, dur: 0.11, fStart: 3800 * p, fPeak: 5200 * p },
      { t: 0.95, dur: 0.09, fStart: 4100 * p, fPeak: 5500 * p },
      { t: 1.1, dur: 0.12, fStart: 4300 * p, fPeak: 5750 * p },
      { t: 1.68, dur: 0.08, fStart: 3950 * p, fPeak: 5300 * p },
      { t: 1.82, dur: 0.1, fStart: 4150 * p, fPeak: 5450 * p }
    ];

    for (const sq of squeaks) {
      const t0 = now + sq.t;
      const tEnd = t0 + sq.dur;

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(sq.fStart, t0);
      osc.frequency.exponentialRampToValueAtTime(sq.fPeak, t0 + sq.dur * 0.55);
      osc.frequency.exponentialRampToValueAtTime(sq.fStart * 0.92, tEnd);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.46, t0 + 0.015);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(env);
      env.connect(this.gentleFilter);

      osc.start(t0);
      osc.stop(tEnd + 0.02);
      this.registerNode(osc, env);
    }
  }

  /**
   * 11. Pss-Pss-Pss & Tongue Clicks
   */
  synthPssClick(now, p) {
    const ctx = this.ctx;
    const noiseBuf = this.createNoiseBuffer(2.5);
    const pssTimes = [0.06, 0.34, 0.62, 1.48, 1.76, 2.04];
    const clickTimes = [0.98, 1.18];

    for (const pt of pssTimes) {
      const t0 = now + pt;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(5400 * p, t0);
      bp.Q.value = 3.2;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.48, t0 + 0.025);
      env.gain.exponentialRampToValueAtTime(0.001, t0 + 0.17);

      src.connect(bp);
      bp.connect(env);
      env.connect(this.gentleFilter);
      src.start(t0, 0, 0.19);
      this.registerNode(src, env);
    }

    for (const ct of clickTimes) {
      this.triggerModalImpact(now + ct, [1450 * p, 2920 * p], 0.035, 0.65);
    }
  }

  /**
   * 12. Feline Ear-Perk Harmonic Chime (3–6 kHz pinna localization band)
   */
  synthEarPerkSweep(now, p) {
    const ctx = this.ctx;
    const notes = [3120, 3920, 4680, 5240, 3920, 4960, 5880];

    notes.forEach((freq, idx) => {
      const t0 = now + 0.05 + idx * 0.32;
      const tEnd = t0 + 0.42;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * p, t0);
      osc.frequency.exponentialRampToValueAtTime(freq * p * 1.04, tEnd);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.36, t0 + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(env);
      env.connect(this.gentleFilter);

      osc.start(t0);
      osc.stop(tEnd + 0.02);
      this.registerNode(osc, env);
    });
  }

  /**
   * Modal resonance impact helper (tin cans, ceramic bowls, kibble, tongue clicks)
   */
  triggerModalImpact(t0, freqs, decaySec, masterAmp) {
    const ctx = this.ctx;
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t0);

      const modeDecay = decaySec / (1 + idx * 0.55);
      const env = ctx.createGain();
      const amp = (masterAmp / freqs.length) * (1 - idx * 0.15);
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(Math.max(0.05, amp), t0 + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0008, t0 + modeDecay);

      osc.connect(env);
      env.connect(this.gentleFilter);

      osc.start(t0);
      osc.stop(t0 + modeDecay + 0.02);
      this.registerNode(osc, env);
    });
  }

  /**
   * 13. Dog Mode — Playful Puppy Whine & Yip: Expressive ascending nasal whines + bright yip
   */
  synthDogPuppyWhine(now, p) {
    const ctx = this.ctx;
    const whines = [
      { offset: 0.05, dur: 0.65, fStart: 520 * p, fPeak: 1120 * p, fEnd: 680 * p },
      { offset: 0.85, dur: 0.72, fStart: 560 * p, fPeak: 1280 * p, fEnd: 740 * p }
    ];
    for (const w of whines) {
      const t0 = now + w.offset;
      const tEnd = t0 + w.dur;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(w.fStart, t0);
      osc.frequency.exponentialRampToValueAtTime(w.fPeak, t0 + w.dur * 0.45);
      osc.frequency.exponentialRampToValueAtTime(w.fEnd, tEnd);

      const vib = ctx.createOscillator();
      vib.frequency.setValueAtTime(8.5, t0);
      const vibG = ctx.createGain();
      vibG.gain.setValueAtTime(22 * p, t0);
      vib.connect(vibG);
      vibG.connect(osc.frequency);

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1150 * p, t0);
      bp.Q.setValueAtTime(3.2, t0);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.28, t0 + 0.07);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(bp);
      bp.connect(env);
      env.connect(this.gentleFilter);

      osc.start(t0);
      vib.start(t0);
      osc.stop(tEnd + 0.02);
      vib.stop(tEnd + 0.02);
      this.registerNode(osc, env);
    }

    // Two playful puppy yips at the end
    [1.72, 2.08].forEach((offset, idx) => {
      const t0 = now + offset;
      const dur = 0.22;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime((920 + idx * 90) * p, t0);
      osc.frequency.exponentialRampToValueAtTime((1780 + idx * 120) * p, t0 + 0.08);
      osc.frequency.exponentialRampToValueAtTime(640 * p, t0 + dur);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.34, t0 + 0.025);
      env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

      osc.connect(env);
      env.connect(this.gentleFilter);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
      this.registerNode(osc, env);
    });
  }

  /**
   * 14. Dog Mode — Friendly Play-Bow Double Bark: Chest-cavity formant bark + happy pant
   */
  synthDogFriendlyWoof(now, p) {
    const ctx = this.ctx;
    const barks = [
      { offset: 0.08, dur: 0.24, f0: 230 * p, fPeak: 420 * p, fEnd: 190 * p, amp: 0.42 },
      { offset: 0.42, dur: 0.30, f0: 260 * p, fPeak: 490 * p, fEnd: 210 * p, amp: 0.48 },
      { offset: 1.25, dur: 0.26, f0: 250 * p, fPeak: 460 * p, fEnd: 200 * p, amp: 0.44 }
    ];

    for (const b of barks) {
      const t0 = now + b.offset;
      const tEnd = t0 + b.dur;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(b.f0, t0);
      osc.frequency.exponentialRampToValueAtTime(b.fPeak, t0 + 0.055);
      osc.frequency.exponentialRampToValueAtTime(b.fEnd, tEnd);

      const formant1 = ctx.createBiquadFilter();
      formant1.type = 'bandpass';
      formant1.frequency.setValueAtTime(580 * p, t0);
      formant1.Q.setValueAtTime(2.4, t0);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(b.amp, t0 + 0.025);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(formant1);
      formant1.connect(env);
      env.connect(this.gentleFilter);

      osc.start(t0);
      osc.stop(tEnd + 0.02);
      this.registerNode(osc, env);
    }
  }

  /**
   * 15. Dog Mode — Pack Harmonic Howl Call: Smooth harmonic vocal glide with vibrato
   */
  synthDogHowlCall(now, p) {
    const ctx = this.ctx;
    const t0 = now + 0.06;
    const dur = 2.55;
    const tEnd = t0 + dur;

    const harmonics = [1, 2, 3];
    const gains = [0.32, 0.16, 0.07];

    harmonics.forEach((mult, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(280 * mult * p, t0);
      osc.frequency.exponentialRampToValueAtTime(540 * mult * p, t0 + 0.55);
      osc.frequency.exponentialRampToValueAtTime(620 * mult * p, t0 + 1.45);
      osc.frequency.exponentialRampToValueAtTime(410 * mult * p, tEnd);

      const vib = ctx.createOscillator();
      vib.frequency.setValueAtTime(5.2, t0);
      const vibG = ctx.createGain();
      vibG.gain.setValueAtTime(10 * mult * p, t0);
      vib.connect(vibG);
      vibG.connect(osc.frequency);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(gains[idx], t0 + 0.25);
      env.gain.setValueAtTime(gains[idx] * 0.9, t0 + 1.8);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(env);
      env.connect(this.gentleFilter);

      osc.start(t0);
      vib.start(t0);
      osc.stop(tEnd + 0.03);
      vib.stop(tEnd + 0.03);
      this.registerNode(osc, env);
    });
  }

  /**
   * 16. Dog Mode — Calming Heartbeat & Soft Pant: Low-frequency Lub-Dub pulse for timid/scared dogs
   */
  synthDogHeartbeatCalm(now, p) {
    const ctx = this.ctx;
    const beats = [0.08, 0.95, 1.82];
    for (const cycleOffset of beats) {
      // Lub (first beat) + Dub (second beat)
      const pulses = [
        { dt: 0, fStart: 68 * p, fEnd: 38 * p, amp: 0.48, dur: 0.16 },
        { dt: 0.24, fStart: 58 * p, fEnd: 34 * p, amp: 0.36, dur: 0.14 }
      ];
      for (const pulse of pulses) {
        const t0 = now + cycleOffset + pulse.dt;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pulse.fStart, t0);
        osc.frequency.exponentialRampToValueAtTime(pulse.fEnd, t0 + pulse.dur);

        const env = ctx.createGain();
        env.gain.setValueAtTime(0.001, t0);
        env.gain.linearRampToValueAtTime(pulse.amp, t0 + 0.025);
        env.gain.exponentialRampToValueAtTime(0.001, t0 + pulse.dur);

        osc.connect(env);
        env.connect(this.gentleFilter);
        osc.start(t0);
        osc.stop(t0 + pulse.dur + 0.02);
        this.registerNode(osc, env);
      }
    }
  }

  /**
   * 17. Dog Mode — High-Pitch Squeaky Toy: Vinyl reed squeeze + air-release squeak
   */
  synthDogSqueakyToy(now, p) {
    const ctx = this.ctx;
    const squeaks = [
      { offset: 0.05, sDur: 0.14, rDur: 0.22, fLow: 2350 * p, fHigh: 3550 * p },
      { offset: 0.48, sDur: 0.13, rDur: 0.20, fLow: 2450 * p, fHigh: 3720 * p },
      { offset: 0.92, sDur: 0.16, rDur: 0.34, fLow: 2300 * p, fHigh: 3850 * p },
      { offset: 1.48, sDur: 0.14, rDur: 0.24, fLow: 2500 * p, fHigh: 3680 * p },
      { offset: 1.88, sDur: 0.16, rDur: 0.32, fLow: 2400 * p, fHigh: 3900 * p }
    ];

    for (const sq of squeaks) {
      const t0 = now + sq.offset;
      const tMid = t0 + sq.sDur;
      const tEnd = tMid + sq.rDur;

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(sq.fLow, t0);
      osc.frequency.exponentialRampToValueAtTime(sq.fHigh, tMid);
      osc.frequency.exponentialRampToValueAtTime(sq.fLow * 0.92, tEnd);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.36, t0 + 0.025);
      env.gain.linearRampToValueAtTime(0.14, tMid);
      env.gain.linearRampToValueAtTime(0.28, tMid + 0.03);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(env);
      env.connect(this.gentleFilter);
      osc.start(t0);
      osc.stop(tEnd + 0.02);
      this.registerNode(osc, env);
    }
  }

  /**
   * 18. Dog Mode — Front Doorbell Ding-Dong & Knock: Two-tone chime + wooden door knocks
   */
  synthDogDoorbell(now, p) {
    const ctx = this.ctx;
    const chimes = [
      { offset: 0.05, freq: 784 * p, dur: 0.75 }, // G5 Ding
      { offset: 0.58, freq: 659.25 * p, dur: 0.95 } // E5 Dong
    ];
    for (const ch of chimes) {
      const t0 = now + ch.offset;
      [1, 2, 3].forEach((h, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(ch.freq * h, t0);

        const env = ctx.createGain();
        const peak = [0.34, 0.12, 0.05][idx];
        env.gain.setValueAtTime(0.001, t0);
        env.gain.linearRampToValueAtTime(peak, t0 + 0.012);
        env.gain.exponentialRampToValueAtTime(0.001, t0 + ch.dur / h);

        osc.connect(env);
        env.connect(this.gentleFilter);
        osc.start(t0);
        osc.stop(t0 + ch.dur + 0.02);
        this.registerNode(osc, env);
      });
    }

    // Three brisk wooden door knocks
    [1.48, 1.72, 1.96].forEach((offset) => {
      const t0 = now + offset;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(210 * p, t0);
      osc.frequency.exponentialRampToValueAtTime(95 * p, t0 + 0.065);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.45, t0 + 0.006);
      env.gain.exponentialRampToValueAtTime(0.001, t0 + 0.075);

      osc.connect(env);
      env.connect(this.gentleFilter);
      osc.start(t0);
      osc.stop(t0 + 0.085);
      this.registerNode(osc, env);
    });
  }

  /**
   * 19. Dog Mode — High-Frequency Dog Whistle (8.5–13.8 kHz): Attention-perking ultrasonic-edge call
   */
  synthDogWhistle(now, p) {
    const ctx = this.ctx;
    const phrases = [
      { offset: 0.05, dur: 0.55, f1: 8800 * p, f2: 11800 * p },
      { offset: 0.72, dur: 0.55, f1: 9200 * p, f2: 12600 * p },
      { offset: 1.42, dur: 0.92, f1: 8600 * p, f2: 13200 * p }
    ];

    for (const ph of phrases) {
      const t0 = now + ph.offset;
      const tEnd = t0 + ph.dur;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(ph.f1, t0);
      osc.frequency.exponentialRampToValueAtTime(ph.f2, t0 + ph.dur * 0.65);
      osc.frequency.exponentialRampToValueAtTime(ph.f1 * 1.08, tEnd);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.24, t0 + 0.03);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(t0);
      osc.stop(tEnd + 0.02);
      this.registerNode(osc, env);
    }
  }

  /**
   * 20. Dog Mode — Owner Lip-Whistle & Kiss Clicks: Classic "Come here!" two-note whistle
   */
  synthDogKissWhistle(now, p) {
    const ctx = this.ctx;
    const whistles = [
      { offset: 0.06, dur: 0.42, fStart: 1320 * p, fEnd: 2180 * p },
      { offset: 0.58, dur: 0.55, fStart: 1420 * p, fEnd: 2480 * p },
      { offset: 1.55, dur: 0.62, fStart: 1360 * p, fEnd: 2360 * p }
    ];
    for (const w of whistles) {
      const t0 = now + w.offset;
      const tEnd = t0 + w.dur;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(w.fStart, t0);
      osc.frequency.exponentialRampToValueAtTime(w.fEnd, tEnd);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.32, t0 + 0.04);
      env.gain.exponentialRampToValueAtTime(0.001, tEnd);

      osc.connect(env);
      env.connect(this.gentleFilter);
      osc.start(t0);
      osc.stop(tEnd + 0.02);
      this.registerNode(osc, env);
    }

    // Two crisp kiss-smack clicks between whistles
    [1.22, 1.36].forEach((offset) => {
      const t0 = now + offset;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800 * p, t0);
      osc.frequency.exponentialRampToValueAtTime(1100 * p, t0 + 0.045);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t0);
      env.gain.linearRampToValueAtTime(0.34, t0 + 0.005);
      env.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);

      osc.connect(env);
      env.connect(this.gentleFilter);
      osc.start(t0);
      osc.stop(t0 + 0.055);
      this.registerNode(osc, env);
    });
  }

  /**
   * Play custom recorded owner voice or warm synthesized fallback call
   */
  playCustomVoice(now, p) {
    if (this.customAudioDataUrl) {
      try {
        const audio = new Audio(this.customAudioDataUrl);
        audio.volume = this.volume;
        audio.playbackRate = p;
        this.activeCustomAudioEl = audio;
        audio.play().catch(() => {
          this.synthGreetingMeow(now, p);
        });
        return;
      } catch (_) {
        // Fallback to synthesized call
      }
    }
    // Synthesize a warm two-syllable calling melody + mother trill
    this.synthGreetingMeow(now, p * 0.95);
  }

  saveCustomVoiceDataUrl(dataUrl) {
    this.customAudioDataUrl = dataUrl;
    if (dataUrl) {
      try {
        localStorage.setItem('whererukitty_custom_voice', dataUrl);
      } catch (_) {}
    } else {
      localStorage.removeItem('whererukitty_custom_voice');
    }
  }

  /**
   * Enable live microphone monitoring for the Listening Window
   */
  async enableMicrophoneRadar() {
    const ctx = this.ensureContext();
    if (this.micAnalyser && this.micStream) {
      return { supported: true, active: true };
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { supported: false, active: false, reason: 'เบราว์เซอร์นี้ไม่รองรับการเข้าถึงไมโครโฟน' };
    }
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true
        }
      });
      this.micSource = ctx.createMediaStreamSource(this.micStream);
      this.micAnalyser = ctx.createAnalyser();
      this.micAnalyser.fftSize = 256;
      this.micAnalyser.smoothingTimeConstant = 0.65;
      this.micSource.connect(this.micAnalyser);
      return { supported: true, active: true };
    } catch (err) {
      return {
        supported: true,
        active: false,
        reason: 'ยังไม่ได้รับสิทธิ์ไมโครโฟน (สามารถใช้ปุ่มจำลองเสียงขานรับเพื่อทดสอบเรดาร์ได้)'
      };
    }
  }

  disableMicrophoneRadar() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch (_) {}
      this.micSource = null;
    }
    this.micAnalyser = null;
  }

  /**
   * Trigger a realistic simulated cat meow or dog bark reply spike on the radar (for testing or demo)
   */
  triggerSimulatedCatReply(species = 'cat') {
    this.simulatedSpikeUntil = performance.now() + 1400;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    if (species === 'dog') {
      // Distant two-syllable dog bark + yip reply
      [0, 0.28].forEach((offset, idx) => {
        const t0 = now + offset;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250 + idx * 40, t0);
        osc.frequency.exponentialRampToValueAtTime(480 + idx * 60, t0 + 0.05);
        osc.frequency.exponentialRampToValueAtTime(210, t0 + 0.2);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(620, t0);
        bp.Q.setValueAtTime(2.2, t0);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, t0);
        g.gain.linearRampToValueAtTime(0.22, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.21);

        osc.connect(bp);
        bp.connect(g);
        g.connect(this.gentleFilter);
        osc.start(t0);
        osc.stop(t0 + 0.22);
      });
      return;
    }
    // Play a soft distant kitten/cat reply so the user hears what a distant reply sounds like
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.22);
    osc.frequency.exponentialRampToValueAtTime(490, now + 0.55);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.18, now + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

    osc.connect(g);
    g.connect(this.gentleFilter);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Read 24 frequency bars in the feline vocal/lure band + peak level (0..100)
   */
  sampleSpectrumFrame(mode = 'idle') {
    const bars = new Array(24).fill(4);
    const nowMs = performance.now();
    const isSimulated = nowMs < this.simulatedSpikeUntil;

    const analyser = mode === 'listening' && this.micAnalyser ? this.micAnalyser : this.outputAnalyser;
    if (analyser && this.ctx && this.ctx.state === 'running') {
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buf);
      let sum = 0;
      for (let i = 0; i < 24; i++) {
        const binIdx = Math.min(buf.length - 1, Math.floor(i * 1.6) + 2);
        let val = Math.round((buf[binIdx] / 255) * 100);
        if (isSimulated && i >= 5 && i <= 16) {
          const wave = Math.sin(nowMs / 70 + i * 0.5) * 22 + 68;
          val = Math.max(val, Math.round(wave));
        }
        bars[i] = Math.max(4, Math.min(100, val));
        sum += bars[i];
      }
      const avg = Math.round(sum / 24);
      return {
        bars,
        level: avg,
        detectedMeow: isSimulated || (mode === 'listening' && avg >= 34)
      };
    }

    if (isSimulated) {
      let sum = 0;
      for (let i = 0; i < 24; i++) {
        const centerDist = Math.abs(i - 10);
        const val = Math.max(8, Math.round(84 - centerDist * 6 + Math.sin(nowMs / 60 + i) * 12));
        bars[i] = val;
        sum += val;
      }
      return {
        bars,
        level: Math.round(sum / 24),
        detectedMeow: true
      };
    }

    return { bars, level: 4, detectedMeow: false };
  }
}
