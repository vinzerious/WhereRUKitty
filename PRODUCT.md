# Product

<!-- impeccable:product-schema 1 -->

> **Note on Autonomy (`/goal`):** All fields below are inferred directly from the explicit user brief (`/goal ทำ web app ส่งเสียงเรียกแมวเพราะหาแมวไม่เจอ ให้แมวออกมาจากที่ซ่อน หรือร้องตอบรับว่าตัวเองอยู่ไหน โดยใช้มือถือหรือ tablet เป็นหลัก`) because the session was launched with `/goal` for autonomous end-to-end execution.

## Platform

web

## Stack

delegated: Vanilla HTML5, Modern CSS (Container Queries, Dynamic Viewport Units `dvh`, Custom Properties, Native `<dialog closedby="any">`), and Modular ES JavaScript with a zero-dependency Web Audio API physical/formant acoustic synthesizer, MediaRecorder custom voice sampler, and Web Audio `AnalyserNode` live meow/rustle listener. Configured as an installable offline-capable Mobile/Tablet Web App (`manifest.webmanifest`).

## Users

- **Primary User:** Cat and dog owners (ทาสแมวและคนรักสุนัข) using a **smartphone or tablet** in hand while walking through rooms, peeking under beds/sofas/tables, or checking closets/yards to find a hiding cat or dog.
- **Situation & Job:** The pet is hiding in the house/condo/yard and won't come out. The owner needs a single-handed mobile/tablet acoustic tool with a one-tap **Species Mode Toggle (`โหมดแมว` ↔ `โหมดสุนัข`)** that either (1) lures the pet out of hiding (food/prey/squeaky-toy/doorbell triggers) or (2) coaxes the pet into meowing, barking, or whining back to reveal its location (mother cat trill, kitten call, puppy whine, pack howl, dog whistle, custom owner voice), while leaving quiet listening windows so the owner can hear the faint response.

## Product Purpose

**WhereRUKitty (เหมียวอยู่ไหน)** is a mobile- and tablet-first acoustic cat-caller and hiding-spot locator web application. Success means the user can immediately launch a sound or an automated **Call & Listen Cycle (ส่งเสียงเรียก → เว้นจังหวะเงียบฟังเสียงขานรับ)** with one thumb, adjust pitch/frequency or cat mood presets, see real-time microphone sound-level spikes during the listening window when the cat meows or rustles, use a built-in screen/camera torch to check dark corners, and track checked hiding spots.

## Positioning

