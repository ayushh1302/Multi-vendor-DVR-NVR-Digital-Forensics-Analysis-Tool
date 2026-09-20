/**
 * BRUCH.DFA - Interactive Forensic Analysis Simulation & Playback Engine
 * Features real-time 60fps CCTV canvas rendering, live millisecond timecodes,
 * dynamic AI target tracking boxes, interactive multi-channel switching,
 * timeline seek with tamper gap alarms, deep hex cluster carving, and court export.
 */

const ForensicDemoEngine = {
  activeCase: null,
  isProcessing: false,

  // Playback & Animation State
  playback: {
    isPlaying: true,
    speed: 1,
    channel: 1,
    showAi: true,
    baseTime: Date.now(),
    frameCounter: 1840,
    targets: [
      { type: 'vehicle', label: 'VEHICLE ID#82 [94.1%]', plate: 'PLATE [7XYZ89]', x: 60, y: 195, w: 140, h: 75, vx: 1.8, color: '#34D399' },
      { type: 'person', label: 'PERSON ID#104 [96.4%]', x: 440, y: 140, w: 42, h: 90, vx: -0.9, color: '#FFFFFF' },
      { type: 'person2', label: 'PERSON ID#109 [89.2%]', x: 180, y: 155, w: 38, h: 80, vx: 0.6, color: '#CBD5E1' }
    ],
    cctvImage: null,
    imageLoaded: false,
    animFrameId: null
  },

  // Forensic Disk Imaging State
  imagingState: {
    format: 'dd',
    sourceDevice: 'dahua_wd_2tb',
    isAcquiring: false,
    lastCreatedCase: null
  },

  presets: {
    dahua: {
      caseId: "CASE-2026-DH-8491",
      filename: "evidence_dahua_dvr_5108hs_raw.dd",
      size: "2.0 TB (1,863.02 GiB)",
      vendor: "Dahua Technology",
      model: "DH-XVR5108HS-4KL-I3",
      firmware: "V4.001.0000000.1.R.220415",
      filesystem: "Dahua DHFS proprietary circular layout (ext3 base)",
      sourceMd5: "7f4c26a9e851d42398b1a7c5031b2890",
      sourceSha256: "9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a",
      streamsExtracted: 84,
      carvedClips: 12,
      timelineGaps: 2,
      streams: [
        { id: "EV-0101", channel: "CH 01", start: "2026-09-18 08:00:14 UTC", end: "2026-09-18 09:00:00 UTC", duration: "00:59:46", resolution: "1920x1080", codec: "H.264 / AVC", container: ".dav -> .mp4 (Lossless)", status: "Active (Allocated)", confidence: "100%", md5: "a81fe2410a76bc32910fa43b1239cd01", sha256: "617b3a721c569f41b2aa8d31294efbc126938dc36541f48ab03b7156942ce11a", ai: "Person (96%), Vehicle (91%)" },
        { id: "EV-0102", channel: "CH 01", start: "2026-09-18 09:00:00 UTC", end: "2026-09-18 09:45:10 UTC", duration: "00:45:10", resolution: "1920x1080", codec: "H.264 / AVC", container: ".dav -> .mp4 (Lossless)", status: "Active (Allocated)", confidence: "100%", md5: "542a19b889cdfe0132a67bc454a81ef0", sha256: "338fa912cb10495817aef9823467b091e4a5d8927163f4ab82716cd54199042b", ai: "Motion Alert (88%)" },
        { id: "EV-0103-CRV", channel: "CH 01", start: "2026-09-18 10:15:00 UTC", end: "2026-09-18 10:28:44 UTC", duration: "00:13:44", resolution: "1920x1080", codec: "H.264 / AVC", container: ".dav -> .mp4 (Repackaged)", status: "Carved (Deleted Space)", confidence: "94.8%", md5: "90cdfe71a2389145fa81a2938475cb01", sha256: "f489b0134cd98162541a783b65287f34a10e74b967198d0234ac871b65e90341", ai: "Person (94%), Object Move (92%)" },
        { id: "EV-0201", channel: "CH 02", start: "2026-09-18 08:00:00 UTC", end: "2026-09-18 09:00:00 UTC", duration: "01:00:00", resolution: "2560x1440", codec: "H.265 / HEVC", container: ".dav -> .mp4 (Lossless)", status: "Active (Allocated)", confidence: "100%", md5: "62a45fb8912cdfa10984a1e94827fb33", sha256: "091ab764fe3109a8274d8123c591a48e71b260934f81a74e5109b82371904a62", ai: "Vehicle (98%)" },
        { id: "EV-0202-CRV", channel: "CH 02", start: "2026-09-18 09:30:12 UTC", end: "2026-09-18 09:41:20 UTC", duration: "00:11:08", resolution: "2560x1440", codec: "H.265 / HEVC", container: ".dav -> .mp4 (Repackaged)", status: "Carved (Unallocated)", confidence: "91.2%", md5: "4471a980bc234f918e76231a4789fa12", sha256: "712e9874cb321098fa871b4a652390a18471e9a341b802e9714ab610934e8921", ai: "Person (91%)" },
        { id: "EV-GAP-01", channel: "CH 01", start: "2026-09-18 09:45:10 UTC", end: "2026-09-18 10:15:00 UTC", duration: "00:29:50", resolution: "N/A", codec: "N/A", container: "RECORDING GAP DETECTED", status: "Tamper / Power Anomaly", confidence: "FLAGGED", md5: "UNALLOCATED_ZEROED", sha256: "UNALLOCATED_ZEROED", ai: "Suspicious Inactivity" }
      ]
    },

    hikvision: {
      caseId: "CASE-2026-HK-7104",
      filename: "hikvision_ds7208_court_evidence.E01",
      size: "1.0 TB (931.51 GiB)",
      vendor: "Hikvision Digital Technology",
      model: "DS-7208HQHI-K1",
      firmware: "V3.4.88 build 180120",
      filesystem: "Hikvision HikFS v2 (custom ext4 inode headers)",
      sourceMd5: "b410984a1e94827fb3362a45fb8912cd",
      sourceSha256: "01ab764fe3109a8274d8123c591a48e71b260934f81a74e5109b82371904a629",
      streamsExtracted: 62,
      carvedClips: 8,
      timelineGaps: 1,
      streams: [
        { id: "HK-0101", channel: "CH 01", start: "2026-09-17 14:00:00 UTC", end: "2026-09-17 15:00:00 UTC", duration: "01:00:00", resolution: "1920x1080", codec: "H.264", container: ".mp4/.hik -> .mp4", status: "Active (Allocated)", confidence: "100%", md5: "89a1c84f1092eb34918e76a02143bc89", sha256: "74a98124eb6109a341b802e9714ab610934e89218471e9a341b802e9714ab610", ai: "Person (97%), Vehicle (95%)" },
        { id: "HK-0102-CRV", channel: "CH 01", start: "2026-09-17 15:10:00 UTC", end: "2026-09-17 15:24:19 UTC", duration: "00:14:19", resolution: "1920x1080", codec: "H.264", container: "Carved .hik -> .mp4", status: "Carved (Slack Space)", confidence: "96.4%", md5: "542a19b889cdfe0132a67bc454a81ef0", sha256: "338fa912cb10495817aef9823467b091e4a5d8927163f4ab82716cd54199042b", ai: "Person (92%)" }
      ]
    },

    cpplus: {
      caseId: "CASE-2026-CP-3901",
      filename: "cpplus_uvr0801e1_forensic_clone.raw",
      size: "2.0 TB (1,863.02 GiB)",
      vendor: "CP Plus",
      model: "CP-UVR-0801E1-CS",
      firmware: "V3.218.0000001.0.R.2019",
      filesystem: "CP Plus DHFS Variant (ext3 journal)",
      sourceMd5: "c0184fa981e749210984ba1029348feb",
      sourceSha256: "88914ab0128e4719b02341a98716cb541a783b65287f34a10e74b967198d0234",
      streamsExtracted: 78,
      carvedClips: 14,
      timelineGaps: 3,
      streams: [
        { id: "CP-0301", channel: "CH 03", start: "2026-09-16 11:00:00 UTC", end: "2026-09-16 12:00:00 UTC", duration: "01:00:00", resolution: "1920x1080", codec: "H.264", container: ".dav -> .mp4 (Lossless)", status: "Active (Allocated)", confidence: "100%", md5: "1109a8714eb6109a341b802e9714ab61", sha256: "6610934e89218471e9a341b802e9714ab610934e89218471e9a341b802e9714a", ai: "Person (89%)" },
        { id: "CP-0302-CRV", channel: "CH 03", start: "2026-09-16 12:05:00 UTC", end: "2026-09-16 12:18:40 UTC", duration: "00:13:40", resolution: "1920x1080", codec: "H.264", container: "Carved .dav -> .mp4", status: "Carved (Deleted Space)", confidence: "93.1%", md5: "aa410984a1e94827fb3362a45fb8912c", sha256: "2201ab764fe3109a8274d8123c591a48e71b260934f81a74e5109b82371904a6", ai: "Person (95%), Vehicle (90%)" }
      ]
    }
  },

  defaultCarvedFragments: [
    {
      id: "FRAG-CRV-01",
      title: "Recovered Deleted Fragment #1",
      channel: "CH 01",
      startTime: 1.0,
      endTime: 5.0,
      duration: "00:00:04",
      durationSec: 4.0,
      offset: "0x004F8200 - 0x0061B400",
      confidence: "98.4% (IDR 0x67 Valid)",
      codec: "H.264 / AVC",
      resolution: "1920x1080",
      start: "2026-09-18 10:15:00 UTC",
      rawPts: "2026-09-18 10:11:46.000 (Drift: +03m 14s)",
      normalizedUtc: "2026-09-18 10:15:00.000 UTC [NTP Synced]",
      sha256: "f489b0134cd98162541a783b65287f34a10e74b967198d0234ac871b65e90341",
      md5: "90cdfe71a2389145fa81a2938475cb01",
      source: "assets/cctv-evidence-ch01.mp4"
    },
    {
      id: "FRAG-CRV-02",
      title: "Purged Slack Space Fragment #2",
      channel: "CH 01",
      startTime: 2.0,
      endTime: 5.5,
      duration: "00:00:03.5",
      durationSec: 3.5,
      offset: "0x00B17000 - 0x00C49800",
      confidence: "96.2% (P-Frame Intact)",
      codec: "H.264 / AVC",
      resolution: "1920x1080",
      start: "2026-09-18 10:22:14 UTC",
      rawPts: "2026-09-18 10:18:59.000 (Drift: +03m 15s)",
      normalizedUtc: "2026-09-18 10:22:14.000 UTC [NTP Synced]",
      sha256: "712e9874cb321098fa871b4a652390a18471e9a341b802e9714ab610934e8921",
      md5: "4471a980bc234f918e76231a4789fa12",
      source: "assets/cctv-evidence-ch01.mp4"
    },
    {
      id: "FRAG-CRV-03",
      title: "Orphaned Keyframe Fragment #3",
      channel: "CH 02",
      startTime: 0.5,
      endTime: 4.2,
      duration: "00:00:03.7",
      durationSec: 3.7,
      offset: "0x0182C400 - 0x0195E000",
      confidence: "94.8% (Repackaged MP4)",
      codec: "H.264 / AVC",
      resolution: "1920x1080",
      start: "2026-09-18 10:35:40 UTC",
      rawPts: "2026-09-18 10:32:26.000 (Drift: +03m 14s)",
      normalizedUtc: "2026-09-18 10:35:40.000 UTC [NTP Synced]",
      sha256: "338fa912cb10495817aef9823467b091e4a5d8927163f4ab82716cd54199042b",
      md5: "542a19b889cdfe0132a67bc454a81ef0",
      source: "assets/cctv-evidence-ch01.mp4"
    },
    {
      id: "FRAG-CRV-04",
      title: "Inter-Cluster Keyframe Slice #4",
      channel: "CH 02",
      startTime: 3.0,
      endTime: 7.0,
      duration: "00:00:04",
      durationSec: 4.0,
      offset: "0x02194000 - 0x022F8800",
      confidence: "97.1% (Lossless NAL Copy)",
      codec: "H.264 / AVC",
      resolution: "1920x1080",
      start: "2026-09-18 10:44:18 UTC",
      rawPts: "2026-09-18 10:41:02.000 (Drift: +03m 16s)",
      normalizedUtc: "2026-09-18 10:44:18.000 UTC [NTP Synced]",
      sha256: "591a48e71b260934f81a74e5109b82371904a62901ab764fe3109a8274d8123c",
      md5: "827fb3362a45fb8912cdb410984a1e94",
      source: "assets/cctv-evidence-ch01.mp4"
    },
    {
      id: "FRAG-CRV-05",
      title: "Zeroed Block Boundary Fragment #5",
      channel: "CH 03",
      startTime: 1.5,
      endTime: 6.0,
      duration: "00:00:04.5",
      durationSec: 4.5,
      offset: "0x03810000 - 0x039AC400",
      confidence: "95.3% (SPS/PPS Restored)",
      codec: "H.264 / AVC",
      resolution: "1920x1080",
      start: "2026-09-18 10:55:35 UTC",
      rawPts: "2026-09-18 10:52:19.000 (Drift: +03m 16s)",
      normalizedUtc: "2026-09-18 10:55:35.000 UTC [NTP Synced]",
      sha256: "8e76231a4789fa12712e9874cb321098fa871b4a652390a18471e9a341b802e9",
      md5: "bc234f918e76231a4789fa124471a980",
      source: "assets/cctv-evidence-ch01.mp4"
    }
  ],
  carvedFragments: null,

  init() {
    this.carvedFragments = JSON.parse(JSON.stringify(this.defaultCarvedFragments));
    this.bindEvents();
    this.initCanvasEngine();
    this.initAiStudio();
    this.initChatbot();
    this.initReportCenter();
    // Default load Dahua preset for immediate inspection
    this.loadPreset('dahua');
  },

  initCanvasEngine() {
    const canvas = document.getElementById('player-live-canvas');
    if (!canvas) return;

    // Load base surveillance CCTV background
    this.playback.cctvImage = new Image();
    this.playback.cctvImage.src = 'assets/cctv-bg.jpg';
    this.playback.cctvImage.onload = () => {
      this.playback.imageLoaded = true;
    };

    // Start 60fps rendering loop
    const renderLoop = () => {
      this.renderCanvasFrame();
      this.playback.animFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
  },

  renderCanvasFrame() {
    const canvas = document.getElementById('player-live-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 1. Clear Frame
    ctx.fillStyle = '#05080E';
    ctx.fillRect(0, 0, w, h);

    // 2. Draw CCTV Background with channel-specific optical filters
    if (this.playback.imageLoaded && this.playback.cctvImage) {
      ctx.save();
      if (this.playback.channel === 4) {
        // CAM-04: High-security night vision monochrome infrared
        ctx.filter = 'grayscale(100%) brightness(1.2) contrast(125%)';
      } else if (this.playback.channel === 2) {
        // CAM-02: Indoor warm lighting
        ctx.filter = 'contrast(105%) brightness(0.95) sepia(15%)';
      } else if (this.playback.channel === 3) {
        // CAM-03: Parking facility cool tint
        ctx.filter = 'contrast(115%) brightness(0.85) hue-rotate(180deg)';
      } else {
        // CAM-01: Gate daylight neutral
        ctx.filter = 'contrast(110%) brightness(0.9)';
      }
      ctx.drawImage(this.playback.cctvImage, 0, 0, w, h);
      ctx.restore();
    }

    // 3. Subtle Surveillance CRT Scanlines & Optical Vignette
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, w, h);

    // Scanlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    // 4. Update Simulation Positions (if playing)
    if (this.playback.isPlaying) {
      this.playback.frameCounter += (1 * this.playback.speed);
      this.playback.baseTime += (40 * this.playback.speed); // 40ms per frame = 25 fps

      this.playback.targets.forEach(t => {
        t.x += t.vx * this.playback.speed;
        // Loop when boundary exceeded
        if (t.vx > 0 && t.x > w + 40) {
          t.x = -t.w - 20;
        } else if (t.vx < 0 && t.x < -t.w - 40) {
          t.x = w + 20;
        }
      });
    }

    // 5. Draw Dynamic AI Tracking Bounding Boxes
    if (this.playback.showAi) {
      this.playback.targets.forEach(t => {
        // Draw primary box
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(t.x, t.y, t.w, t.h);

        // Corner brackets for military/forensic reticle style
        const bLen = 8;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(t.x, t.y + bLen); ctx.lineTo(t.x, t.y); ctx.lineTo(t.x + bLen, t.y);
        // Top-right
        ctx.moveTo(t.x + t.w - bLen, t.y); ctx.lineTo(t.x + t.w, t.y); ctx.lineTo(t.x + t.w, t.y + bLen);
        // Bottom-left
        ctx.moveTo(t.x, t.y + t.h - bLen); ctx.lineTo(t.x, t.y + t.h); ctx.lineTo(t.x + bLen, t.y + t.h);
        // Bottom-right
        ctx.moveTo(t.x + t.w - bLen, t.y + t.h); ctx.lineTo(t.x + t.w, t.y + t.h); ctx.lineTo(t.x + t.w, t.y + t.h - bLen);
        ctx.stroke();

        // Label background tag
        ctx.fillStyle = 'rgba(7, 10, 15, 0.85)';
        ctx.fillRect(t.x, t.y - 18, ctx.measureText(t.label).width + 12, 16);

        // Label text
        ctx.fillStyle = t.color;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(t.label, t.x + 4, t.y - 6);

        // Secondary sub-feature (e.g. License plate on vehicle)
        if (t.plate) {
          const px = t.x + t.w * 0.35;
          const py = t.y + t.h * 0.65;
          ctx.strokeStyle = '#FBBF24';
          ctx.strokeRect(px, py, 45, 18);
          ctx.fillStyle = 'rgba(7, 10, 15, 0.85)';
          ctx.fillRect(px, py + 20, 95, 13);
          ctx.fillStyle = '#FBBF24';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillText(t.plate, px + 2, py + 30);
        }
      });
    }

    // 6. Update HTML OSD Elements with live millisecond timing
    const dateObj = new Date(this.playback.baseTime);
    const timeStr = dateObj.toISOString().replace('T', ' ').replace('Z', ' UTC');
    const osdTimeEl = document.getElementById('player-osd-time');
    if (osdTimeEl) osdTimeEl.innerText = timeStr;
    const osdTimeNorm = document.getElementById('player-osd-time-norm');
    if (osdTimeNorm) osdTimeNorm.innerText = timeStr;

    // Raw PTS (with 4min 12sec drift from camera RTC)
    const rawPtsObj = new Date(this.playback.baseTime - 252000);
    const rawPtsStr = rawPtsObj.toISOString().replace('T', ' ').replace('Z', '') + ' (Drift: +04m 12s)';
    const playerRawPts = document.getElementById('player-raw-pts');
    if (playerRawPts) playerRawPts.innerText = rawPtsStr;

    // AI studio synchronized timestamps
    const aiRawPts = document.getElementById('ai-raw-pts');
    if (aiRawPts) aiRawPts.innerText = rawPtsStr;
    const aiNormUtc = document.getElementById('ai-norm-utc');
    if (aiNormUtc) aiNormUtc.innerText = timeStr;

    const channelNames = {
      1: 'CAM 01 [GATE] | 1920x1080 | 25.0 FPS | H.264',
      2: 'CAM 02 [LOBBY] | 1920x1080 | 25.0 FPS | H.264',
      3: 'CAM 03 [PARKING] | 2560x1440 | 30.0 FPS | H.265',
      4: 'CAM 04 [VAULT/IR] | 1920x1080 | 20.0 FPS | H.264'
    };
    const osdCamEl = document.getElementById('player-osd-cam');
    if (osdCamEl) {
      osdCamEl.innerText = channelNames[this.playback.channel] || channelNames[1];
    }

    const activeMeta = document.getElementById('player-active-meta');
    if (activeMeta) {
      const isIFrame = Math.floor(this.playback.frameCounter) % 25 === 0;
      activeMeta.innerText = `STREAM DE-MUXED (25 FPS | FRAME #${Math.floor(this.playback.frameCounter)} ${isIFrame ? '[IDR KEYFRAME]' : '[P-FRAME]'})`;
    }
  },

  bindEvents() {
    // Preset Loaders
    const presetButtons = document.querySelectorAll('[data-preset]');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetKey = e.currentTarget.getAttribute('data-preset');
        this.runSimulation(presetKey);
      });
    });

    // Custom File Drop / Select
    const dropZone = document.getElementById('demo-upload-zone');
    const fileInput = document.getElementById('demo-file-input');

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
          this.handleCustomFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleCustomFile(e.target.files[0]);
        }
      });
    }

    // Playback Controls
    const playPauseBtn = document.getElementById('btn-play-pause');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        this.playback.isPlaying = !this.playback.isPlaying;
        playPauseBtn.innerText = this.playback.isPlaying ? '⏸ PAUSE' : '▶ PLAY';
        playPauseBtn.classList.toggle('active', this.playback.isPlaying);

        const realVideo = document.getElementById('player-real-video');
        if (realVideo && realVideo.style.display !== 'none') {
          if (this.playback.isPlaying) realVideo.play();
          else realVideo.pause();
        }
      });
    }

    // Step Forward 1 Frame (40ms)
    const stepNextBtn = document.getElementById('btn-step-next');
    if (stepNextBtn) {
      stepNextBtn.addEventListener('click', () => {
        this.playback.isPlaying = false;
        if (playPauseBtn) {
          playPauseBtn.innerText = '▶ PLAY';
          playPauseBtn.classList.remove('active');
        }
        this.playback.baseTime += 40;
        this.playback.frameCounter += 1;
        this.playback.targets.forEach(t => t.x += t.vx);
      });
    }

    // Step Back 1 Frame (40ms)
    const stepPrevBtn = document.getElementById('btn-step-prev');
    if (stepPrevBtn) {
      stepPrevBtn.addEventListener('click', () => {
        this.playback.isPlaying = false;
        if (playPauseBtn) {
          playPauseBtn.innerText = '▶ PLAY';
          playPauseBtn.classList.remove('active');
        }
        this.playback.baseTime -= 40;
        this.playback.frameCounter -= 1;
        this.playback.targets.forEach(t => t.x -= t.vx);
      });
    }

    // Speed Chips (1x, 2x, 4x)
    const speedChips = document.querySelectorAll('[data-speed]');
    speedChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        speedChips.forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.playback.speed = parseFloat(e.currentTarget.dataset.speed) || 1;
      });
    });

    // AI Bounding Box Toggle
    const toggleAiBtn = document.getElementById('btn-toggle-ai');
    if (toggleAiBtn) {
      toggleAiBtn.addEventListener('click', () => {
        this.playback.showAi = !this.playback.showAi;
        toggleAiBtn.innerText = this.playback.showAi ? 'AI BOXES: ON' : 'AI BOXES: OFF';
        toggleAiBtn.classList.toggle('active', this.playback.showAi);
        const aiTag = document.getElementById('player-ai-tag');
        if (aiTag) aiTag.style.display = this.playback.showAi ? 'block' : 'none';
      });
    }

    // Camera Channel Switcher
    const camButtons = document.querySelectorAll('.cam-btn');
    camButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        camButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const ch = parseInt(e.currentTarget.dataset.channel, 10) || 1;
        this.playback.channel = ch;

        // Reset positions for distinct channel choreography
        if (ch === 1) {
          this.playback.targets = [
            { type: 'vehicle', label: 'VEHICLE ID#82 [94.1%]', plate: 'PLATE [7XYZ89]', x: 60, y: 195, w: 140, h: 75, vx: 1.8, color: '#34D399' },
            { type: 'person', label: 'PERSON ID#104 [96.4%]', x: 440, y: 140, w: 42, h: 90, vx: -0.9, color: '#FFFFFF' }
          ];
        } else if (ch === 2) {
          this.playback.targets = [
            { type: 'person', label: 'OFFICER ID#12 [98.1%]', x: 120, y: 130, w: 45, h: 95, vx: 1.2, color: '#FFFFFF' },
            { type: 'person2', label: 'VISITOR ID#41 [91.3%]', x: 380, y: 135, w: 40, h: 88, vx: -0.7, color: '#CBD5E1' }
          ];
        } else if (ch === 3) {
          this.playback.targets = [
            { type: 'vehicle', label: 'SUV ID#55 [97.0%]', plate: 'PLATE [4ABC21]', x: 180, y: 180, w: 150, h: 80, vx: 1.1, color: '#34D399' }
          ];
        } else if (ch === 4) {
          this.playback.targets = [
            { type: 'person', label: 'GUARD ID#03 [95.5%]', x: 300, y: 140, w: 44, h: 92, vx: 0.5, color: '#34D399' }
          ];
        }
      });
    });

    // Deep Cluster Carving Live Scanner
    const carveBtn = document.getElementById('btn-run-deep-carve');
    if (carveBtn) {
      carveBtn.addEventListener('click', () => this.runDeepCarveStream());
    }

    // Carved Recovery Modal Close Listeners
    const modalCloseTop = document.getElementById('carved-modal-close-top');
    const modalCloseBtn = document.getElementById('carved-modal-close-btn');
    const carvedModal = document.getElementById('carved-recovery-modal');

    if (modalCloseTop) modalCloseTop.addEventListener('click', () => this.closeCarvedRecoveryModal());
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => this.closeCarvedRecoveryModal());
    if (carvedModal) {
      carvedModal.addEventListener('click', (e) => {
        if (e.target === carvedModal) this.closeCarvedRecoveryModal();
      });
    }

    // CSV Manifest Export
    const exportCsvBtn = document.getElementById('btn-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.exportHashManifestCSV());
    }

    // Chain of Custody Report Export
    const exportReportBtn = document.getElementById('btn-export-report');
    if (exportReportBtn) {
      exportReportBtn.addEventListener('click', () => this.exportCaseReport());
    }

    // Extract All Carved Clips
    const extractAllBtn = document.getElementById('btn-extract-all-carved');
    if (extractAllBtn) {
      extractAllBtn.addEventListener('click', () => {
        const frags = this.carvedFragments || this.defaultCarvedFragments;
        if (frags && frags.length > 0) {
          this.openCarvedRecoveryModal(frags[0]);
        }
      });
    }

    // Workstation Mode Tabs (Analysis vs Imaging)
    const tabBtnAnalysis = document.getElementById('tab-btn-analysis');
    const tabBtnImaging = document.getElementById('tab-btn-imaging');
    const chipSwitchImaging = document.getElementById('chip-switch-imaging');

    if (tabBtnAnalysis) tabBtnAnalysis.addEventListener('click', () => this.switchDemoTab('analysis'));
    if (tabBtnImaging) tabBtnImaging.addEventListener('click', () => this.switchDemoTab('imaging'));
    if (chipSwitchImaging) chipSwitchImaging.addEventListener('click', () => this.switchDemoTab('imaging'));

    // Forensic Image Format Chips (.dd, .e01, .raw, .aff4)
    const formatChips = document.querySelectorAll('#imaging-format-chips .imaging-chip-btn');
    formatChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        formatChips.forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.imagingState.format = e.currentTarget.dataset.format || 'dd';
        this.updateImagingDestination();
      });
    });

    // Source Storage Device Change
    const sourceSelect = document.getElementById('imaging-source-device');
    if (sourceSelect) {
      sourceSelect.addEventListener('change', () => {
        this.imagingState.sourceDevice = sourceSelect.value;
        this.updateImagingDestination();
      });
    }

    // Case Reference ID Input
    const caseRefInput = document.getElementById('imaging-case-ref');
    if (caseRefInput) {
      caseRefInput.addEventListener('input', () => this.updateImagingDestination());
    }

    // Start Bitstream Acquisition Button
    const startImagingBtn = document.getElementById('btn-start-imaging');
    if (startImagingBtn) {
      startImagingBtn.addEventListener('click', () => this.startForensicAcquisition());
    }

    // Mount In Analysis Button
    const mountInAnalysisBtn = document.getElementById('btn-mount-in-analysis');
    if (mountInAnalysisBtn) {
      mountInAnalysisBtn.addEventListener('click', () => {
        this.switchDemoTab('analysis');
        if (this.imagingState.lastCreatedCase) {
          this.runSimulationWithCase(this.imagingState.lastCreatedCase);
        } else {
          this.runSimulation('dahua');
        }
      });
    }
  },

  runDeepCarveStream() {
    const carveBtn = document.getElementById('btn-run-deep-carve');
    const hexBox = document.getElementById('hex-stream-box');
    if (!hexBox) return;

    if (carveBtn) {
      carveBtn.disabled = true;
      carveBtn.innerText = 'Scanning Unallocated Clusters...';
    }

    hexBox.innerHTML = '';
    const hexChars = '0123456789ABCDEF';
    let lineCount = 0;
    const maxLines = 18;

    const interval = setInterval(() => {
      lineCount++;
      const offset = (0x004F8000 + lineCount * 0x200).toString(16).toUpperCase().padStart(8, '0');
      let bytes = '';
      for (let i = 0; i < 16; i++) {
        bytes += hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)] + ' ';
      }

      const row = document.createElement('div');
      row.style.fontFamily = 'var(--font-mono)';
      row.style.fontSize = '0.70rem';

      if (lineCount === 8) {
        row.innerHTML = `<span style="color: #34D399; font-weight: 600;">0x${offset}: 00 00 00 01 67 42 00 1E  [+] H.264 SPS/PPS NAL HEADER FOUND</span>`;
      } else if (lineCount === 14) {
        row.innerHTML = `<span style="color: #34D399; font-weight: 600;">0x${offset}: 00 00 00 01 65 88 84 00  [+] IDR KEYFRAME RECONSTRUCTED (1920x1080)</span>`;
      } else {
        row.innerHTML = `<span style="color: var(--text-dim);">0x${offset}:</span> <span style="color: var(--text-muted);">${bytes}</span>`;
      }

      hexBox.appendChild(row);
      hexBox.scrollTop = hexBox.scrollHeight;

      if (lineCount >= maxLines) {
        clearInterval(interval);
        if (carveBtn) {
          carveBtn.disabled = false;
          carveBtn.innerText = '✔ Deep Carve Complete (1 Clip Recovered)';
        }

        // Add carved clip to active evidence table
        if (this.activeCase) {
          const newCarvedClip = {
            id: `EV-CRV-${Date.now().toString().slice(-4)}`,
            channel: `CH 0${this.playback.channel}`,
            title: `Recovered Carved Stream (Cluster 0x004F8200)`,
            start: "2026-09-18 10:30:00 UTC",
            end: "2026-09-18 10:42:15 UTC",
            duration: "00:00:04",
            durationSec: 4.0,
            startTime: 1.5,
            endTime: 5.5,
            resolution: "1920x1080",
            codec: "H.264 / AVC",
            container: ".dav -> .mp4 (Carved)",
            status: "Carved (Slack Space)",
            confidence: "98.8%",
            offset: "0x004F8200 - 0x008D1900",
            md5: "7f4c26a9e851d42398b1a7c5031b2890",
            sha256: "9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a",
            ai: "Person Detected (95%)",
            source: this.customVideoUrl || "assets/cctv-evidence-ch01.mp4"
          };
          this.activeCase.streams.unshift(newCarvedClip);
          this.activeCase.carvedClips += 1;
          this.setText('metric-carved', `${this.activeCase.carvedClips} files`);
          this.renderEvidenceList(this.activeCase);

          if (!this.carvedFragments) {
            this.carvedFragments = JSON.parse(JSON.stringify(this.defaultCarvedFragments));
          }
          this.carvedFragments.unshift(newCarvedClip);
          this.renderCarvedGallery();

          // Add interactive play button right inside terminal
          const actionRow = document.createElement('div');
          actionRow.style.marginTop = '8px';
          actionRow.innerHTML = `<button class="btn btn-warning btn-sm" id="btn-inspect-instant" style="padding: 4px 14px; font-size: 11px;">▶ Play Recovered Carved Clip in Viewer</button>`;
          hexBox.appendChild(actionRow);
          hexBox.scrollTop = hexBox.scrollHeight;
          const inspectBtn = document.getElementById('btn-inspect-instant');
          if (inspectBtn) {
            inspectBtn.onclick = () => this.openCarvedRecoveryModal(newCarvedClip);
          }
        }
      }
    }, 120);
  },


  handleCustomFile(file) {
    const filename = file.name;
    const lowerName = filename.toLowerCase();
    
    let presetKey = 'dahua';
    if (lowerName.includes('hik') || lowerName.includes('mp4') || lowerName.includes('webm')) {
      presetKey = 'hikvision';
    } else if (lowerName.includes('cp') || lowerName.includes('plus')) {
      presetKey = 'cpplus';
    }

    const customCase = JSON.parse(JSON.stringify(this.presets[presetKey]));
    customCase.filename = filename;
    customCase.size = file.size > 1024 * 1024 * 1024 
      ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    customCase.caseId = `CASE-LE-${Date.now().toString().slice(-6)}`;
    
    // If it is a real playable video, mount directly into the forensic player
    if (file.type.startsWith('video/') || lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.mov')) {
      const videoEl = document.getElementById('player-real-video');
      const canvasEl = document.getElementById('player-live-canvas');
      try {
        this.customVideoUrl = URL.createObjectURL(file);
        this.customVideoFile = file;
        if (videoEl) {
          videoEl.src = this.customVideoUrl;
          videoEl.style.display = 'block';
          if (canvasEl) canvasEl.style.display = 'none';
          videoEl.ontimeupdate = () => {
            const currentSec = videoEl.currentTime || 0;
            const baseMs = Date.parse("2026-09-19T14:55:00.000Z") + Math.round(currentSec * 1000);
            const dateObj = new Date(baseMs);
            const timeStr = dateObj.toISOString().replace('T', ' ').replace('Z', ' UTC');
            const osdTimeEl = document.getElementById('player-osd-time');
            if (osdTimeEl) osdTimeEl.innerText = timeStr;
            const osdTimeNorm = document.getElementById('player-osd-time-norm');
            if (osdTimeNorm) osdTimeNorm.innerText = timeStr;

            const rawPtsObj = new Date(baseMs - 252000);
            const rawPtsStr = rawPtsObj.toISOString().replace('T', ' ').replace('Z', '') + ' (Drift: +04m 12s)';
            const playerRawPts = document.getElementById('player-raw-pts');
            if (playerRawPts) playerRawPts.innerText = rawPtsStr;

            const aiRawPts = document.getElementById('ai-raw-pts');
            if (aiRawPts) aiRawPts.innerText = rawPtsStr;
            const aiNormUtc = document.getElementById('ai-norm-utc');
            if (aiNormUtc) aiNormUtc.innerText = timeStr;
          };
          videoEl.play().catch(() => {});
        }

        // Create temporary inspector video to calculate real subclips from user's video
        const tempVid = document.createElement('video');
        tempVid.preload = 'metadata';
        tempVid.src = this.customVideoUrl;
        tempVid.onloadedmetadata = () => {
          const dur = tempVid.duration && !isNaN(tempVid.duration) ? tempVid.duration : 10;
          const vidW = tempVid.videoWidth || 1920;
          const vidH = tempVid.videoHeight || 1080;

          // Divide uploaded video into 5 distinct sectioned forensic fragments
          const numSlices = 5;
          const sliceLen = dur / numSlices;
          const slices = [];
          for (let i = 0; i < numSlices; i++) {
            const s = parseFloat((i * sliceLen).toFixed(1));
            const e = parseFloat((Math.min(dur - 0.05, (i + 1) * sliceLen)).toFixed(1));
            const diff = parseFloat((e - s).toFixed(1));
            const baseMin = 50 + i * 2;
            const normMin = 54 + i * 2;
            slices.push({
              id: `UP-CRV-0${i + 1}`,
              title: `Carved Sectioned Slice #${i + 1} (${filename})`,
              channel: i % 2 === 0 ? "CH 01" : "CH 02",
              startTime: s,
              endTime: e,
              duration: `00:00:0${diff}`,
              durationSec: diff,
              offset: `0x00${(0x4F8200 + i * 0x2E0000).toString(16).toUpperCase()} - 0x00${(0x61B400 + i * 0x2E0000).toString(16).toUpperCase()}`,
              confidence: `${(99.4 - i * 0.7).toFixed(1)}% (NAL Keyframe Valid)`,
              codec: "H.264 / ISO MP4",
              resolution: `${vidW}x${vidH}`,
              start: `2026-09-19 14:${(normMin % 60).toString().padStart(2, '0')}:00 UTC`,
              rawPts: `2026-09-19 14:${(baseMin % 60).toString().padStart(2, '0')}:48.000 (Drift: +04m 12s)`,
              normalizedUtc: `2026-09-19 14:${(normMin % 60).toString().padStart(2, '0')}:00.000 UTC [NTP CALIBRATED]`,
              sha256: `88914ab0128e4719b02341a98716cb541a783b65287f34a10e74b967198d02${i + 1}f`,
              md5: `c0184fa981e749210984ba1029348f${i + 1}c`,
              source: this.customVideoUrl
            });
          }

          this.carvedFragments = slices;

          // Prepend first recovered fragment to evidence stream table
          if (slices[0]) {
            customCase.streams.unshift({
              id: slices[0].id,
              channel: slices[0].channel,
              start: slices[0].normalizedUtc,
              end: `2026-09-19 14:58:00 UTC`,
              duration: `00:00:0${slices[0].durationSec}`,
              resolution: `${vidW}x${vidH}`,
              codec: "H.264 / AVC",
              container: ".mp4 (Carved Sub-Clip)",
              status: "Carved (Recovered Slice)",
              confidence: slices[0].confidence,
              md5: slices[0].md5,
              sha256: slices[0].sha256,
              ai: "Motion & Target Detected (98%)",
              startTime: slices[0].startTime,
              endTime: slices[0].endTime,
              durationSec: slices[0].durationSec,
              offset: slices[0].offset,
              rawPts: slices[0].rawPts,
              normalizedUtc: slices[0].normalizedUtc,
              source: this.customVideoUrl
            });
          }

          const srcLabel = document.getElementById('carved-source-label');
          if (srcLabel) srcLabel.innerText = `SOURCE: Uploaded Video (${filename} | ${vidW}x${vidH} | ${dur.toFixed(1)}s | 5 Slices)`;

          this.renderCarvedGallery();
        };
      } catch (err) {
        console.warn('Video preview error:', err);
      }
    }

    this.runSimulationWithCase(customCase);
  },

  loadPreset(presetKey) {
    this.customVideoUrl = null;
    this.customVideoFile = null;
    this.carvedFragments = JSON.parse(JSON.stringify(this.defaultCarvedFragments));
    const srcLabel = document.getElementById('carved-source-label');
    if (srcLabel) srcLabel.innerText = `SOURCE: Lab Surveillance Disk (${presetKey.toUpperCase()} Raw)`;

    const videoEl = document.getElementById('player-real-video');
    const canvasEl = document.getElementById('player-live-canvas');
    if (videoEl) {
      videoEl.pause();
      videoEl.style.display = 'none';
      videoEl.src = '';
    }
    if (canvasEl) {
      canvasEl.style.display = 'block';
    }

    const caseData = this.presets[presetKey];
    if (!caseData) return;
    this.activeCase = caseData;
    this.renderResults(caseData);
  },

  runSimulation(presetKey) {
    const caseData = this.presets[presetKey];
    if (!caseData) return;
    this.runSimulationWithCase(caseData);
  },

  runSimulationWithCase(caseData) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.activeCase = caseData;

    const progressTrack = document.getElementById('demo-progress-fill');
    const progressText = document.getElementById('demo-progress-status');
    const logWindow = document.getElementById('demo-console-log');
    const resultsContainer = document.getElementById('demo-results-view');

    if (resultsContainer) resultsContainer.style.opacity = '0.35';

    const logMessages = [
      `[INGEST] Physical image opened read-only: ${caseData.filename} (${caseData.size})`,
      `[HASHING] Concurrently computing MD5 (RFC 1321) and SHA-256 (FIPS 180-4)...`,
      `[HARDWARE] OEM Signature Matched: ${caseData.vendor} (${caseData.model})`,
      `[FILESYSTEM] Parsing circular layout: ${caseData.filesystem}`,
      `[REPACKAGING] Lossless H.264/H.265 elementary stream repackaging (-c copy) to MP4...`,
      `[CARVING] Analyzing unallocated space for orphaned IDR keyframe headers...`,
      `[TIMELINE] Synchronizing multi-channel timestamps to UTC standard. Gaps flagged: ${caseData.timelineGaps}`,
      `[READY] Forensic acquisition complete. Evidence ready for inspection & court export.`
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const pct = Math.min(100, Math.round((step / logMessages.length) * 100));

      if (progressTrack) progressTrack.style.width = `${pct}%`;
      if (progressText) progressText.innerText = `Forensic Extraction in Progress — ${pct}%`;

      if (logWindow && logMessages[step - 1]) {
        const logLine = document.createElement('div');
        logLine.innerText = `[${new Date().toISOString().substring(11, 19)}] ${logMessages[step - 1]}`;
        logWindow.appendChild(logLine);
        logWindow.scrollTop = logWindow.scrollHeight;
      }

      if (step >= logMessages.length) {
        clearInterval(interval);
        this.isProcessing = false;
        if (progressText) progressText.innerText = 'Analysis Complete — Evidence Verified (Court Admissible)';
        if (resultsContainer) resultsContainer.style.opacity = '1';
        this.renderResults(caseData);
      }
    }, 280);
  },

  renderResults(caseData) {
    this.setText('metric-case-id', caseData.caseId);
    this.setText('metric-vendor', caseData.vendor);
    this.setText('metric-filesystem', caseData.filesystem);
    this.setText('metric-streams', `${caseData.streamsExtracted} files`);
    this.setText('metric-carved', `${caseData.carvedClips} files`);
    this.setText('metric-gaps', `${caseData.timelineGaps} detected`);
    this.setText('metric-md5', caseData.sourceMd5);
    this.setText('metric-sha256', caseData.sourceSha256);

    this.renderEvidenceList(caseData);
    this.renderTimeline(caseData);
    this.renderCarvedGallery();

    if (caseData.streams.length > 0) {
      this.previewStream(caseData.streams[0].id);
    }
  },

  renderEvidenceList(caseData) {
    const streamContainer = document.getElementById('extracted-files-body');
    if (!streamContainer) return;
    streamContainer.innerHTML = '';

    caseData.streams.forEach(s => {
      const item = document.createElement('div');
      item.className = 'evidence-fluid-item';
      item.dataset.streamId = s.id;

      const isCarved = s.id.includes('CRV');
      const isGap = s.id.includes('GAP');
      
      let statusBadge = '<span class="badge badge-verified">Allocated</span>';
      let actionBtn = '<button class="btn btn-outline btn-sm" style="padding: 2px 10px; font-size: 11px;">Load Stream</button>';
      if (isCarved) {
        statusBadge = `<span class="badge badge-warning">Carved (${s.confidence})</span>`;
        actionBtn = `<button class="btn btn-warning btn-sm" style="padding: 2px 10px; font-size: 11px; background: rgba(251, 191, 36, 0.15); border-color: #FBBF24; color: #FBBF24;">▶ Play Recovered</button>`;
      } else if (isGap) {
        statusBadge = '<span class="badge badge-flagged">Tamper Gap</span>';
        actionBtn = '<button class="btn btn-outline btn-sm" style="padding: 2px 10px; font-size: 11px; color: #F87171;">Inspect Gap</button>';
      }

      item.innerHTML = `
        <span style="font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600; color: var(--text-primary);">${s.id}</span>
        <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted);">${s.channel}</span>
        <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted);">${s.start}</span>
        <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted);">${s.duration}</span>
        <span style="font-size: var(--text-xs); color: var(--text-secondary);">${s.codec} / ${s.resolution}</span>
        <span>${statusBadge}</span>
        <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-dim);" title="${s.sha256}">${s.sha256.substring(0, 16)}...</span>
        <span style="text-align: right;">${actionBtn}</span>
      `;

      item.addEventListener('click', () => {
        if (isCarved) {
          this.openCarvedRecoveryModal(s);
        } else {
          this.previewStream(s.id);
        }
      });

      streamContainer.appendChild(item);
    });
  },

  renderTimeline(caseData) {
    const timelineContainer = document.getElementById('timeline-tracks');
    if (!timelineContainer) return;
    timelineContainer.innerHTML = '';

    const channels = ['CH 01', 'CH 02', 'CH 03', 'CH 04'];
    channels.forEach((ch, idx) => {
      const row = document.createElement('div');
      row.className = 'timeline-channel-row';

      let segmentsHtml = '';
      if (idx === 0) {
        segmentsHtml = `
          <div class="timeline-segment" data-time="08:00:14" style="left: 0%; width: 45%; background-color: #475569; cursor: pointer;" title="Allocated Recording 08:00 - 09:45 (Click to Seek)"></div>
          <div class="timeline-segment gap" data-time="09:45:10" style="left: 45%; width: 22%; background-color: #991B1B; cursor: pointer;" title="⚠️ TAMPER GAP 09:45 - 10:15 (Click to Trigger Forensic Tamper Alert)"></div>
          <div class="timeline-segment" data-time="10:15:00" style="left: 67%; width: 20%; background-color: #CBD5E1; cursor: pointer;" title="Carved Deleted Footage 10:15 - 10:28 (Click to Seek)"></div>
        `;
      } else if (idx === 1) {
        segmentsHtml = `
          <div class="timeline-segment" data-time="08:00:00" style="left: 0%; width: 55%; background-color: #475569; cursor: pointer;" title="Continuous 08:00 - 09:30"></div>
          <div class="timeline-segment" data-time="09:30:12" style="left: 55%; width: 18%; background-color: #CBD5E1; cursor: pointer;" title="Carved Deleted 09:30 - 09:41"></div>
        `;
      } else {
        segmentsHtml = `
          <div class="timeline-segment" data-time="08:00:00" style="left: 0%; width: 85%; background-color: #475569; cursor: pointer;" title="Continuous Recording"></div>
        `;
      }

      row.innerHTML = `
        <span class="timeline-channel-name">${ch}</span>
        <div class="timeline-bar-track">
          ${segmentsHtml}
        </div>
      `;

      // Add click seeking to timeline segments
      row.querySelectorAll('.timeline-segment').forEach(seg => {
        seg.addEventListener('click', (e) => {
          e.stopPropagation();
          const isGap = seg.classList.contains('gap');
          if (isGap) {
            this.playback.isPlaying = false;
            const playBtn = document.getElementById('btn-play-pause');
            if (playBtn) {
              playBtn.innerText = '▶ PLAY';
              playBtn.classList.remove('active');
            }
            alert("⚠️ [INTEGRITY TAMPER ALERT]\n\nDiscontinuous PTS Timecode detected on CH 01:\nGap Duration: 29 minutes, 50 seconds (09:45:10 to 10:15:00 UTC)\nPhysical Cluster Offset: 0x01B84200 - 0x028A1400\nResult: Sectors zeroed out. Marked as Potential Intentional Evidentiary Deletion.");
          } else {
            const timeVal = seg.getAttribute('data-time') || '08:00:14';
            const osdTimeEl = document.getElementById('player-osd-time');
            if (osdTimeEl) osdTimeEl.innerText = `2026-09-18 ${timeVal}.000 UTC`;
          }
        });
      });

      timelineContainer.appendChild(row);
    });
  },

  previewStream(streamId) {
    if (!this.activeCase) return;
    const stream = this.activeCase.streams.find(s => s.id === streamId) || this.activeCase.streams[0];
    if (!stream) return;

    const osdLeft = document.getElementById('player-osd-cam');
    const osdRight = document.getElementById('player-osd-time');
    const osdHash = document.getElementById('player-osd-hash');
    const aiTag = document.getElementById('player-ai-tag');

    if (osdLeft) osdLeft.innerText = `${stream.channel} | ${stream.resolution} | ${stream.codec}`;
    if (osdRight) osdRight.innerText = stream.start;
    if (osdHash) osdHash.innerText = `SHA-256: ${stream.sha256.substring(0, 24)}...`;

    if (aiTag) {
      if (stream.id.includes('GAP')) {
        aiTag.innerText = '⚠️ ANOMALOUS ZERO CLUSTERS (TAMPER GAP)';
        aiTag.style.borderColor = '#F87171';
        aiTag.style.backgroundColor = 'rgba(153, 27, 27, 0.35)';
      } else {
        aiTag.innerText = `AI DETECTED: ${stream.ai}`;
        aiTag.style.borderColor = '#FFFFFF';
        aiTag.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
      }
    }
  },

  exportHashManifestCSV() {
    if (!this.activeCase) return;
    let csv = 'Artifact_ID,Channel,Timestamp_UTC_Start,Timestamp_UTC_End,Duration,Resolution,Codec,Status,Recovery_Confidence,MD5_Hash,SHA256_Hash\n';
    this.activeCase.streams.forEach(s => {
      csv += `"${s.id}","${s.channel}","${s.start}","${s.end}","${s.duration}","${s.resolution}","${s.codec}","${s.status}","${s.confidence}","${s.md5}","${s.sha256}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.activeCase.caseId}_Hash_Manifest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportCaseReport() {
    if (!this.activeCase) return;
    const c = this.activeCase;
    const reportText = `================================================================================
DIGITAL FORENSICS LAB EVIDENCE & CHAIN OF CUSTODY REPORT
Standardized Multi-Vendor DVR/NVR Analysis Suite (BRUCH.DFA)
================================================================================
Case Reference: ${c.caseId}
Acquisition Source: ${c.filename}
Acquisition Image Size: ${c.size}
Investigative Timestamp: ${new Date().toUTCString()}

[1] CRYPTOGRAPHIC INTEGRITY VERIFICATION (DUAL-HASH)
Source Disk Image MD5:    ${c.sourceMd5}
Source Disk Image SHA256: ${c.sourceSha256}
Integrity Verification:   PASS - ZERO BLOCK DEVIATIONS

[2] HARDWARE & HARD DRIVE IDENTIFICATION
Identified OEM Vendor:    ${c.vendor}
Identified Hardware Model: ${c.model}
Firmware Build Version:   ${c.firmware}
File System Structure:    ${c.filesystem}

[3] SUMMARY OF FORENSIC EXTRACTIONS
Total Extracted Streams:  ${c.streamsExtracted}
Carved Deleted Clips:     ${c.carvedClips} (Keyframe aligned)
Timeline Discontinuities: ${c.timelineGaps} Potential Gaps Flagged

[4] CHAIN OF CUSTODY AUDIT LOG
- Step 1: Write-blocked image acquisition via dcfldd. Dual hash matched source drive.
- Step 2: Inode and circular cluster table analysis completed.
- Step 3: Unallocated space carved using vendor-specific keyframe boundary signatures.
- Step 4: Video streams demuxed and losslessly converted to standard ISO MP4 (-c copy).
- Step 5: All timestamps normalized to Universal Coordinated Time (UTC).

Report Prepared By: BRUCH.DFA Automated Acquisition Engine v2.4.0-LE
Admissible under Federal Rules of Evidence Rule 902(13)/(14)
================================================================================
`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${c.caseId}_Court_Admissible_Report.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  renderCarvedGallery() {
    const grid = document.getElementById('carved-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const frags = this.carvedFragments || this.defaultCarvedFragments;
    const badge = document.getElementById('carved-count-badge');
    if (badge) badge.innerText = `${frags.length} CLIPS EXTRACTED`;

    frags.forEach((frag) => {
      const card = document.createElement('div');
      card.className = 'carved-card';
      card.setAttribute('data-frag-id', frag.id);

      const durationLabel = frag.durationSec ? `${frag.durationSec}s` : (frag.duration || '4.0s');

      card.innerHTML = `
        <div class="carved-thumb-box">
          <canvas id="thumb-canvas-${frag.id}" width="320" height="180"></canvas>
          <span class="carved-thumb-tag">${frag.channel || 'CH 01'} | OFFSET ${frag.offset ? frag.offset.split(' ')[0] : '0x004F'}</span>
          <span class="carved-thumb-duration">${durationLabel} SUB-CLIP</span>
          <div class="carved-thumb-hover-overlay">
            <span class="carved-play-badge">▶ PLAY RECOVERED CLIP</span>
          </div>
        </div>
        <div class="carved-card-body">
          <div class="carved-card-title">
            <span>${frag.title || frag.id}</span>
            <span class="badge badge-warning" style="font-size: 9px;">CARVED</span>
          </div>
          <div class="carved-card-meta">
            <div>Slice Range: <strong style="color: #FBBF24;">${frag.startTime !== undefined ? frag.startTime : 1.0}s - ${frag.endTime !== undefined ? frag.endTime : 5.0}s</strong> (${durationLabel})</div>
            <div>Raw PTS: <span style="color: var(--text-dim);">${frag.rawPts ? frag.rawPts.split(' ')[1] : '10:11:46'}</span></div>
            <div>Norm UTC: <strong style="color: #60A5FA;">${frag.normalizedUtc ? frag.normalizedUtc.split(' ')[1] : '10:15:00'} UTC</strong></div>
            <div>Cluster: <span style="color: var(--text-dim);">${frag.offset || '0x004F8200'}</span></div>
            <div>Integrity: <span style="color: var(--status-verified);">${frag.confidence || '98.4%'}</span></div>
          </div>
        </div>
        <div class="carved-card-actions">
          <button type="button" class="btn btn-warning btn-sm btn-play-carved-card" style="flex: 2; padding: 4px 10px; font-size: 11px; background: rgba(251, 191, 36, 0.15); border-color: #FBBF24; color: #FBBF24;">
            ▶ Play Recovered Clip
          </button>
          <button type="button" class="btn btn-outline btn-sm btn-download-carved-card" style="flex: 1; padding: 4px 8px; font-size: 11px;" title="Download Extracted Sub-clip (.mp4)">
            ⬇ Save MP4
          </button>
        </div>
      `;

      setTimeout(() => {
        this.renderThumbnailCanvas(`thumb-canvas-${frag.id}`, frag);
      }, 50);

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-download-carved-card')) {
          e.stopPropagation();
          this.downloadCarvedFragment(frag);
          return;
        }
        this.openCarvedRecoveryModal(frag);
      });

      grid.appendChild(card);
    });
  },

  renderThumbnailCanvas(canvasId, frag) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#070C14';
    ctx.fillRect(0, 0, w, h);

    if (this.playback.imageLoaded && this.playback.cctvImage) {
      ctx.save();
      ctx.filter = frag.channel === 'CH 02' ? 'contrast(110%) sepia(20%)' : 'contrast(115%) brightness(0.9)';
      ctx.drawImage(this.playback.cctvImage, 0, 0, w, h);
      ctx.restore();
    }

    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w * 0.25, h * 0.2, w * 0.5, h * 0.6);

    ctx.fillStyle = 'rgba(7, 10, 15, 0.85)';
    ctx.fillRect(w * 0.25, h * 0.2 - 14, 115, 14);
    ctx.fillStyle = '#FBBF24';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('RECONSTRUCTED', w * 0.25 + 4, h * 0.2 - 4);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
  },

  downloadCarvedFragment(frag) {
    const link = document.createElement('a');
    link.href = this.customVideoUrl || frag.source || 'assets/cctv-evidence-ch01.mp4';
    link.download = `${frag.id}_Recovered_Slice_${frag.startTime !== undefined ? frag.startTime : 1.0}s_${frag.endTime !== undefined ? frag.endTime : 5.0}s.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  openCarvedRecoveryModal(clip) {
    const modal = document.getElementById('carved-recovery-modal');
    if (!modal) return;

    modal.style.display = 'flex';

    const startTime = clip.startTime !== undefined ? clip.startTime : 1.0;
    const endTime = clip.endTime !== undefined ? clip.endTime : 5.0;
    const duration = Math.max(0.1, endTime - startTime);
    const durationLabel = clip.durationSec ? `${clip.durationSec}s` : `${duration.toFixed(1)}s`;

    this.setText('carved-modal-id', `FRAGMENT #${clip.id}`);
    this.setText('carved-meta-offset', clip.offset || '0x004F8200 - 0x008D1900');
    this.setText('carved-meta-confidence', `${clip.confidence || '98.4%'} (IDR Intact)`);
    this.setText('carved-meta-format', `${clip.codec || 'H.264'} / ${clip.resolution || '1920x1080'}`);
    this.setText('carved-meta-duration', `${clip.duration || '00:00:04'} (${durationLabel} Sub-Clip)`);
    this.setText('carved-meta-sha256', clip.sha256 || 'f489b0134cd98162541a783b65287f34a10e74b967198d0234ac871b65e90341');
    this.setText('carved-meta-raw-time', clip.rawPts || '2026-09-18 10:11:46.000 (Drift: +03m 14s)');
    this.setText('carved-meta-norm-time', clip.normalizedUtc || '2026-09-18 10:15:00.000 UTC [NTP CALIBRATED]');
    this.setText('carved-watermark-cam', clip.channel || 'CH 01');
    this.setText('carved-watermark-time', `${clip.normalizedUtc || '10:15:00.000 UTC'} | ${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s`);

    const srcName = this.customVideoFile ? this.customVideoFile.name : (clip.source ? 'cctv-evidence-ch01.mp4' : 'dahua_raw_disk.dd');
    this.setText('carved-slice-source', `SOURCE: ${srcName} [Extracted Slice: ${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s]`);
    this.setText('carved-slice-timer', `0.0s / ${duration.toFixed(1)}s (${durationLabel} sub-clip)`);

    const videoEl = document.getElementById('carved-fragment-video');
    const canvasEl = document.getElementById('carved-fragment-canvas');
    const scrubFill = document.getElementById('carved-modal-scrub-fill');
    const scrubBar = document.getElementById('carved-modal-scrub-bar');
    const timerEl = document.getElementById('carved-slice-timer');
    const playPauseBtn = document.getElementById('carved-play-pause-btn');
    const replayBtn = document.getElementById('carved-replay-btn');

    if (scrubFill) scrubFill.style.width = '0%';

    const srcUrl = this.customVideoUrl || clip.source || 'assets/cctv-evidence-ch01.mp4';
    if (videoEl) {
      videoEl.src = srcUrl;
      videoEl.style.display = 'block';
      if (canvasEl) canvasEl.style.display = 'none';

      videoEl.currentTime = startTime;
      videoEl.play().then(() => {
        if (playPauseBtn) {
          playPauseBtn.innerText = '⏸ Pause';
          playPauseBtn.classList.add('active');
        }
      }).catch(() => {
        if (canvasEl) {
          videoEl.style.display = 'none';
          canvasEl.style.display = 'block';
          this.renderCarvedCanvasLoop(canvasEl);
        }
      });

      // Loop tightly inside [startTime, endTime]
      videoEl.ontimeupdate = () => {
        if (videoEl.currentTime >= endTime || videoEl.currentTime < startTime) {
          videoEl.currentTime = startTime;
        }
        const elapsed = Math.max(0, videoEl.currentTime - startTime);
        const pct = Math.min(100, (elapsed / duration) * 100);
        if (scrubFill) scrubFill.style.width = `${pct}%`;
        if (timerEl) timerEl.innerText = `${elapsed.toFixed(1)}s / ${duration.toFixed(1)}s (${durationLabel} sub-clip)`;
      };

      if (playPauseBtn) {
        playPauseBtn.onclick = () => {
          if (videoEl.paused) {
            videoEl.play();
            playPauseBtn.innerText = '⏸ Pause';
            playPauseBtn.classList.add('active');
          } else {
            videoEl.pause();
            playPauseBtn.innerText = '▶ Play';
            playPauseBtn.classList.remove('active');
          }
        };
      }

      if (replayBtn) {
        replayBtn.onclick = () => {
          videoEl.currentTime = startTime;
          videoEl.play();
          if (playPauseBtn) {
            playPauseBtn.innerText = '⏸ Pause';
            playPauseBtn.classList.add('active');
          }
        };
      }

      if (scrubBar) {
        scrubBar.onclick = (e) => {
          const rect = scrubBar.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          videoEl.currentTime = startTime + ratio * duration;
        };
      }
    }

    // Download Fragment Clip Button
    const downloadBtn = document.getElementById('btn-download-carved-clip');
    if (downloadBtn) {
      downloadBtn.onclick = () => this.downloadCarvedFragment(clip);
    }

    // Export Fragment Certificate Button
    const certBtn = document.getElementById('btn-download-carved-cert');
    if (certBtn) {
      certBtn.onclick = () => {
        const cert = `================================================================================
BRUCH.DFA - FORENSIC FRAGMENT RECONSTRUCTION CERTIFICATE
Admissible under Federal Rules of Evidence FRE 902(13)/(14) & ISO/IEC 27037:2012
================================================================================
Artifact Identifier:       ${clip.id}
Source Media:              ${srcName}
Extraction Time Range:     ${startTime.toFixed(1)}s to ${endTime.toFixed(1)}s (Duration: ${duration.toFixed(1)}s)
Physical Cluster Offset:   ${clip.offset || '0x004F8200 - 0x008D1900'}
Recovery Methodology:      Unallocated Cluster Carving & NAL Unit Bitstream Extraction
NAL Header Validated:      0x00 00 00 01 67 (H.264 SPS/PPS Keyframe Validated)
Elementary Stream Status:  Lossless Extraction (-c copy)
Recovery Confidence:       ${clip.confidence || '98.4%'}
Channel Identification:    ${clip.channel || 'CH 01'}
Original UTC Timestamp:    ${clip.start || '2026-09-18 10:15:00 UTC'}

CRYPTOGRAPHIC INTEGRITY:
MD5 Hash:                  ${clip.md5 || '90cdfe71a2389145fa81a2938475cb01'}
SHA-256 Hash:              ${clip.sha256 || 'f489b0134cd98162541a783b65287f34a10e74b967198d0234ac871b65e90341'}

VERIFICATION STATEMENT:
This video fragment was carved directly from unallocated disk space following an intentional
or circular overwrite anomaly. The elementary video bitstream was extracted bit-for-bit without
re-encoding, preserving exact frame timing and cryptographic integrity.

Examiner: BRUCH.DFA Automated Forensic Acquisition Engine v2.4.0-LE
================================================================================`;
        const blob = new Blob([cert], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${clip.id}_Carved_Recovery_Certificate.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
  },

  closeCarvedRecoveryModal() {
    const modal = document.getElementById('carved-recovery-modal');
    if (modal) modal.style.display = 'none';
    const videoEl = document.getElementById('carved-fragment-video');
    if (videoEl) {
      videoEl.pause();
      videoEl.ontimeupdate = null;
    }
    if (this.carvedCanvasAnimId) {
      cancelAnimationFrame(this.carvedCanvasAnimId);
      this.carvedCanvasAnimId = null;
    }
  },

  renderCarvedCanvasLoop(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const loop = () => {
      t += 0.05;
      ctx.fillStyle = '#060B12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (this.playback.cctvImage) {
        ctx.save();
        ctx.filter = 'contrast(120%) brightness(0.85) sepia(20%)';
        ctx.drawImage(this.playback.cctvImage, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Reconstructed motion box
      const bx = 180 + Math.sin(t) * 120;
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, 80, 110, 120);

      ctx.fillStyle = 'rgba(7, 10, 15, 0.85)';
      ctx.fillRect(bx, 58, 145, 20);
      ctx.fillStyle = '#FBBF24';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('RECONSTRUCTED TARGET', bx + 6, 72);

      // Scanline noise
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      this.carvedCanvasAnimId = requestAnimationFrame(loop);
    };
    loop();
  },

  switchDemoTab(tabName) {
    const tabBtnAnalysis = document.getElementById('tab-btn-analysis');
    const tabBtnImaging = document.getElementById('tab-btn-imaging');
    const tabContentAnalysis = document.getElementById('tab-content-analysis');
    const tabContentImaging = document.getElementById('tab-content-imaging');

    if (tabName === 'imaging') {
      if (tabBtnAnalysis) tabBtnAnalysis.classList.remove('active');
      if (tabBtnImaging) tabBtnImaging.classList.add('active');
      if (tabContentAnalysis) tabContentAnalysis.style.display = 'none';
      if (tabContentImaging) tabContentImaging.style.display = 'block';
      this.updateImagingDestination();
    } else {
      if (tabBtnImaging) tabBtnImaging.classList.remove('active');
      if (tabBtnAnalysis) tabBtnAnalysis.classList.add('active');
      if (tabContentImaging) tabContentImaging.style.display = 'none';
      if (tabContentAnalysis) tabContentAnalysis.style.display = 'block';
    }
  },

  updateImagingDestination() {
    const caseRef = document.getElementById('imaging-case-ref')?.value || 'CASE-2026-DH-8491';
    const evidenceTag = document.getElementById('imaging-evidence-tag')?.value || 'ITEM-01-HDD';
    const format = this.imagingState.format || 'dd';
    const targetDestEl = document.getElementById('imaging-target-dest');
    if (targetDestEl) {
      targetDestEl.innerText = `/evidence/${caseRef}_${evidenceTag}_Physical.${format}`;
    }
  },

  startForensicAcquisition() {
    if (this.imagingState.isAcquiring) return;
    this.imagingState.isAcquiring = true;

    const startBtn = document.getElementById('btn-start-imaging');
    const progressContainer = document.getElementById('imaging-progress-container');
    const progressStatus = document.getElementById('imaging-progress-status');
    const progressPct = document.getElementById('imaging-progress-pct');
    const progressFill = document.getElementById('imaging-progress-fill');
    const terminal = document.getElementById('imaging-log-terminal');
    const resultBox = document.getElementById('imaging-success-result');

    const statSectors = document.getElementById('imaging-stat-sectors');
    const statSpeed = document.getElementById('imaging-stat-speed');
    const statTime = document.getElementById('imaging-stat-time');
    const statErrors = document.getElementById('imaging-stat-errors');

    if (startBtn) {
      startBtn.disabled = true;
      startBtn.innerText = '⚡ Bitstream Acquisition in Progress...';
    }

    if (progressContainer) progressContainer.style.display = 'block';
    if (resultBox) resultBox.style.display = 'none';
    if (terminal) terminal.innerHTML = '';

    const caseRef = document.getElementById('imaging-case-ref')?.value || 'CASE-2026-DH-8491';
    const evidenceTag = document.getElementById('imaging-evidence-tag')?.value || 'ITEM-01-HDD';
    const examinerName = document.getElementById('imaging-examiner-name')?.value || 'Lead Examiner';
    const sourceVal = document.getElementById('imaging-source-device')?.value || 'dahua_wd_2tb';
    const format = this.imagingState.format || 'dd';

    const sourceDevices = {
      dahua_wd_2tb: { name: '/dev/sdb', model: 'Western Digital Purple 2.0 TB', sn: 'WCC4M019283', sectors: 3907029168, sizeGiB: '1,863.02 GiB', preset: 'dahua', md5: '7f4c26a9e851d42398b1a7c5031b2890', sha256: '9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a' },
      hik_seagate_1tb: { name: '/dev/sdc', model: 'Seagate SkyHawk Surveillance 1.0 TB', sn: 'Z1D839LK', sectors: 1953525168, sizeGiB: '931.51 GiB', preset: 'hikvision', md5: 'b410984a1e94827fb3362a45fb8912cd', sha256: '01ab764fe3109a8274d8123c591a48e71b260934f81a74e5109b82371904a629' },
      cpplus_toshiba_2tb: { name: '/dev/sdd', model: 'Toshiba DT01ACA 2.0 TB', sn: '82K0129F', sectors: 3907029168, sizeGiB: '1,863.02 GiB', preset: 'cpplus', md5: 'c0184fa981e749210984ba1029348feb', sha256: '88914ab0128e4719b02341a98716cb541a783b65287f34a10e74b967198d0234' },
      custom_uploaded: { name: '/dev/sde', model: this.customVideoFile ? `Custom Media (${this.customVideoFile.name})` : 'Custom Physical Disk Dump', sn: 'LE-UPLOADED-01', sectors: 209715200, sizeGiB: '100.00 GiB', preset: 'dahua', md5: 'e82b7194c0184fa981e749210984ba10', sha256: '617b3a721c569f41b2aa8d31294efbc126938dc36541f48ab03b7156942ce11a' }
    };

    const dev = sourceDevices[sourceVal] || sourceDevices.dahua_wd_2tb;
    const destFilename = `${caseRef}_${evidenceTag}_Physical.${format}`;

    const logMessages = [
      `[HARDWARE] Querying physical bus: ${dev.name} [${dev.model}, SN: ${dev.sn}]`,
      `[BLOCKDEV] Hardware write-block verified: Tableau T8u Forensic Bridge (READ-ONLY LOCKED)`,
      `[ACQUIRE] Initiating direct I/O bitstream copy (block size: 64KB, count: ${dev.sectors.toLocaleString()})`,
      `[DCFLDD] dcfldd if=${dev.name} of=/evidence/${destFilename} hash=md5,sha256 statusinterval=256MB`,
      `[HASHING] Streaming crypto engine initialized: MD5 (RFC 1321) & SHA-256 (FIPS 180-4)`,
      `[STREAM] 25% completed — Current read speed: 216.4 MB/s — 0 bad sectors encountered`,
      `[STREAM] 50% completed — Synchronous dual-hash calculation running across all blocks`,
      `[STREAM] 75% completed — Sector alignment verified against cylinder boundary`,
      `[ACQUIRE] Final block written. Total sectors cloned: ${dev.sectors.toLocaleString()}`,
      `[VERIFY] Post-acquisition integrity verification: comparing source vs destination hashes...`,
      `[VERIFY] Source MD5: ${dev.md5} == Image MD5: ${dev.md5} [MATCH]`,
      `[VERIFY] Source SHA-256: ${dev.sha256} == Image SHA-256: ${dev.sha256} [MATCH]`,
      `[COMPLETE] Forensic acquisition authenticated under FRE 902(14) and ISO/IEC 27037:2012.`
    ];

    let step = 0;
    const startTime = Date.now();
    const interval = setInterval(() => {
      step++;
      const pct = Math.min(100, Math.round((step / logMessages.length) * 100));

      if (progressFill) progressFill.style.width = `${pct}%`;
      if (progressPct) progressPct.innerText = `${pct}%`;
      if (progressStatus) progressStatus.innerText = `Acquiring ${dev.name} (${pct}%) — Direct I/O Copy`;

      const currentSectors = Math.round((pct / 100) * dev.sectors);
      if (statSectors) statSectors.innerText = `${currentSectors.toLocaleString()} / ${dev.sectors.toLocaleString()}`;

      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const ss = String(elapsedSec % 60).padStart(2, '0');
      if (statTime) statTime.innerText = `00:${mm}:${ss}`;

      const speedVal = (212.0 + Math.sin(step) * 12.0).toFixed(1);
      if (statSpeed) statSpeed.innerText = `${speedVal} MB/s`;

      if (terminal && logMessages[step - 1]) {
        const row = document.createElement('div');
        row.style.fontFamily = 'var(--font-mono)';
        row.style.fontSize = '0.70rem';
        row.style.lineHeight = '1.6';

        if (logMessages[step - 1].includes('[VERIFY]') || logMessages[step - 1].includes('[COMPLETE]')) {
          row.innerHTML = `<span style="color: #34D399; font-weight: 600;">${logMessages[step - 1]}</span>`;
        } else {
          row.innerHTML = `<span style="color: var(--text-dim);">${logMessages[step - 1]}</span>`;
        }
        terminal.appendChild(row);
        terminal.scrollTop = terminal.scrollHeight;
      }

      if (step >= logMessages.length) {
        clearInterval(interval);
        this.imagingState.isAcquiring = false;
        if (startBtn) {
          startBtn.disabled = false;
          startBtn.innerText = '✔ Acquisition Complete (Re-run)';
        }

        // Store result case
        const createdCase = JSON.parse(JSON.stringify(this.presets[dev.preset]));
        createdCase.caseId = caseRef;
        createdCase.filename = destFilename;
        createdCase.size = dev.sizeGiB;
        createdCase.sourceMd5 = dev.md5;
        createdCase.sourceSha256 = dev.sha256;
        this.imagingState.lastCreatedCase = createdCase;

        // Render result box
        if (resultBox) resultBox.style.display = 'block';
        this.setText('imaging-result-filename', `${destFilename} (${dev.sizeGiB})`);
        this.setText('imaging-hash-md5', dev.md5);
        this.setText('imaging-hash-sha256', dev.sha256);

        // Bind download buttons
        const downloadImgBtn = document.getElementById('btn-download-created-image');
        if (downloadImgBtn) {
          downloadImgBtn.innerText = `⬇ Download Created Forensic Image (.${format})`;
          downloadImgBtn.onclick = () => this.downloadCreatedForensicImage(createdCase, dev, format);
        }

        const downloadCertBtn = document.getElementById('btn-download-imaging-cert');
        if (downloadCertBtn) {
          downloadCertBtn.onclick = () => this.downloadImagingCertificate(createdCase, dev, examinerName, evidenceTag, format);
        }
      }
    }, 220);
  },

  downloadCreatedForensicImage(createdCase, dev, format) {
    const header = `--- BRUCH.DFA FORENSIC BITSTREAM IMAGE CONTAINER ---
FORMAT: ${format.toUpperCase()} (Bitstream Forensic Copy)
ACQUISITION PROTOCOL: NIST SP 800-86 / ISO 27037:2012
CASE IDENTIFIER: ${createdCase.caseId}
SOURCE DRIVE: ${dev.name} (${dev.model})
DRIVE SERIAL NUMBER: ${dev.sn}
TOTAL SECTORS: ${dev.sectors} (512 Bytes / Sector)
IMAGE CAPACITY: ${dev.sizeGiB}
ACQUISITION TIMESTAMP: ${new Date().toISOString()}
WRITE-BLOCKER: Hardware Tableau T8u (Locked)
PRE-ACQUISITION MD5:    ${dev.md5}
POST-ACQUISITION MD5:   ${dev.md5}
PRE-ACQUISITION SHA256: ${dev.sha256}
POST-ACQUISITION SHA256:${dev.sha256}
INTEGRITY VERIFICATION: 100% BIT-FOR-BIT MATCH (0 Deviations)
============================================================
[FORENSIC BITSTREAM PAYLOAD BLOCK START]
`;
    const blob = new Blob([header, "\x00\x00\x00\x01\x67\x42\x00\x1E", "\x00".repeat(2048)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = createdCase.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadImagingCertificate(createdCase, dev, examinerName, evidenceTag, format) {
    const cert = `================================================================================
BRUCH.DFA - FORENSIC BITSTREAM IMAGE ACQUISITION & CHAIN OF CUSTODY CERTIFICATE
Self-Authenticating Record Pursuant to Federal Rules of Evidence FRE 902(13)/(14)
Standard Operating Procedure SOP-01 (Hardware Write-Blocked Disk Acquisition)
================================================================================
Case Reference:           ${createdCase.caseId}
Evidence Item Number:     ${evidenceTag}
Lead Forensic Examiner:   ${examinerName}
Acquisition System:       BRUCH.DFA Bitstream Acquisition Subsystem v2.4.0-LE
Hardware Forensic Bridge: Tableau T8u USB 3.0 Forensic Bridge (Hardware Read-Only Locked)
Acquisition Timestamp:    ${new Date().toUTCString()}

[1] PHYSICAL SOURCE STORAGE DEVICE
Device Mount Path:        ${dev.name}
Manufacturer & Model:     ${dev.model}
Drive Serial Number:      ${dev.sn}
Drive Geometry:           Total Logical Sectors: ${dev.sectors.toLocaleString()} (512 Bytes/Sector)
Raw Physical Capacity:    ${dev.sizeGiB}
Drive Health / S.M.A.R.T: PASSED (Zero Reallocated / Pending Bad Sectors)

[2] FORENSIC OUTPUT ARTIFACT
Image Filename:           ${createdCase.filename}
Image Container Format:   ${format.toUpperCase()} (Lossless Bit-for-Bit Bitstream Clone)
Direct I/O Mode:          O_DIRECT (Bypassing OS Kernel Buffer Cache)
Block Buffer Size:        64 KB (128 Sectors Alignment)

[3] DUAL-HASH CRYPTOGRAPHIC INTEGRITY VERIFICATION
Pre-Acquisition Source MD5:      ${dev.md5}
Post-Acquisition Image MD5:      ${dev.md5}
Cryptographic Status (MD5):      MATCH (RFC 1321 Verified)

Pre-Acquisition Source SHA-256:  ${dev.sha256}
Post-Acquisition Image SHA-256:  ${dev.sha256}
Cryptographic Status (SHA-256):  MATCH (FIPS 180-4 Verified)

Deviations / Block Discrepancies: 0 (Zero block variance)

[4] EXAMINER DECLARATION
I declare under penalty of perjury that this forensic bitstream acquisition was completed in
accordance with ISO/IEC 27037:2012 evidentiary guidelines and NIST SP 800-86 standard practices.
The physical source drive was never subjected to write operations. The resulting digital image
is an exact, bit-for-bit duplicate of the physical media at the time of seizure.

Examiner Signature: ____________________________     Date: ${new Date().toISOString().substring(0,10)}
Laboratory Verification Stamp: [BRUCH.DFA CERTIFIED FORENSIC EVIDENCE]
================================================================================`;
    const blob = new Blob([cert], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${createdCase.caseId}_${evidenceTag}_Acquisition_Certificate.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // =========================================================================
  // AI FORENSICS ANALYSIS STUDIO & MACHINE INTELLIGENCE CONTROLLER
  // =========================================================================
  aiStudioState: {
    isPlaying: true,
    filter: 'all',
    animId: null,
    model: 'yolo8_forensics',
    toggles: {
      boxes: true,
      labels: true,
      vectors: true,
      plates: true,
      heatmap: false,
      blur: false
    },
    events: [
      { id: "EVT-8821", time: "2026-09-19 14:55:01.120 UTC", type: "person", label: "Person #1 (Suspect Alpha)", conf: "97.4%", bbox: [120, 80, 75, 160], vel: "1.4 m/s NW", plate: null, notes: "Pedestrian entering gate perimeter" },
      { id: "EVT-8822", time: "2026-09-19 14:55:01.840 UTC", type: "vehicle", label: "Sedan (Toyota Camry)", conf: "96.2%", bbox: [320, 140, 160, 95], vel: "14.2 km/h E", plate: "MH-12-DE-4491 (98.6%)", notes: "Vehicle entering primary driveway" },
      { id: "EVT-8823", time: "2026-09-19 14:55:02.320 UTC", type: "plate", label: "LPR / ANPR Plate Detection", conf: "98.6%", bbox: [370, 195, 55, 22], vel: "14.2 km/h", plate: "MH-12-DE-4491", notes: "Matched against state registry query" },
      { id: "EVT-8824", time: "2026-09-19 14:55:03.110 UTC", type: "person", label: "Person #2 (Facility Guard)", conf: "94.8%", bbox: [490, 70, 70, 150], vel: "0.2 m/s", plate: null, notes: "Stationary personnel at security checkpoint" },
      { id: "EVT-8825", time: "2026-09-19 14:55:04.280 UTC", type: "tamper", label: "Temporal Illuminance Flare", conf: "93.1%", bbox: [0, 0, 640, 360], vel: "ΔL = +48%", plate: null, notes: "Sudden infrared / external light surge" },
      { id: "EVT-8826", time: "2026-09-19 14:55:05.650 UTC", type: "person", label: "Person #3 (Courier)", conf: "95.9%", bbox: [220, 110, 65, 145], vel: "1.8 m/s NE", plate: null, notes: "Approaching package delivery bay" },
      { id: "EVT-8827", time: "2026-09-19 14:55:06.400 UTC", type: "vehicle", label: "Delivery Van (Ford Transit)", conf: "95.1%", bbox: [40, 150, 180, 120], vel: "8.5 km/h", plate: "DL-01-AB-8291 (96.4%)", notes: "Commercial transport parked in bay sector" },
      { id: "EVT-8828", time: "2026-09-19 14:55:07.150 UTC", type: "plate", label: "Commercial LPR Tag", conf: "96.4%", bbox: [90, 220, 60, 24], vel: "8.5 km/h", plate: "DL-01-AB-8291", notes: "High confidence optical character recognition" },
      { id: "EVT-8829", time: "2026-09-19 14:55:08.920 UTC", type: "tamper", label: "Camera Housing Micro-Vibration", conf: "91.8%", bbox: [20, 20, 600, 320], vel: "3.2 px shift", plate: null, notes: "Mechanical vibration or chassis impact" }
    ]
  },

  initAiStudio() {
    this.renderAiFeed();
    this.initAiCanvasLoop();

    // Model Selector
    const modelSel = document.getElementById('ai-model-select');
    if (modelSel) {
      modelSel.addEventListener('change', (e) => {
        this.aiStudioState.model = e.target.value;
      });
    }

    // Toggle Buttons
    const toggles = [
      { id: 'toggle-ai-boxes', key: 'boxes' },
      { id: 'toggle-ai-labels', key: 'labels' },
      { id: 'toggle-ai-plates', key: 'plates' }
    ];
    toggles.forEach(t => {
      const btn = document.getElementById(t.id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.aiStudioState.toggles[t.key] = !this.aiStudioState.toggles[t.key];
          btn.classList.toggle('active', this.aiStudioState.toggles[t.key]);
        });
      }
    });

    // Filter Tabs
    const filterTabs = document.querySelectorAll('#ai-filter-tabs .ai-filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        filterTabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.aiStudioState.filter = e.currentTarget.dataset.filter || 'all';
        this.renderAiFeed();
      });
    });

    // Export AI Text Report (FRE 902)
    const exportReportBtn = document.getElementById('btn-export-ai-report');
    if (exportReportBtn) {
      exportReportBtn.addEventListener('click', () => this.exportAiReport());
    }

    // Export AI JSON
    const exportJsonBtn = document.getElementById('btn-export-ai-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportAiJson());
    }
  },

  renderAiFeed() {
    const feed = document.getElementById('ai-event-feed');
    if (!feed) return;
    feed.innerHTML = '';

    const filter = this.aiStudioState.filter;
    const filtered = this.aiStudioState.events.filter(ev => {
      if (filter === 'all') return true;
      return ev.type === filter;
    });

    const countLabel = document.getElementById('ai-filter-count');
    if (countLabel) countLabel.innerText = `${filtered.length} Events`;

    filtered.forEach(ev => {
      const item = document.createElement('div');
      item.className = 'ai-event-row';
      item.innerHTML = `
        <div class="ai-event-meta">
          <div class="ai-event-title">
            <span style="color: #FFFFFF; font-weight: 600;">${ev.label}</span>
            <span class="badge" style="font-size: 9px; padding: 1px 6px; background: rgba(255,255,255,0.08); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.2);">${ev.conf}</span>
          </div>
          <div class="ai-event-sub" style="color: #94A3B8;">${ev.time} • ${ev.notes}</div>
          ${ev.plate ? `<div style="color: #CBD5E1; font-size: 10px; margin-top: 1px;">ANPR: <strong style="color: #FFFFFF;">${ev.plate}</strong> [OCR LOCKED]</div>` : ''}
        </div>
      `;
      item.addEventListener('click', () => {
        const timeEl = document.getElementById('ai-norm-utc');
        if (timeEl) timeEl.innerText = ev.time;
      });
      feed.appendChild(item);
    });
  },

  initAiCanvasLoop() {
    const canvas = document.getElementById('ai-studio-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const renderLoop = () => {
      if (this.aiStudioState.isPlaying) {
        t += 0.03;
      }
      ctx.fillStyle = '#060B12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render CCTV Background or User Video
      const realVid = document.getElementById('player-real-video');
      if (realVid && realVid.style.display !== 'none' && !realVid.paused && realVid.videoWidth) {
        ctx.drawImage(realVid, 0, 0, canvas.width, canvas.height);
      } else if (this.playback.cctvImage && this.playback.imageLoaded) {
        ctx.save();
        ctx.filter = 'contrast(115%) brightness(0.9)';
        ctx.drawImage(this.playback.cctvImage, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Heatmap Overlay (Monochrome Grey/White)
      if (this.aiStudioState.toggles.heatmap) {
        const grad = ctx.createRadialGradient(280 + Math.sin(t) * 80, 180, 20, 280, 180, 190);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        grad.addColorStop(0.5, 'rgba(148, 163, 184, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Targets (Grey & White Monochrome Color Palette)
      const targets = [
        {
          id: 'ID #01',
          label: 'Person (97%)',
          x: 140 + Math.sin(t) * 50,
          y: 90,
          w: 65,
          h: 150,
          color: '#FFFFFF',
          isPerson: true
        },
        {
          id: 'ID #02',
          label: 'Sedan (96%)',
          plate: 'MH-12-DE-4491',
          x: 320 + Math.cos(t * 0.8) * 40,
          y: 130,
          w: 160,
          h: 90,
          color: '#E2E8F0',
          isPerson: false
        },
        {
          id: 'ID #04',
          label: 'Person (94%)',
          x: 480,
          y: 75,
          w: 60,
          h: 140,
          color: '#CBD5E1',
          isPerson: true
        }
      ];

      targets.forEach(tgt => {
        // Privacy Blur (Circular, zero square boxes)
        if (this.aiStudioState.toggles.blur && tgt.isPerson) {
          const faceX = tgt.x + tgt.w / 2;
          const faceY = tgt.y + 24;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.beginPath();
          ctx.arc(faceX, faceY, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#CBD5E1';
          ctx.font = '8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('[BLUR]', faceX, faceY + 3);
          ctx.textAlign = 'left';
        }

        // Target Markers (Circular reticle pin - zero square boxes)
        if (this.aiStudioState.toggles.boxes) {
          const cx = tgt.x + tgt.w / 2;
          const cy = tgt.y + tgt.h / 2;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, 9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        // Confidence Labels (Pure Grey and White typography, no square background box)
        if (this.aiStudioState.toggles.labels) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '600 11px "JetBrains Mono", monospace';
          ctx.fillText(`${tgt.id}: ${tgt.label}`, tgt.x, tgt.y - 6);
        }

        // Velocity Vectors (Monochrome grey/white)
        if (this.aiStudioState.toggles.vectors) {
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tgt.x + tgt.w / 2, tgt.y + tgt.h / 2);
          ctx.lineTo(tgt.x + tgt.w / 2 + 25, tgt.y + tgt.h / 2 - 15);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(tgt.x + tgt.w / 2 + 25, tgt.y + tgt.h / 2 - 15, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        // License Plate OCR (Clean white/grey typography, zero square boxes)
        if (this.aiStudioState.toggles.plates && tgt.plate) {
          const px = tgt.x;
          const py = tgt.y + tgt.h + 16;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.fillText(`ANPR: ${tgt.plate}`, px, py);
        }
      });

      this.aiStudioState.animId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
  },

  exportAiReport() {
    const report = `================================================================================
BRUCH.DFA - CERTIFIED AI FORENSIC VIDEO INFERENCE REPORT
Self-Authenticating Record Pursuant to Federal Rules of Evidence FRE 902(14)
ISO/IEC 27037:2012 & NIST SP 800-86 Admissibility Standard
================================================================================
Report Identifier:        AI-REP-2026-DH-9014
Generated At (UTC):       ${new Date().toISOString()}
Target Evidence Image:    ${this.activeCase ? this.activeCase.filename : 'evidence_master.dd'}
Primary Model Stack:      YOLOv8x-Forensics + ByteTrack 3D + PaddleOCR ANPR Engine
Inference Determinism:    Strict (Zero Stochastic Temperature / Deterministic Weights)
Model Weights Hash:       9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a (SHA-256)

[1] SUMMARY OF DETECTED FORENSIC ENTITIES
Total Entities Logged:    48 Targets (Zero False Positives over 0.85 Threshold)
- Classified Persons:     28 Entities (Average Confidence: 96.4%)
- Classified Vehicles:    14 Entities (Average Confidence: 95.8%)
- ANPR Plate Extractions: 6 Verified Registrations (PaddleOCR Confidence: 97.9%)
- Anti-Tamper Alerts:     2 Flags (0 Occlusion Violations, 2 Illuminance Transients)

[2] CHRONOLOGICAL EVENT AUDIT TRAIL
- [14:55:01.120 UTC] Person #1 detected. BBox: [120, 80, 75, 160]. Confidence: 97.4%. Velocity: 1.4 m/s NW.
- [14:55:01.840 UTC] Vehicle (Sedan) detected. BBox: [320, 140, 160, 95]. Confidence: 96.2%. Velocity: 14.2 km/h.
- [14:55:02.320 UTC] ANPR OCR Match: MH-12-DE-4491. Keyframe Verified. Confidence: 98.6%.
- [14:55:03.110 UTC] Person #2 detected. Checkpoint Guard. BBox: [490, 70, 70, 150]. Confidence: 94.8%.
- [14:55:04.280 UTC] Anti-Tamper Occlusion Sensor: Nominal. Infrared transient illuminance spike (+48%).
- [14:55:06.400 UTC] Commercial Van detected. BBox: [40, 150, 180, 120]. ANPR Plate: DL-01-AB-8291 (96.4%).

[3] FRE 902(14) STATUTORY ATTESTATION
I certify that the machine learning inference processes documented above were executed deterministically
upon bitstream video preserved in accordance with ISO/IEC 27037:2012. The neural networks do not employ
hallucinatory generative models; detections are purely geometric bounding coordinates and cryptographic hashes.

Examiner: BRUCH.DFA Automated Forensics Engine v2.4.0-LE
================================================================================`;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Inference_Forensic_Report_${Date.now()}.txt`;
    link.click();
  },

  exportAiJson() {
    const data = {
      reportId: `AI-TELEMETRY-${Date.now()}`,
      timestamp: new Date().toISOString(),
      models: {
        detector: "YOLOv8x-Forensics",
        tracker: "ByteTrack-3D",
        ocr: "PaddleOCR-v4",
        weightsSha256: "9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a"
      },
      events: this.aiStudioState.events
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Detection_Telemetry_${Date.now()}.json`;
    link.click();
  },

  // =========================================================================
  // FORENSIC AI CHATBOT COPILOT CONTROLLER (FLOATING WIDGET & EMBEDDED STUDIO)
  // =========================================================================
  initChatbot() {
    // 1. Floating Widget Controls
    const triggerBtn = document.getElementById('chatbot-trigger-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const chatWindow = document.getElementById('chatbot-window');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const input = document.getElementById('chatbot-input');

    if (triggerBtn && chatWindow) {
      triggerBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden') && input) {
          input.focus();
        }
      });
    }

    if (closeBtn && chatWindow) {
      closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
      });
    }

    // Floating Quick chips
    const chips = document.querySelectorAll('#chatbot-chips-bar .chatbot-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const query = e.currentTarget.dataset.query;
        if (query) this.handleChatbotQuery(query);
      });
    });

    // Floating Send button & enter key
    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => {
        const val = input.value.trim();
        if (val) {
          this.handleChatbotQuery(val);
          input.value = '';
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = input.value.trim();
          if (val) {
            this.handleChatbotQuery(val);
            input.value = '';
          }
        }
      });
    }

    // 2. Dedicated Page AI Chatbot Controls (Inside #view-ai-chatbot)
    const pageSendBtn = document.getElementById('page-chat-send-btn');
    const pageInput = document.getElementById('page-chat-input');
    const pageChips = document.querySelectorAll('#page-chat-chips .page-chat-chip');

    pageChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const query = e.currentTarget.dataset.query;
        if (query) this.handleChatbotQuery(query);
      });
    });

    if (pageSendBtn && pageInput) {
      pageSendBtn.addEventListener('click', () => {
        const val = pageInput.value.trim();
        if (val) {
          this.handleChatbotQuery(val);
          pageInput.value = '';
        }
      });

      pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = pageInput.value.trim();
          if (val) {
            this.handleChatbotQuery(val);
            pageInput.value = '';
          }
        }
      });
    }

    // 3. API Key Setup Buttons
    const handleKeyPrompt = () => {
      const current = this.geminiConfig.apiKey;
      const input = prompt("Configure Google Gemini API Key:\n\n(Saved securely in your browser's local storage)", current || '');
      if (input !== null) {
        this.geminiConfig.apiKey = input.trim();
        alert(input.trim() ? "Gemini API Key saved successfully!" : "Gemini API Key cleared.");
      }
    };
    const keyBtn1 = document.getElementById('btn-set-gemini-key');
    if (keyBtn1) keyBtn1.addEventListener('click', handleKeyPrompt);
    const keyBtn2 = document.getElementById('page-btn-set-key');
    if (keyBtn2) keyBtn2.addEventListener('click', handleKeyPrompt);
  },

  // =========================================================================
  // LIVE GOOGLE GEMINI LLM INTEGRATION
  // =========================================================================
  geminiConfig: {
    get apiKey() {
      try {
        const stored = localStorage.getItem('bruch_gemini_api_key');
        if (stored) return stored;
      } catch (e) {}
      return window.__BRUCH_DEFAULT_KEY__ || '';
    },
    set apiKey(val) {
      try {
        if (val) localStorage.setItem('bruch_gemini_api_key', val.trim());
        else localStorage.removeItem('bruch_gemini_api_key');
      } catch (e) {}
    },
    model: 'gemini-3.6-flash',
    fallbackModel: 'gemini-flash-latest'
  },

  async handleChatbotQuery(query) {
    const containers = [
      document.getElementById('chatbot-messages'),
      document.getElementById('page-chat-messages')
    ].filter(Boolean);

    if (containers.length === 0) return;

    // 1. Append User Bubble to all active chat containers
    containers.forEach(cnt => {
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble chat-bubble-user';
      userBubble.style.color = '#FFFFFF';
      userBubble.innerText = query;
      cnt.appendChild(userBubble);
      cnt.scrollTop = cnt.scrollHeight;
    });

    // 2. Append Thinking Indicator Bubbles
    const thinkingBubbles = [];
    containers.forEach(cnt => {
      const think = document.createElement('div');
      think.className = 'chat-bubble chat-bubble-bot thinking-bubble';
      think.style.color = '#94A3B8';
      think.style.fontStyle = 'italic';
      think.innerHTML = '<span class="chatbot-pulse-dot" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span> Generating analysis with Gemini 3.6-Flash...';
      cnt.appendChild(think);
      cnt.scrollTop = cnt.scrollHeight;
      thinkingBubbles.push(think);
    });

    // 3. Call Live Google Gemini LLM
    try {
      const reply = await this.queryGemini(query);
      const formattedHtml = this.formatAiMarkdown(reply);

      thinkingBubbles.forEach(think => {
        think.className = 'chat-bubble chat-bubble-bot';
        think.style.color = '#E2E8F0';
        think.style.fontStyle = 'normal';
        think.innerHTML = formattedHtml;
      });
      containers.forEach(cnt => cnt.scrollTop = cnt.scrollHeight);
    } catch (err) {
      console.warn('Gemini Live API failed, falling back to local forensic knowledge base:', err);
      const fallbackHtml = this.getForensicAiResponse(query);

      thinkingBubbles.forEach(think => {
        think.className = 'chat-bubble chat-bubble-bot';
        think.style.color = '#E2E8F0';
        think.style.fontStyle = 'normal';
        think.innerHTML = `<div style="font-size: 10px; color: #94A3B8; margin-bottom: 6px; font-family: monospace;">[FORENSIC KNOWLEDGE BASE RESPONDER]</div>` + fallbackHtml;
      });
      containers.forEach(cnt => cnt.scrollTop = cnt.scrollHeight);
    }
  },

  async queryGemini(query) {
    const activeCase = this.activeCase || this.presets['dahua'];
    const systemInstruction = `You are BRUCH.DFA Forensic Copilot, an expert artificial intelligence system specializing in CCTV/DVR/NVR digital forensics, Federal Rules of Evidence (FRE 902(13) & 902(14)), and ISO/IEC 27037:2012 standards.
You provide highly authoritative, technically rigorous forensic guidance on:
- Proprietary video filesystem architectures: Dahua (DHFS), Hikvision (HikFS), CP Plus, TP-Link, Honeywell, Uniview, Matrix.
- Raw bitstream carving from unallocated disk clusters, slack space, and circular overwrite ring buffers.
- Keyframe alignment, NAL unit demarcation (SPS/PPS 0x0000000167, IDR slices), and lossless packaging (-c copy).
- Presentation Timestamp (PTS) extraction, hardware Real-Time Clock (RTC) drift calibration, and UTC timeline normalization.
- Dual concurrent cryptographic hashing (MD5 RFC 1321 + SHA-256 FIPS 180-4) and court-admissible chain-of-custody documentation.

Active Case Context:
- Case Reference: ${activeCase.caseId}
- Target Image: ${activeCase.filename} (${activeCase.size})
- OEM Architecture: ${activeCase.vendor} (${activeCase.filesystem})
- SHA-256 Master: ${activeCase.sha256 || '9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a'}
- Mode: Write-Blocked Read-Only (blockdev --setro)

Respond concisely with clear bullet points, code or command snippets when helpful. Always adhere to strict digital forensics protocols.`;

    const fullPrompt = `${systemInstruction}\n\nInvestigator Query: ${query}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200
      }
    };

    // Primary attempt: gemini-3.6-flash
    const urlPrimary = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiConfig.model}:generateContent?key=${this.geminiConfig.apiKey}`;
    let resp = await fetch(urlPrimary, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      // Secondary fallback attempt: gemini-flash-latest
      const urlSecondary = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiConfig.fallbackModel}:generateContent?key=${this.geminiConfig.apiKey}`;
      resp = await fetch(urlSecondary, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!resp.ok) {
      throw new Error(`Gemini API Error: HTTP ${resp.status}`);
    }

    const data = await resp.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts.map(p => p.text).join('\n');
    }

    throw new Error('Invalid response structure from Gemini API');
  },

  formatAiMarkdown(text) {
    if (!text) return '';

    // Sanitize basic HTML tags
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks ```language ... ```
    html = html.replace(/```([a-zA-Z0-9_\-\.]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre style="background: rgba(0, 0, 0, 0.55); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 4px; padding: 10px; margin: 8px 0; overflow-x: auto;"><code style="font-family: monospace; font-size: 11px; color: #FFFFFF;">${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(255, 255, 255, 0.1); color: #FFFFFF; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 11px;">$1</code>');

    // Headers ###, ##, #
    html = html.replace(/^###\s+(.*)$/gm, '<div style="font-weight: 700; color: #FFFFFF; font-size: 12px; margin-top: 8px; margin-bottom: 3px;">$1</div>');
    html = html.replace(/^##\s+(.*)$/gm, '<div style="font-weight: 700; color: #FFFFFF; font-size: 13px; margin-top: 10px; margin-bottom: 4px;">$1</div>');
    html = html.replace(/^#\s+(.*)$/gm, '<div style="font-weight: 700; color: #FFFFFF; font-size: 14px; margin-top: 12px; margin-bottom: 5px;">$1</div>');

    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #FFFFFF; font-weight: 700;">$1</strong>');

    // Italic *text*
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em style="color: #CBD5E1;">$1</em>');

    // Bullet points
    html = html.replace(/^\s*[\-\*]\s+(.*)$/gm, '<div style="display: flex; gap: 6px; margin-bottom: 4px; margin-left: 6px;"><span style="color: #94A3B8;">•</span><span style="color: #E2E8F0;">$1</span></div>');

    // Numbered lists 1. 2.
    html = html.replace(/^\s*(\d+)\.\s+(.*)$/gm, '<div style="display: flex; gap: 6px; margin-bottom: 4px; margin-left: 6px;"><span style="color: #94A3B8; font-family: monospace;">$1.</span><span style="color: #E2E8F0;">$2</span></div>');

    // Line breaks
    html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

    // Clean extra breaks around pre and custom divs
    html = html.replace(/<br><div/g, '<div').replace(/<\/div><br>/g, '</div>');
    html = html.replace(/<br><pre/g, '<pre').replace(/<\/pre><br>/g, '</pre>');

    return html;
  },

  getForensicAiResponse(query) {
    const q = query.toLowerCase();

    // 1. How to connect AI API key (Gemini / OpenAI)
    if (q.includes('api') || q.includes('gemini') || q.includes('openai') || q.includes('chat bot') || q.includes('how to') || q.includes('steps')) {
      const activeKey = this.geminiConfig.apiKey;
      const maskedKey = activeKey ? (activeKey.substring(0, 6) + '...' + activeKey.slice(-4)) : '[KEY CONFIGURED IN LOCAL STORAGE]';
      return `<strong>Live Gemini API Integration Status:</strong><br><br>
Your Google Gemini API Key is active in your browser session:
<br>
<code style="color: #FFFFFF; background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 3px;">${maskedKey}</code>
<br><br>
Active Model: <strong>Gemini 3.6-Flash</strong> (v1beta REST Pipeline)<br>
System ground: <strong>FRE 902(13)/(14) & ISO/IEC 27037:2012 Certified</strong>.
<br><br>
All inquiries are deterministically analyzed with zero hallucination protocols.`;
    }

    // 2. Timestamp Normalization
    if (q.includes('timestamp') || q.includes('time') || q.includes('drift') || q.includes('normalize')) {
      return `<strong>Timestamp Normalization in Digital Forensics:</strong><br><br>
Proprietary CCTV DVRs utilize low-cost Real-Time Clocks (RTC) that frequently suffer from <strong>linear time drift</strong> (+/- minutes or hours from true time) or unconfigured timezones.<br><br>
<strong>How BRUCH.DFA Normalizes Time:</strong><br>
1. <strong>Raw PTS Extraction:</strong> Extracts Presentation Timestamps directly from the video container headers.<br>
2. <strong>Drift Calibration:</strong> Computes the delta against an external atomic reference (NTP / GPS clock) established at seizure.<br>
3. <strong>UTC Alignment:</strong> Maps each video frame to a standardized <strong>ISO/IEC 27037:2012</strong> Universal Coordinated Time (UTC) timeline.<br>
4. <strong>Cross-Camera Sync:</strong> Eliminates temporal jitter so cameras at different angles align perfectly in multi-channel timelines.`;
    }

    // 3. FRE 902(13)/(14) Admissibility
    if (q.includes('902') || q.includes('rule') || q.includes('court') || q.includes('admissibility') || q.includes('legal')) {
      return `<strong>Federal Rules of Evidence Rule 902(13) & (14):</strong><br><br>
These rules permit electronic evidence to <strong>self-authenticate</strong> without calling the manufacturer or technician to the stand:<br><br>
- <strong>FRE 902(13):</strong> Records generated by an electronic process or system (e.g. automated acquisition, filesystem reconstruction).<br>
- <strong>FRE 902(14):</strong> Certified data copied from an electronic device or media (e.g. bitstream disk clone).<br><br>
<strong>Court Requirements Satisfied:</strong><br>
Dual concurrent cryptographic hashes (MD5 RFC 1321 + SHA-256 FIPS 180-4) matching with <strong>0 block deviations</strong>, accompanied by an examiner acquisition certificate.`;
    }

    // 4. Carved Slack Space
    if (q.includes('carve') || q.includes('slack') || q.includes('unallocated') || q.includes('deleted')) {
      return `<strong>Unallocated Cluster & Slack Space Carving:</strong><br><br>
DVR file systems (e.g. Dahua DHFS, Hikvision HikFS) record in circular ring buffers. When footage is deleted or overwritten, directory tables are cleared, but raw H.264/H.265 bitstreams remain in unallocated sectors.<br><br>
<strong>BRUCH.DFA Carving Methodology:</strong><br>
1. Scans raw sectors for NAL unit start codes (<code>0x00 00 00 01 67</code> for SPS/PPS keyframes).<br>
2. Validates IDR slice boundaries to prevent GOP corruption.<br>
3. Re-wraps elementary streams into standard MP4 containers without re-encoding (<code>-c copy</code>), preserving bit-for-bit mathematical fidelity.`;
    }

    // 5. Active Case Integrity
    if (q.includes('case') || q.includes('current') || q.includes('analyze') || q.includes('integrity')) {
      const c = this.activeCase || this.presets['dahua'];
      return `<strong>Active Case Integrity Status:</strong><br><br>
- <strong>Case Reference:</strong> <code>${c.caseId}</code><br>
- <strong>Source Image:</strong> <code>${c.filename}</code> (${c.size})<br>
- <strong>Vendor Architecture:</strong> ${c.vendor} (${c.filesystem})<br>
- <strong>SHA-256 Master:</strong> <code>${c.sha256 ? c.sha256.substring(0, 24) : '9b3c4155a013'}...</code><br>
- <strong>Carved Recovered Clips:</strong> ${c.carvedClips || 5} clips extracted<br>
- <strong>Timestamp Status:</strong> Normalized to UTC Standard (Drift: +04m 12s compensated)<br>
- <strong>Evidentiary Verdict:</strong> <span style="color: #FFFFFF; font-weight: 600;">COURT ADMISSIBLE (ISO/IEC 27037:2012)</span>`;
    }

    // Fallback general response
    return `<strong>Forensic Copilot Guidance:</strong><br><br>
Regarding <em>"${query}"</em>:<br>
In accordance with digital forensic best practices, all video extractions, unallocated cluster carvings, and timestamp calibrations are executed under read-only write-blocking protocols. Dual-hash verification (MD5 & SHA-256) is maintained at every step.`;
  },

  // =========================================================================
  // FORENSIC CASE REPORTING & COURT DOSSIER ENGINE (FRE 902 & ISO 27037)
  // =========================================================================
  initReportCenter() {
    // 1. Target Case Selector
    const caseSelect = document.getElementById('report-case-select');
    if (caseSelect) {
      caseSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom' && this.activeCase && this.activeCase.isCustom) {
          this.renderCaseReport();
        } else if (this.presets[val]) {
          this.loadPreset(val);
          this.renderCaseReport();
        }
      });
    }

    // 2. Report Template Selector
    const templateSelect = document.getElementById('report-template-select');
    if (templateSelect) {
      templateSelect.addEventListener('change', () => this.renderCaseReport());
    }

    // 3. Live Examiner & Agency Input
    const examinerInput = document.getElementById('report-examiner-input');
    if (examinerInput) {
      examinerInput.addEventListener('input', (e) => {
        const val = e.target.value.trim() || 'Forensic Examiner';
        this.setText('rep-examiner-name', val);
        this.setText('rep-sig-examiner', val);
      });
    }

    const agencyInput = document.getElementById('report-agency-input');
    if (agencyInput) {
      agencyInput.addEventListener('input', (e) => {
        this.setText('rep-agency-name', e.target.value.trim() || 'Forensic Science Laboratory');
      });
    }

    // 4. Action Buttons
    const printBtn = document.getElementById('btn-print-case-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    const exportTxtBtn = document.getElementById('btn-export-report-txt');
    if (exportTxtBtn) {
      exportTxtBtn.addEventListener('click', () => this.exportCaseReportTxt());
    }

    const exportJsonBtn = document.getElementById('btn-export-report-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportCaseReportJson());
    }

    const copyBtn = document.getElementById('btn-copy-report-clipboard');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyReportText());
    }

    // Listen for route changes to render report dynamically
    window.addEventListener('routeChanged', (e) => {
      if (e.detail && e.detail.route === 'reports') {
        this.renderCaseReport();
      }
    });

    // Initial render
    this.renderCaseReport();
  },

  renderCaseReport() {
    const c = this.activeCase || this.presets['dahua'];
    if (!c) return;

    this.setText('rep-case-id', c.caseId);
    this.setText('rep-exam-date', new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    this.setText('rep-filename', c.filename);
    this.setText('rep-capacity', c.size);
    this.setText('rep-vendor', c.vendor);
    this.setText('rep-filesystem', c.filesystem);

    const md5 = c.sourceMd5 || c.md5 || '7d59b209a3c4f9118e4012019482fa81';
    const sha256 = c.sourceSha256 || c.sha256 || '9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a';

    this.setText('rep-hash-md5-1', md5);
    this.setText('rep-hash-md5-2', md5);
    this.setText('rep-hash-sha256-1', sha256);
    this.setText('rep-hash-sha256-2', sha256);

    this.setText('rep-raw-rtc', '2026-09-18 10:11:48.000 (Hardware RTC Drift)');
    this.setText('rep-drift-delta', '+04m 12s (+252.0s drift compensated)');
    this.setText('rep-norm-utc', '2026-09-18 10:16:00.000 UTC [ISO 27037 CALIBRATED]');
    this.setText('rep-sig-date', 'Certified: ' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');

    // Populate Carved Video Fragments Table
    const tableBody = document.getElementById('rep-carved-table-body');
    if (tableBody) {
      tableBody.innerHTML = '';
      const fragments = this.carvedFragments || this.defaultCarvedFragments;
      fragments.forEach(f => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${f.id}</strong></td>
          <td class="font-mono">${f.offset}</td>
          <td class="font-mono">${f.durationSec}s (${f.startTime}s - ${f.endTime}s)</td>
          <td>${f.codec} (NAL 0x67 Keyframe Valid)</td>
          <td><span class="badge" style="background: rgba(255,255,255,0.08); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.2);">${f.confidence}</span></td>
        `;
        tableBody.appendChild(row);
      });
    }
  },

  exportCaseReportTxt() {
    const c = this.activeCase || this.presets['dahua'];
    const examiner = (document.getElementById('report-examiner-input') || {}).value || 'Investigator J. Vance, EnCE, CCE';
    const agency = (document.getElementById('report-agency-input') || {}).value || 'State Forensic Science Laboratory';
    const nowUtc = new Date().toISOString();

    const report = `================================================================================
BRUCH.DFA - JUDICIAL DIGITAL EVIDENCE EXAMINATION DOSSIER
Self-Authenticating Record Pursuant to Federal Rules of Evidence FRE 902(13)/(14)
ISO/IEC 27037:2012 & NIST Special Publication 800-86 Admissibility Standard
================================================================================

[1] ADMINISTRATIVE CASE PROFILE & CHAIN OF CUSTODY
Case Reference Number:        ${c.caseId}
Examination Generated (UTC):  ${nowUtc}
Principal Forensic Examiner:  ${examiner}
Examining Agency / Lab:       ${agency}
Statutory Authority:          Search Warrant / Lawful Evidence Intake
Integrity Verification:       Dual Concurrent Cryptographic Verification Passed (0 Block Deviations)

[2] STORAGE HARDWARE & PROPRIETARY FILESYSTEM SPECIFICATIONS
Target Evidence Image:        ${c.filename}
Calculated Storage Capacity:  ${c.size}
OEM Vendor Architecture:      ${c.vendor}
Proprietary Filesystem:       ${c.filesystem}
Write-Block Protection Mode:  Hardware Write-Blocker (blockdev --setro Verified)

[3] CRYPTOGRAPHIC HASH VERIFICATION MANIFEST
MD5 Acquisition Hash:         ${c.sourceMd5 || '7d59b209a3c4f9118e4012019482fa81'}
MD5 Post-Exam Hash:           ${c.sourceMd5 || '7d59b209a3c4f9118e4012019482fa81'}
MD5 Integrity Verification:   MATCH (0 BLOCK DEVIATIONS)

SHA-256 Acquisition Hash:     ${c.sourceSha256 || '9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a'}
SHA-256 Post-Exam Hash:       ${c.sourceSha256 || '9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a'}
SHA-256 Integrity Verdict:    MATCH (0 BLOCK DEVIATIONS / SELF-AUTHENTICATING)

[4] TIMECODE DRIFT CALIBRATION & UTC NORMALIZATION RECORD
Hardware Real-Time Clock:     2026-09-18 10:11:48.000 (OEM Uncalibrated)
Atomic Reference Standard:    Stratum-1 GPS / NTP Atomic Clock
Calculated Linear Drift:      +04 minutes 12 seconds (+252.0s compensated)
Calibrated Master Timeline:   2026-09-18 10:16:00.000 UTC [ISO/IEC 27037 Compliant]
Presentation Timestamp Check: Monotonic frame continuity validated (0 temporal gaps detected)

[5] UNALLOCATED CLUSTER CARVING & SUB-CLIP RECONSTRUCTION INVENTORY
Extracted Fragments:          ${(this.carvedFragments || []).length} Valid Sub-Clips
Demuxing Protocol:            Lossless elementary H.264 stream extraction (-c copy)
- FRAG-CRV-01: Cluster 0x004F8200 - 0x0061B400 | Duration: 4.0s | NAL 0x67 Keyframe Valid | Confidence: 98.4%
- FRAG-CRV-02: Cluster 0x00B17000 - 0x00C49800 | Duration: 3.5s | P-Frame Slices Intact   | Confidence: 96.2%
- FRAG-CRV-03: Cluster 0x0182C400 - 0x0195E000 | Duration: 3.7s | Lossless Repackaged MP4 | Confidence: 94.8%
- FRAG-CRV-04: Cluster 0x02100000 - 0x02250000 | Duration: 3.2s | IDR Keyframe Boundary   | Confidence: 95.7%
- FRAG-CRV-05: Cluster 0x0289A000 - 0x029F0000 | Duration: 3.6s | Verified Sequence Header | Confidence: 97.1%

[6] AUTOMATED AI VISION TELEMETRY & EVENT AUDIT
Model Inference Pipeline:     YOLOv8x-Forensics + ByteTrack 3D + PaddleOCR ANPR Engine
Inference Determinism:        Strict Deterministic (Temperature = 0.0, Zero Stochastic Variation)
Total Entities Logged:        48 Targets (28 Persons, 14 Vehicles, 6 State Registrations)
ANPR Plate Keyframe Match:    MH-12-DE-4491 (Confidence: 98.6% - OCR Locked)
Anti-Tamper Sensor Score:     99.8% Nominal (0 Occlusion Violations)

[7] STATUTORY LEGAL ATTESTATION (FRE 902(13) & 902(14))
I certify under penalty of perjury under the laws of the United States and 28 U.S.C. § 1746
that the digital forensic examination documented herein was conducted adhering strictly
to ISO/IEC 27037:2012 and NIST SP 800-86 standards. All source media was write-blocked,
and no electronic evidence was altered or fabricated.

Lead Examiner:                ${examiner}
Digital Signature Hash:       ${sha256.substring(0, 32)} (FRE 902 Cryptographic Seal)
Timestamp of Attestation:     ${nowUtc}
================================================================================`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Forensic_Case_Report_${c.caseId}_${Date.now()}.txt`;
    link.click();
  },

  exportCaseReportJson() {
    const c = this.activeCase || this.presets['dahua'];
    const examiner = (document.getElementById('report-examiner-input') || {}).value || 'Investigator J. Vance, EnCE, CCE';
    const agency = (document.getElementById('report-agency-input') || {}).value || 'State Forensic Science Laboratory';

    const data = {
      manifestId: `CASE-MANIFEST-${Date.now()}`,
      standards: ["ISO/IEC 27037:2012", "NIST SP 800-86", "FRE 902(13)", "FRE 902(14)"],
      caseProfile: {
        caseId: c.caseId,
        examiner: examiner,
        agency: agency,
        generatedAt: new Date().toISOString()
      },
      hardwareMedia: {
        filename: c.filename,
        capacity: c.size,
        vendor: c.vendor,
        filesystem: c.filesystem,
        writeBlockProtection: true
      },
      cryptographicHashes: {
        md5: c.sourceMd5 || '7d59b209a3c4f9118e4012019482fa81',
        sha256: c.sourceSha256 || '9b3c4155a0134f77c8e9b62f14aa4858b9911e3b6a90823df1f0d3674bf54c2a',
        verificationVerdict: "0_BLOCK_DEVIATION_MATCH"
      },
      timecodeNormalization: {
        driftCompensatedSec: 252.0,
        standard: "UTC"
      },
      carvedFragments: this.carvedFragments || this.defaultCarvedFragments,
      aiTelemetry: {
        modelStack: ["YOLOv8x-Forensics", "ByteTrack-3D", "PaddleOCR"],
        totalDetections: 48,
        tamperScore: 0.998
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Case_Manifest_${c.caseId}_${Date.now()}.json`;
    link.click();
  },

  copyReportText() {
    const c = this.activeCase || this.presets['dahua'];
    const summary = `BRUCH.DFA Case Dossier: ${c.caseId}\nImage: ${c.filename}\nVendor: ${c.vendor} (${c.filesystem})\nSHA-256: ${c.sourceSha256 || c.sha256}\nTimestamp: Calibrated UTC (ISO 27037)\nCarved Fragments: ${(this.carvedFragments || []).length} Recovered\nCourt Admissibility: FRE 902(14) Validated`;
    navigator.clipboard.writeText(summary).then(() => {
      const copyBtn = document.getElementById('btn-copy-report-clipboard');
      if (copyBtn) {
        const oldText = copyBtn.innerText;
        copyBtn.innerText = '✓ Summary Copied!';
        setTimeout(() => copyBtn.innerText = oldText, 2000);
      }
    });
  },

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }
};

window.ForensicDemoEngine = ForensicDemoEngine;
