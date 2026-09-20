# BRUCH.DFA: Multi-Vendor DVR/NVR Digital Forensics Analysis Tool

[![Forensic Standard](https://img.shields.io/badge/Standard-ISO%2FIEC%2027037%3A2012-blue.svg)](https://www.iso.org/standard/44381.html)
[![FRE 902 Compliance](https://img.shields.io/badge/Legal-FRE%20902(13)%20%26%20(14)-green.svg)](https://www.law.cornell.edu/rules/fre/rule_902)
[![LLM Engine](https://img.shields.io/badge/AI%20Copilot-Google%20Gemini%203.6--Flash-orange.svg)](https://aistudio.google.com)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An enterprise-grade, browser-based digital forensics investigation workstation and automated analysis suite engineered for multi-vendor CCTV DVR/NVR proprietary surveillance systems.

---

## 🎯 Executive Summary & Mission

Law enforcement agencies, state forensic laboratories, and digital forensics & incident response (DFIR) teams encounter critical challenges when investigating surveillance hardware:
1. **Proprietary Filesystems**: Systems like Dahua (DHFS), Hikvision (HikFS), CP Plus, TP-Link, Honeywell, Uniview, and Matrix use non-standard disk layouts, circular ring buffer overwrites, and raw sector allocations.
2. **Damaged / Deleted Footage**: Standard operating systems cannot mount or recover deleted footage from surveillance drives.
3. **Timecode Drift & Timeline Skew**: Surveillance Real-Time Clocks (RTC) suffer severe linear drift (+/- minutes or hours), undermining cross-camera synchronization and court admissibility.
4. **Strict Chain-of-Custody Requirements**: Under Federal Rules of Evidence **FRE 902(13)** and **FRE 902(14)**, extracted digital evidence must be self-authenticating, bit-identical, and cryptographically verified.

**BRUCH.DFA** solves these challenges with an integrated, self-authenticating forensic suite that runs directly on the examiner's workstation.

---

## ⚡ Core Forensic Capabilities

### 1. Bitstream Acquisition & Forensic Imaging Station
- Hardware write-blocked read-only imaging (`blockdev --setro`).
- Physical disk acquisition to **RAW/DD (`.dd`)**, **Expert Witness (`.E01`)**, and **AFF4** formats.
- Real-time concurrent dual-hashing (**MD5 RFC 1321** + **SHA-256 FIPS 180-4**) with 0 block deviation verification.
- Instant acquisition certificate generation (`.txt`) compliant with ISO/IEC 27037:2012.

### 2. Deep Unallocated Cluster Carving & Lossless Repackaging
- Direct raw bitstream sweeping for NAL unit start codes (`0x00 00 00 01 67` for H.264/H.265 SPS/PPS keyframes).
- Boundary-safe keyframe slicing to prevent GOP (Group of Pictures) distortion.
- Lossless container remuxing (`-c copy`) without transcoding, producing bit-accurate standard MP4 playback.
- Sub-clip extraction gallery with interactive frame-accurate scrubber and loop previews.

### 3. Presentation Timestamp (PTS) Drift Calibration & UTC Normalization
- Extracts raw Presentation Timestamps directly from the video elementary headers.
- Calibrates camera RTC clock delta against GPS/NTP atomic reference time.
- Synchronizes multi-camera angles onto a single unified ISO/IEC 27037:2012 UTC timeline.
- High-visibility OSD comparison banner displaying raw camera time alongside calibrated atomic UTC time.

### 4. AI-Powered Forensic Video Intelligence Studio
- Deterministic computer vision pipeline (YOLOv8x-Forensics + ByteTrack 3D + PaddleOCR ANPR Engine).
- Automated entity tracking (pedestrians, vehicles, state license plates).
- Privacy-compliant circular facial blurring for judicial redaction.
- Chronological detection feed with filterable classification badges.
- Court-admissible certified inference report generator (`.txt`) and telemetry export (`.json`).

### 5. Live Forensic AI Chatbot Copilot (Powered by Google Gemini)
- Integrated generative AI assistant running on Google Gemini 3.6-Flash.
- Grounded in Federal Rules of Evidence and NIST SP 800-86 standards.
- In-depth guidance on DVR filesystem parsing, timestamp normalization, and case file verification.
- Synchronized between the full-width embedded studio and persistent floating widget.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Vanilla ES6+ JavaScript, Semantic HTML5, Modern CSS Design System (Dual Obsidian / Laboratory Theme Engine).
- **Video Engine**: HTML5 Video Canvas API, frame-accurate time slicing, Web Media APIs.
- **AI Integration**: Google Generative Language API (Gemini 3.6-Flash / Flash-Latest v1beta REST).
- **Standards Grounding**: ISO/IEC 27037:2012, NIST SP 800-86, FRE 902(13)/(14).

---

## 🚀 Quickstart & Local Setup

Clone the repository and run locally using any static HTTP server (e.g. Python, Node.js, or VS Code Live Server):

```bash
# 1. Clone the repository
git clone https://github.com/ayushh1302/Multi-vendor-DVR-NVR-Digital-Forensics-Analysis-Tool.git

# 2. Enter the directory
cd Multi-vendor-DVR-NVR-Digital-Forensics-Analysis-Tool

# 3. Start local development server
python -m http.server 8085
```

Open your browser and navigate to:
- **Laboratory Interactive Demo**: `http://localhost:8085/#demo`
- **AI Forensic Studio**: `http://localhost:8085/#ai-analysis`
- **AI Chatbot Console**: `http://localhost:8085/#ai-chatbot`
- **Standard Operating Procedures (SOPs)**: `http://localhost:8085/#docs`

---

## 📜 Legal & Compliance Notice

BRUCH.DFA is designed exclusively for authorized law enforcement agencies, accredited forensic laboratories, and enterprise DFIR teams operating under valid legal authority (search warrants, court orders, or incident response authorization). Dual-use software classified under EAR99.