Unlike generic novelty soundboards that play a flat 1-second clip and force constant tapping (or play continuous noise that masks the cat's quiet reply), **WhereRUKitty** is built around an **Acoustic Call-and-Listen Cycle (ระบบสลับส่งเสียงเรียกและเงียบฟังเสียงตอบรับอัตโนมัติ)**: it pairs multi-layered formant & physical-modeling cat/lure acoustics with a timed **Quiet Listening Window** backed by a live microphone dB/frequency monitor that visually flags faint meows or movement when the room goes quiet.

## Operating Context

- Used primarily on **iOS/Android smartphones (one-handed portrait thumb zone)** and **tablets (split two-column field console in portrait/landscape)** while walking from room to room.
- Often used in dim indoor environments (under beds, behind curtains, inside wardrobes, evening rooms) where high contrast, large touch targets (`≥48px`), zero accidental mis-taps, and a built-in warm/bright inspection light are essential.
- Requires bilingual Thai-first UI copy (ภาษาไทยที่เข้าใจง่ายสำหรับทาสแมว พร้อมกำกับคำศัพท์เทคนิค/เสียงเป็นภาษาอังกฤษอย่างเป็นธรรมชาติ).

## Capabilities and Constraints

- **Instant Species Mode Toggle (`โหมดแมว` ↔ `โหมดสุนัข`):** Segmented toggle button in the top header shell (`#speciesCatBtn` / `#speciesDogBtn`) that switches the entire app between **Cat Mode (`เหมียวอยู่ไหน WhereRUKitty`)** and **Dog Mode (`ตูบอยู่ไหน WhereRUDoggy`)**, swapping the brand emblem, 12 acoustic synthesizers, 4 scenario presets, radar simulation, and 8 default hiding spots.
- **12 Formant & Physical-Modeling Sound Generators per Species Mode across 4 Tactical Categories:**
  1. **โหมดเรียกให้ร้อง/เห่าตอบ (Vocal Reply Triggers):**
     - *Cat Mode:* แม่แมวเรียกหาลูก (Mother Trill `Prrt-ek`), ลูกแมวร้องหาแม่ (Lost Kitten Mew), เหมียวทักทายอ้อนๆ (Friendly Greeting Meow), กรนครืดๆ + เรียกสั้นๆ (Comfort Purr & Chirp).
     - *Dog Mode:* ลูกหมาอ้อนเรียกหา (Playful Puppy Whine & Yip), โฮ่งทักทายชวนเล่น (Friendly Play-Bow Double Bark), หอนเรียกฝูงสั้นๆ (Pack Harmonic Howl Call), หัวใจเต้น & ลมหายใจปลอบใจ (Calming Heartbeat & Soft Pant).
  2. **โหมดล่อด้วยของกิน (Food & Treat Lures):** เปิดกระป๋องอาหารเปียก (Wet Can Pull-Tab & Pop), เขย่าถุงขนม/อาหารเม็ด (Treat Bag Shake), เคาะชามข้าว (Bowl Clink), ขยำซองขนม/สแน็คขัดฟัน (Crinkle Wrapper).
  3. **โหมดกระตุ้นสัญชาตญาณนักล่า / ของเล่น & กริ่งบ้าน (Prey, Toys & Door Triggers):**
     - *Cat Mode:* นกกระจอกร้องริมหน้าต่าง (Sparrow Chirp), หนูจี๊ดๆ วิ่งตามซอก (Mouse Squeak).
     - *Dog Mode:* ตุ๊กตายางบีบปิ๊บๆ (High-Pitch Squeaky Toy), กริ่งหน้าบ้าน & เคาะประตู (Front Doorbell Ding-Dong & Knock).
  4. **โหมดความถี่พิเศษเรียกความสนใจ (Sonic Attention & Custom):**
     - *Cat Mode:* เสียงจุ๊ปาก/ชู่วๆ (Pss-Pss & Tongue Clicks), คลื่นความถี่กระตุ้นหูแมว 3–6 kHz (Feline Ear-Perk Chime).
     - *Dog Mode:* นกหวีดความถี่สูงเรียกสุนัข 9–14 kHz (High-Freq Dog Whistle), ผิวปากเรียก & จุ๊ปากชวนเดินเล่น (Owner Lip-Whistle & Kiss Clicks).
     - *Shared:* **อัดเสียงตัวเองเรียกชื่อสัตว์เลี้ยง (Custom Owner Voice Recorder)**.
- **Call & Listen Auto-Loop (โหมดเรียกสลับเงียบฟังเสียง):** Configurable Call Duration (e.g., 3s) + Quiet Listen Duration (e.g., 4s) + Sequence Queue (combo of up to 3 sounds).
- **Live Acoustic Ear Radar (เรดาร์ช่วยฟังเสียงขานรับ):** Optional microphone input using Web Audio `AnalyserNode` tuned to feline vocal frequencies (400 Hz – 4500 Hz) that listens specifically during the Quiet Window (or on demand) so speaker output never false-triggers it, logging timestamps when a sound spike occurs.
- **Scenario / Cat Mood Quick Presets (โหมดตามนิสัยแมว):**
  - `หิว/เห็นแก่กิน` (Food-Motivated Lure Combo)
  - `อยากรู้อยากเห็น/ชอบคุย` (Vocal Reply & Mother Trill Combo)
  - `ขี้กลัว/ตื่นที่ใหม่` (Gentle Purr + Soft Kitten Call — avoids loud startling noises)
  - `นักล่าจอมซน` (Prey Rustle & Bird Chirp Combo)
- **Hiding Spot Checklist & Flashlight Utility:** Interactive checklist of common indoor cat hiding spots with room tags + Under-Sofa Screen Torch / Hardware Flash toggle.
- **Acoustic Tuning:** Master Volume, Pitch/Frequency Shift (`-25%` to `+25%` to match individual cat preferences), and Repeat Tempo.

## Product Principles

1. **One-Thumb Immediate Action:** The primary Call button, emergency gentle mode, and top sound triggers must sit comfortably in the mobile thumb zone and respond on first tap with visual waveform feedback.
2. **Never Drown Out the Cat:** Every looping call mode must prioritize a silent listening gap so the owner can hear a faint meow or collar bell from another room.
3. **Cat-Safe Acoustics:** Never emit harsh, painful, or aggressive distress screeches; include a one-tap "โหมดแมวขี้กลัว (Gentle Mode)" that caps sharp transients and uses soothing trills and purrs.
4. **Mobile & Tablet Native Ergonomics:** Adapt seamlessly from a compact single-column handheld field transceiver on phones (`390px`) to a side-by-side acoustic deck + radar/checklist console on tablets (`768px–1024px+`).
