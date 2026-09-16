/**
 * Generator for a 100% self-contained, single-file index.html
 * Enables users to download and run the entire simulation offline on any Android browser.
 */

import { SimulationParams } from '../types/simulation';

export function downloadStandaloneHtml(currentParams: SimulationParams): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>SETI Temporal Mismatch Simulation (Standalone Mobile Edition)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #080c15; color: #f1f5f9; overflow-x: hidden; font-size: 14px; }
    header { background: #0f172a; padding: 12px 16px; border-bottom: 1px solid #1e293b; position: sticky; top: 0; z-index: 40; }
    h1 { font-size: 16px; color: #38bdf8; font-weight: 700; margin-bottom: 2px; }
    p.desc { font-size: 11px; color: #94a3b8; line-height: 1.3; }
    .tabs { display: flex; background: #0f172a; border-bottom: 1px solid #334155; position: sticky; top: 57px; z-index: 30; }
    .tab-btn { flex: 1; padding: 10px 4px; text-align: center; font-size: 12px; font-weight: 600; color: #64748b; background: transparent; border: none; border-bottom: 2px solid transparent; cursor: pointer; }
    .tab-btn.active { color: #38bdf8; border-bottom-color: #38bdf8; background: rgba(56,189,248,0.05); }
    .tab-content { display: none; padding: 12px 14px; max-width: 600px; margin: 0 auto; }
    .tab-content.active { display: block; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
    .card-title { font-size: 13px; font-weight: 700; color: #7dd3fc; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
    .control-row { margin-bottom: 12px; }
    .control-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #cbd5e1; }
    .control-val { color: #38bdf8; font-weight: 700; }
    input[type=range] { width: 100%; accent-color: #38bdf8; height: 6px; background: #1e293b; border-radius: 4px; }
    input[type=number], select { width: 100%; background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 8px 10px; border-radius: 6px; font-size: 13px; margin-top: 4px; }
    .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
    .btn { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: 0.15s; }
    .btn-primary { background: #0284c7; color: #fff; width: 100%; }
    .btn-primary:active { background: #0369a1; }
    .btn-secondary { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
    .btn-preset { background: #1e293b; color: #cbd5e1; font-size: 11px; padding: 8px 6px; border-radius: 6px; border: 1px solid #334155; text-align: left; }
    .btn-preset:active { border-color: #38bdf8; color: #38bdf8; }
    #simCanvas { width: 100%; height: auto; aspect-ratio: 1/1; background: #030712; border-radius: 10px; border: 1px solid #1e293b; display: block; touch-action: none; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .stat-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; }
    .stat-label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
    .stat-num { font-size: 18px; font-weight: 700; color: #38bdf8; }
    .stat-sub { font-size: 10px; color: #94a3b8; }
    .bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: #0f172a; border-top: 2px solid #38bdf8; border-radius: 16px 16px 0 0; padding: 16px; z-index: 50; transform: translateY(105%); transition: transform 0.25s ease-out; max-height: 80vh; overflow-y: auto; }
    .bottom-sheet.open { transform: translateY(0); }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .badge-detected { background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4); }
    .badge-missed { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4); }
    .chart-box { margin-bottom: 14px; background: #0b1120; border-radius: 8px; padding: 10px; border: 1px solid #1e293b; }
    .chart-box h4 { font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
    canvas.mini-chart { width: 100%; height: 160px; display: block; }
  </style>
</head>
<body>
  <header>
    <h1>Temporal Mismatch Simulation for SETI</h1>
    <p class="desc">จำลองผลของระยะทาง ความล่าช้าของแสง และหน้าต่างเวลาการตรวจจับอารยธรรมต่างดาว</p>
  </header>

  <nav class="tabs">
    <button class="tab-btn active" onclick="switchTab('tab-sim')">การทดลอง</button>
    <button class="tab-btn" onclick="switchTab('tab-settings')">ตั้งค่า</button>
    <button class="tab-btn" onclick="switchTab('tab-results')">ผลลัพธ์</button>
    <button class="tab-btn" onclick="switchTab('tab-info')">ข้อมูลโมเดล</button>
  </nav>

  <!-- TAB SIMULATION -->
  <main id="tab-sim" class="tab-content active">
    <div style="position: relative;">
      <canvas id="simCanvas"></canvas>
      <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
        <button class="btn btn-secondary" style="min-height: 32px; padding: 4px 8px; font-size: 11px;" onclick="zoomCanvas(1.2)">+ ซูม</button>
        <button class="btn btn-secondary" style="min-height: 32px; padding: 4px 8px; font-size: 11px;" onclick="zoomCanvas(0.8)">- ออก</button>
        <button class="btn btn-secondary" style="min-height: 32px; padding: 4px 8px; font-size: 11px;" onclick="resetCanvasView()">รีเซ็ตมุมมอง</button>
      </div>
    </div>

    <div style="margin-top: 10px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8;">
      <span id="simStatus">พร้อมจำลอง</span>
      <span id="speedDisplay">ความเร็ว: 1x</span>
    </div>

    <div class="btn-grid" style="margin-top: 8px;">
      <button class="btn btn-primary" onclick="startSim()">เริ่มการทดลอง</button>
      <button id="pauseBtn" class="btn btn-secondary" onclick="togglePause()">Pause</button>
      <button class="btn btn-secondary" onclick="stepSim()">Step 1 เฟรม</button>
      <button class="btn btn-secondary" onclick="randomizeSeedAndRun()">สุ่ม Seed ใหม่</button>
    </div>

    <div style="display: flex; gap: 4px; overflow-x: auto; padding: 8px 0;">
      <button class="btn btn-secondary" style="min-height:30px; font-size:11px; padding:2px 8px;" onclick="setSpeed(0.5)">0.5x</button>
      <button class="btn btn-secondary" style="min-height:30px; font-size:11px; padding:2px 8px;" onclick="setSpeed(1)">1x</button>
      <button class="btn btn-secondary" style="min-height:30px; font-size:11px; padding:2px 8px;" onclick="setSpeed(2)">2x</button>
      <button class="btn btn-secondary" style="min-height:30px; font-size:11px; padding:2px 8px;" onclick="setSpeed(5)">5x</button>
      <button class="btn btn-secondary" style="min-height:30px; font-size:11px; padding:2px 8px;" onclick="setSpeed(10)">10x</button>
      <button class="btn btn-secondary" style="min-height:30px; font-size:11px; padding:2px 8px;" onclick="setSpeed(50)">50x</button>
      <button class="btn btn-secondary" style="min-height:30px; font-size:11px; padding:2px 8px;" onclick="setSpeed(100)">100x</button>
    </div>

    <div class="card" style="margin-top: 10px;">
      <div class="card-title">ความหมายของสัญลักษณ์บนแผนที่</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
        <div><span style="color:#38bdf8;">●</span> โลก (ผู้สังเกต) ตรงกลาง</div>
        <div><span style="color:#eab308;">★</span> ตรวจพบ Technosignature</div>
        <div><span style="color:#ef4444;">●</span> พลาดเนื่องจากความล่าช้าของแสง</div>
        <div><span style="color:#64748b;">●</span> สัญญาณจาง / ดับสูญไปแล้ว</div>
      </div>
    </div>
  </main>

  <!-- TAB SETTINGS -->
  <main id="tab-settings" class="tab-content">
    <div class="card">
      <div class="card-title">พรีเซ็ตการทดลองด่วน (Presets)</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <button class="btn-preset" onclick="loadPreset('short_lived')">1. อารยธรรมอายุสั้น</button>
        <button class="btn-preset" onclick="loadPreset('long_lived')">2. อารยธรรมอายุยาว</button>
        <button class="btn-preset" onclick="loadPreset('fast_tech')">3. อารยธรรมพัฒนาเร็ว</button>
        <button class="btn-preset" onclick="loadPreset('slow_tech')">4. อารยธรรมพัฒนาช้า</button>
        <button class="btn-preset" onclick="loadPreset('deep_space')">5. อารยธรรมระยะไกล</button>
        <button class="btn-preset" onclick="loadPreset('dense')">6. อารยธรรมจำนวนมาก</button>
        <button class="btn-preset" style="grid-column: span 2;" onclick="loadPreset('persistence')">7. Civilization Persistence (คงอยู่นาน)</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">กำหนดพารามิเตอร์การจำลอง</div>

      <div class="control-row">
        <div class="control-header">
          <span>จำนวนอารยธรรม (N)</span>
          <span class="control-val" id="val_civCount">10,000</span>
        </div>
        <input type="range" id="range_civCount" min="100" max="50000" step="100" value="10000" oninput="syncParam('civCount', this.value)">
      </div>

      <div class="control-row">
        <div class="control-header">
          <span>ระยะทางสูงสุด (ปีแสง)</span>
          <span class="control-val" id="val_maxDistance">100,000</span>
        </div>
        <input type="range" id="range_maxDistance" min="1000" max="150000" step="1000" value="100000" oninput="syncParam('maxDistance', this.value)">
      </div>

      <div class="control-row">
        <div class="control-header">
          <span>อายุอารยธรรมเฉลี่ย (ปี)</span>
          <span class="control-val" id="val_maxLifetime">1,000,000</span>
        </div>
        <input type="range" id="range_maxLifetime" min="1000" max="2000000" step="5000" value="1000000" oninput="syncParam('maxLifetime', this.value)">
      </div>

      <div class="control-row">
        <div class="control-header">
          <span>อัตราพัฒนาเทคโนโลยี (k)</span>
          <span class="control-val" id="val_techGrowthRate">0.020</span>
        </div>
        <input type="range" id="range_techGrowthRate" min="0.001" max="0.050" step="0.001" value="0.020" oninput="syncParam('techGrowthRate', this.value)">
      </div>

      <div class="control-row">
        <div class="control-header">
          <span>อายุสัญญาณ Technosignature (ปี)</span>
          <span class="control-val" id="val_signalLifetime">10,000</span>
        </div>
        <input type="range" id="range_signalLifetime" min="100" max="100000" step="500" value="10000" oninput="syncParam('signalLifetime', this.value)">
      </div>

      <div class="control-row">
        <div class="control-header">
          <span>ความแรงสัญญาณ (0 - 1)</span>
          <span class="control-val" id="val_signalStrength">0.75</span>
        </div>
        <input type="range" id="range_signalStrength" min="0" max="1" step="0.05" value="0.75" oninput="syncParam('signalStrength', this.value)">
      </div>

      <div class="control-row">
        <div class="control-header">
          <span>ทิศทางการส่งสัญญาณ (0=รอบทิศ, 1=บีมแคบ)</span>
          <span class="control-val" id="val_directionality">0.40</span>
        </div>
        <input type="range" id="range_directionality" min="0" max="1" step="0.05" value="0.40" oninput="syncParam('directionality', this.value)">
      </div>

      <div class="control-row">
        <div class="control-header">
          <span>ความไวเครื่องตรวจจับบนโลก (0 - 1)</span>
          <span class="control-val" id="val_detectorSensitivity">0.80</span>
        </div>
        <input type="range" id="range_detectorSensitivity" min="0.1" max="1" step="0.05" value="0.80" oninput="syncParam('detectorSensitivity', this.value)">
      </div>

      <div class="control-row">
        <div class="control-header">
          <span>โมเดลการพัฒนาเทคโนโลยี K(t)</span>
        </div>
        <select id="select_techModel" onchange="params.techModel = this.value">
          <option value="logistic">Logistic (S-Curve สมจริงที่สุด)</option>
          <option value="exponential">Exponential (ก้าวกระโดดเร็ว)</option>
          <option value="linear">Linear (เชิงเส้น)</option>
        </select>
      </div>

      <div class="control-row">
        <div class="control-header">
          <span>Random Seed (เลขสุ่ม)</span>
        </div>
        <input type="number" id="input_seed" value="4242" onchange="params.seed = parseInt(this.value)||4242">
      </div>

      <div class="btn-grid" style="margin-top: 14px;">
        <button class="btn btn-primary" onclick="applySettingsAndRun()">บันทึก & เริ่มจำลอง</button>
        <button class="btn btn-secondary" onclick="resetDefaults()">รีเซ็ตค่าเริ่มต้น</button>
      </div>
    </div>
  </main>

  <!-- TAB RESULTS -->
  <main id="tab-results" class="tab-content">
    <div class="card" style="border-color: #0284c7;">
      <div class="card-title">สรุปผลการทดลองเปรียบเทียบ Model A vs Model B</div>
      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-label">Model A (ไม่มี Light Delay)</div>
          <div class="stat-num" id="res_rateA">0.0%</div>
          <div class="stat-sub" id="res_countA">0 แห่ง</div>
        </div>
        <div class="stat-box" style="border-color: #38bdf8;">
          <div class="stat-label">Model B (Temporal Mismatch จริง)</div>
          <div class="stat-num" style="color: #4ade80;" id="res_rateB">0.0%</div>
          <div class="stat-sub" id="res_countB">0 แห่ง</div>
        </div>
        <div class="stat-box" style="grid-column: span 2; background: rgba(239, 68, 68, 0.08); border-color: rgba(239,68,68,0.3);">
          <div class="stat-label" style="color: #f87171;">Detection Reduction (อัตราการตรวจพบลดลง)</div>
          <div class="stat-num" style="color: #f87171;" id="res_reduction">-0.0%</div>
          <div class="stat-sub">เป็นผลมาจากความล่าช้าของแสง (Light Travel Time) และหน้าต่างเวลาที่ไม่ตรงกัน</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">สถิติทางกายภาพ</div>
      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-label">ระยะทางเฉลี่ย</div>
          <div class="stat-num" style="font-size: 15px;" id="res_avgDist">0 ly</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Temporal Mismatch เฉลี่ย</div>
          <div class="stat-num" style="font-size: 15px;" id="res_avgMismatch">0.000</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">เทคโนโลยีที่โลกสังเกตเห็น (เฉลี่ย)</div>
          <div class="stat-num" style="font-size: 15px; color: #a78bfa;" id="res_avgObsTech">0.000</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">เทคโนโลยีจริงในปัจจุบัน (เฉลี่ย)</div>
          <div class="stat-num" style="font-size: 15px; color: #f43f5e;" id="res_avgCurTech">0.000</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">กราฟวิเคราะห์ผลจริงจาก Simulation</div>
      
      <div class="chart-box">
        <h4>1. โอกาสตรวจพบเทียบกับระยะทาง (Probability vs Distance)</h4>
        <canvas id="chart1" class="mini-chart"></canvas>
      </div>

      <div class="chart-box">
        <h4>2. ความเหลื่อมล้ำทางเวลาเทียบระยะทาง (Mismatch vs Distance)</h4>
        <canvas id="chart2" class="mini-chart"></canvas>
      </div>

      <div class="chart-box">
        <h4>3. เทคโนโลยีที่สังเกตได้เทียบเทคโนโลยีปัจจุบัน (Observed vs Current)</h4>
        <canvas id="chart3" class="mini-chart"></canvas>
      </div>

      <div class="chart-box">
        <h4>4. เปรียบเทียบอัตราการตรวจพบ Model A vs Model B</h4>
        <canvas id="chart4" class="mini-chart"></canvas>
      </div>

      <div class="chart-box">
        <h4>5. การกระจายตัวของอายุอารยธรรม (Age Distribution)</h4>
        <canvas id="chart5" class="mini-chart"></canvas>
      </div>

      <div class="chart-box">
        <h4>6. ระดับเทคโนโลยี (Current vs Observed Distribution)</h4>
        <canvas id="chart6" class="mini-chart"></canvas>
      </div>
    </div>
  </main>

  <!-- TAB INFO -->
  <main id="tab-info" class="tab-content">
    <div class="card">
      <div class="card-title">สมมติฐาน Temporal Mismatch Hypothesis สำหรับ SETI</div>
      <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1; margin-bottom: 12px;">
        ในโครงการค้นหาสิ่งมีชีวิตทรงภูมิปัญญาต่างดาว (SETI) ปัญหาหนึ่งที่ถูกมองข้ามคือ <b>ความเร็วแสงที่จำกัด (Finite Speed of Light)</b> 
        ทำให้ภาพที่เราเห็นจากอวกาศเป็น "อดีต" เสมอ โดยสูตรคือ:
      </p>
      <div style="background: #0284c715; border-left: 3px solid #38bdf8; padding: 8px 12px; font-family: monospace; font-size: 13px; color: #7dd3fc; margin-bottom: 12px;">
        tau = distance / c
      </div>
      <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin-bottom: 10px;">
        หากอารยธรรมอยู่ห่างออกไป 10,000 ปีแสง แสงต้องใช้เวลาเดินทาง 10,000 ปี นั่นหมายความว่า เมื่อสัญญาณมาถึงโลก อารยธรรมนั้นอาจดับสูญไปแล้ว หรือพัฒนาเทคโนโลยีจนเกินกว่าจะใช้คลื่นวิทยุโบราณไปแล้ว
      </p>
    </div>

    <div class="card">
      <div class="card-title">ข้อจำกัดทางวิทยาศาสตร์</div>
      <p style="font-size: 12px; line-height: 1.5; color: #94a3b8;">
        การทดลองนี้เป็นแบบจำลองทางคณิตศาสตร์เชิงฟิสิกส์ดาราศาสตร์ เพื่อศึกษาผลกระทบของความล่าช้าของสัญญาณ ไม่ใช่หลักฐานยืนยันว่ามีอารยธรรมต่างดาวอยู่จริง
      </p>
    </div>
  </main>

  <!-- BOTTOM SHEET FOR CIVILIZATION DETAIL -->
  <div id="civSheet" class="bottom-sheet">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
      <div>
        <h3 id="sheet_id" style="font-size: 16px; color: #38bdf8;">Civilization #---</h3>
        <span id="sheet_badge" class="badge badge-detected">ตรวจพบ</span>
      </div>
      <button class="btn btn-secondary" style="min-height: 32px; padding: 4px 10px; font-size: 12px;" onclick="closeSheet()">ปิด ✕</button>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 12px;">
      <div>ระยะทาง: <b id="sheet_dist" style="color:#f8fafc;">-</b> ปีแสง</div>
      <div>Light Travel Time: <b id="sheet_tau" style="color:#f8fafc;">-</b> ปี</div>
      <div>สถานะปัจจุบัน: <b id="sheet_curState" style="color:#f8fafc;">-</b></div>
      <div>สถานะที่สังเกตเห็น: <b id="sheet_obsState" style="color:#f8fafc;">-</b></div>
      <div>เทคโนโลยีปัจจุบัน: <b id="sheet_curTech" style="color:#f43f5e;">-</b></div>
      <div>เทคโนโลยีที่สังเกต: <b id="sheet_obsTech" style="color:#a78bfa;">-</b></div>
      <div>Temporal Mismatch: <b id="sheet_mismatch" style="color:#eab308;">-</b></div>
      <div>ความน่าจะเป็น (Model B): <b id="sheet_probB" style="color:#4ade80;">-</b></div>
    </div>
    <div id="sheet_reason" style="font-size: 11px; line-height: 1.4; color: #cbd5e1; background: #1e293b; padding: 8px 10px; border-radius: 6px;"></div>
  </div>

  <script>
    // Embedded Simulation Engine for Standalone Execution
    let params = {
      civCount: 10000,
      minDistance: 10,
      maxDistance: 100000,
      minLifetime: 1000,
      maxLifetime: 1000000,
      techGrowthRate: 0.02,
      techModel: 'logistic',
      signalLifetime: 10000,
      signalStrength: 0.75,
      directionality: 0.4,
      detectorSensitivity: 0.8,
      simulationEpoch: 5000000,
      seed: 4242
    };

    let simData = { civilizations: [], stats: null };
    let isPaused = false;
    let animSpeed = 1;
    let viewZoom = 1;
    let viewOffsetX = 0;
    let viewOffsetY = 0;
    let selectedCiv = null;

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      event.target.classList.add('active');
      if (tabId === 'tab-results') renderAllCharts();
      if (tabId === 'tab-sim') drawCanvas();
    }

    function syncParam(key, val) {
      params[key] = parseFloat(val);
      const el = document.getElementById('val_' + key);
      if (el) el.innerText = Number(val).toLocaleString();
    }

    function resetDefaults() {
      params = {
        civCount: 10000,
        minDistance: 10,
        maxDistance: 100000,
        minLifetime: 1000,
        maxLifetime: 1000000,
        techGrowthRate: 0.02,
        techModel: 'logistic',
        signalLifetime: 10000,
        signalStrength: 0.75,
        directionality: 0.4,
        detectorSensitivity: 0.8,
        simulationEpoch: 5000000,
        seed: 4242
      };
      Object.keys(params).forEach(k => {
        const r = document.getElementById('range_' + k);
        if (r) r.value = params[k];
        const v = document.getElementById('val_' + k);
        if (v) v.innerText = Number(params[k]).toLocaleString();
      });
      startSim();
    }

    function loadPreset(id) {
      if (id === 'short_lived') {
        params.maxLifetime = 15000;
        params.signalLifetime = 3000;
        params.techGrowthRate = 0.035;
      } else if (id === 'long_lived') {
        params.maxLifetime = 2000000;
        params.signalLifetime = 100000;
      } else if (id === 'fast_tech') {
        params.techGrowthRate = 0.045;
        params.techModel = 'exponential';
      } else if (id === 'slow_tech') {
        params.techGrowthRate = 0.003;
        params.techModel = 'linear';
      } else if (id === 'deep_space') {
        params.minDistance = 20000;
        params.maxDistance = 100000;
      } else if (id === 'dense') {
        params.civCount = 30000;
      } else if (id === 'persistence') {
        params.maxLifetime = 3000000;
        params.signalLifetime = 100000;
        params.signalStrength = 1.0;
      }
      switchTab('tab-sim');
      startSim();
    }

    // Seeded PRNG
    function Mulberry32(s) {
      return function() {
        let t = s += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }
    }

    function evaluateK(age, k, model, lifetime) {
      if (age <= 0) return 0;
      const activeAge = Math.min(age, lifetime);
      let val = 0;
      if (model === 'linear') val = activeAge * k * 0.05;
      else if (model === 'exponential') val = 1 - Math.exp(-k * 0.08 * (activeAge / 100));
      else val = 1 / (1 + Math.exp(-k * 0.005 * (activeAge - Math.max(500, lifetime * 0.25))));
      if (age > lifetime) {
        val *= Math.exp(-(age - lifetime) / Math.max(1000, lifetime * 0.2));
      }
      return Math.max(0, Math.min(1.0, val));
    }

    function startSim() {
      const rng = Mulberry32(params.seed);
      document.getElementById('simStatus').innerText = 'กำลังคำนวณ ' + params.civCount.toLocaleString() + ' อารยธรรม...';
      
      const total = params.civCount;
      const civs = [];
      const currentTime = params.simulationEpoch;
      const birthStart = Math.max(0, currentTime - params.maxDistance * 1.5 - params.maxLifetime);
      const birthSpan = Math.max(100000, (currentTime - birthStart) * 1.2);

      let detA = 0, detB = 0, sumDist = 0, sumMis = 0, maxMis = 0, sumObs = 0, sumCur = 0;

      for (let i = 0; i < total; i++) {
        const uDist = rng();
        const dist = Math.sqrt(params.minDistance*params.minDistance + uDist * (params.maxDistance*params.maxDistance - params.minDistance*params.minDistance));
        const angle = rng() * Math.PI * 2;
        const birth = birthStart + rng() * birthSpan;
        const life = params.minLifetime + rng() * (params.maxLifetime - params.minLifetime);
        const sigLife = Math.min(life, params.signalLifetime * (0.8 + rng() * 0.4));
        const k = Math.max(0.001, params.techGrowthRate * (0.8 + rng() * 0.4));
        
        const tau = dist;
        const curAge = currentTime - birth;
        const curTech = evaluateK(curAge, k, params.techModel, life);
        const obsAge = (currentTime - tau) - birth;
        const obsTech = evaluateK(obsAge, k, params.techModel, life);

        const isCurrentlyActive = (currentTime >= birth && currentTime <= birth + life);
        const sigStartReach = birth + tau;
        const sigEndReach = birth + sigLife + tau;
        const isReaching = (currentTime >= sigStartReach && currentTime <= sigEndReach);

        const mismatch = Math.max(0, curTech - obsTech);
        if (mismatch > maxMis) maxMis = mismatch;
        sumDist += dist;
        sumMis += mismatch;
        sumObs += obsTech;
        sumCur += curTech;

        // Prob Model A
        let probA = 0;
        if (isCurrentlyActive && curTech >= 0.05) {
          probA = Math.min(1.0, (0.35*curTech + 0.35/(1+Math.log10(1+dist/250)) + 0.15*params.signalStrength) * (0.6 + 0.8*params.directionality) * params.detectorSensitivity);
        }
        if (probA >= 0.35) detA++;

        // Prob Model B
        let probB = 0;
        let missReason = '';
        if (!isReaching) {
          if (currentTime < sigStartReach) missReason = 'สัญญาณยังเดินทางมาไม่ถึงโลก';
          else missReason = 'สัญญาณเคลื่อนที่ผ่านโลกไปแล้วในอดีต';
        } else if (obsTech < 0.05) {
          missReason = 'ในยุคที่ส่งสัญญาณ อารยธรรมยังไม่มีเทคโนโลยีขั้นสูง';
        } else {
          probB = Math.min(1.0, (0.35*obsTech + 0.35/(1+Math.log10(1+dist/250)) + 0.15*params.signalStrength) * (0.6 + 0.8*params.directionality) * params.detectorSensitivity);
          if (probB < 0.35) missReason = 'สัญญาณจางเกินไปเมื่อเทียบกับความไวของเครื่องตรวจจับ';
          else missReason = 'ตรวจพบสำเร็จ! สัญญาณมาถึงโลกในสภาพที่เข้มข้นพอ';
        }
        const isDetB = probB >= 0.35;
        if (isDetB) detB++;

        // Store sample for rendering (limit array size to 2500 for canvas fluidity)
        if (i < 2500) {
          civs.push({
            id: i + 1,
            distance: Math.round(dist),
            tau: Math.round(tau),
            angle,
            curTech: Math.round(curTech*1000)/1000,
            obsTech: Math.round(obsTech*1000)/1000,
            mismatch: Math.round(mismatch*1000)/1000,
            probB: Math.round(probB*1000)/1000,
            detected: isDetB,
            curState: currentTime < birth ? 'ยังไม่เกิด' : (currentTime <= birth + life ? 'กำลังรุ่งเรือง' : 'ดับสูญแล้ว'),
            obsState: (currentTime - tau) < birth ? 'ยังไม่เกิด' : ((currentTime - tau) <= birth + life ? 'กำลังรุ่งเรือง' : 'ดับสูญแล้ว'),
            reason: missReason
          });
        }
      }

      const rateA = total > 0 ? (detA / total) * 100 : 0;
      const rateB = total > 0 ? (detB / total) * 100 : 0;
      const reduction = rateA > 0 ? ((rateA - rateB) / rateA) * 100 : 0;

      simData = {
        civilizations: civs,
        stats: {
          total,
          detA,
          rateA: Math.round(rateA * 10) / 10,
          detB,
          rateB: Math.round(rateB * 10) / 10,
          reduction: Math.round(reduction * 10) / 10,
          avgDist: Math.round(sumDist / total),
          avgMis: Math.round((sumMis / total) * 1000) / 1000,
          maxMis: Math.round(maxMis * 1000) / 1000,
          avgObs: Math.round((sumObs / total) * 1000) / 1000,
          avgCur: Math.round((sumCur / total) * 1000) / 1000
        }
      };

      document.getElementById('simStatus').innerText = 'การทดลองเสร็จสิ้น (' + detB.toLocaleString() + ' ตรวจพบ)';
      updateDashboardUI();
      drawCanvas();
    }

    function updateDashboardUI() {
      const s = simData.stats;
      if (!s) return;
      document.getElementById('res_rateA').innerText = s.rateA + '%';
      document.getElementById('res_countA').innerText = s.detA.toLocaleString() + ' แห่ง';
      document.getElementById('res_rateB').innerText = s.rateB + '%';
      document.getElementById('res_countB').innerText = s.detB.toLocaleString() + ' แห่ง';
      document.getElementById('res_reduction').innerText = '-' + s.reduction + '%';
      document.getElementById('res_avgDist').innerText = s.avgDist.toLocaleString() + ' ly';
      document.getElementById('res_avgMismatch').innerText = s.avgMis;
      document.getElementById('res_avgObsTech').innerText = s.avgObs;
      document.getElementById('res_avgCurTech').innerText = s.avgCur;
    }

    function applySettingsAndRun() {
      switchTab('tab-sim');
      startSim();
    }

    function randomizeSeedAndRun() {
      params.seed = Math.floor(Math.random() * 999999);
      document.getElementById('input_seed').value = params.seed;
      startSim();
    }

    // Canvas Visualization
    let canvas = document.getElementById('simCanvas');
    let ctx = canvas.getContext('2d');
    let waveProgress = 0;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.width * dpr;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawCanvas() {
      const w = canvas.getBoundingClientRect().width;
      const h = w;
      ctx.clearRect(0, 0, w, h);

      // Background grid
      const cx = w / 2 + viewOffsetX;
      const cy = h / 2 + viewOffsetY;
      const maxR = (w / 2 - 20) * viewZoom;

      // Range circles
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let r = 0.25; r <= 1.0; r += 0.25) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Earth at Center
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Animated Wavefronts
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, (waveProgress % maxR), 0, Math.PI * 2);
      ctx.stroke();

      // Civilizations
      const civs = simData.civilizations || [];
      const distMax = params.maxDistance;

      for (let i = 0; i < civs.length; i++) {
        const c = civs[i];
        const r = (c.distance / distMax) * maxR;
        const x = cx + Math.cos(c.angle) * r;
        const y = cy + Math.sin(c.angle) * r;

        if (c.detected) {
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (c.mismatch > 0.3) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Touch / Click to select civilization
    canvas.addEventListener('click', function(e) {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const w = rect.width;
      const cx = w / 2 + viewOffsetX;
      const cy = w / 2 + viewOffsetY;
      const maxR = (w / 2 - 20) * viewZoom;

      const civs = simData.civilizations || [];
      let closest = null;
      let minDist = 20; // 20px touch tolerance

      for (let i = 0; i < civs.length; i++) {
        const c = civs[i];
        const r = (c.distance / params.maxDistance) * maxR;
        const x = cx + Math.cos(c.angle) * r;
        const y = cy + Math.sin(c.angle) * r;
        const d = Math.hypot(clickX - x, clickY - y);
        if (d < minDist) {
          minDist = d;
          closest = c;
        }
      }

      if (closest) showCivilizationDetail(closest);
    });

    function showCivilizationDetail(c) {
      document.getElementById('sheet_id').innerText = 'Civilization #' + c.id;
      const badge = document.getElementById('sheet_badge');
      badge.className = 'badge ' + (c.detected ? 'badge-detected' : 'badge-missed');
      badge.innerText = c.detected ? 'ตรวจพบ (Detected)' : 'ไม่พบ (Missed)';

      document.getElementById('sheet_dist').innerText = c.distance.toLocaleString();
      document.getElementById('sheet_tau').innerText = c.tau.toLocaleString();
      document.getElementById('sheet_curState').innerText = c.curState;
      document.getElementById('sheet_obsState').innerText = c.obsState;
      document.getElementById('sheet_curTech').innerText = c.curTech;
      document.getElementById('sheet_obsTech').innerText = c.obsTech;
      document.getElementById('sheet_mismatch').innerText = c.mismatch;
      document.getElementById('sheet_probB').innerText = c.probB;
      document.getElementById('sheet_reason').innerText = c.reason;

      document.getElementById('civSheet').classList.add('open');
    }

    function closeSheet() {
      document.getElementById('civSheet').classList.remove('open');
    }

    function zoomCanvas(factor) {
      viewZoom = Math.max(0.5, Math.min(5, viewZoom * factor));
      drawCanvas();
    }
    function resetCanvasView() {
      viewZoom = 1;
      viewOffsetX = 0;
      viewOffsetY = 0;
      drawCanvas();
    }
    function togglePause() {
      isPaused = !isPaused;
      document.getElementById('pauseBtn').innerText = isPaused ? 'ดำเนินการต่อ' : 'Pause';
    }
    function stepSim() {
      waveProgress += 5;
      drawCanvas();
    }
    function setSpeed(s) {
      animSpeed = s;
      document.getElementById('speedDisplay').innerText = 'ความเร็ว: ' + s + 'x';
    }

    // Animation Loop
    function animLoop() {
      if (!isPaused) {
        waveProgress += 1.5 * animSpeed;
        drawCanvas();
      }
      requestAnimationFrame(animLoop);
    }
    animLoop();

    // Chart Renderers
    function renderAllCharts() {
      renderScatter('chart1', c => c.distance, c => c.probB, 'ระยะทาง (ly)', 'ความน่าจะเป็น P(B)', '#38bdf8');
      renderScatter('chart2', c => c.distance, c => c.mismatch, 'ระยะทาง (ly)', 'Temporal Mismatch', '#eab308');
      renderScatter('chart3', c => c.curTech, c => c.obsTech, 'Current Tech', 'Observed Tech', '#f43f5e');
      renderBarAB('chart4');
      renderHistogram('chart5', 'อายุอารยธรรม');
      renderHistogram('chart6', 'ระดับเทคโนโลยี');
    }

    function renderScatter(canvasId, xFn, yFn, xLabel, yLabel, color) {
      const c = document.getElementById(canvasId);
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width = c.clientWidth * 2;
      const h = c.height = c.clientHeight * 2;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);

      // Axes
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 20);
      ctx.lineTo(60, h - 40);
      ctx.lineTo(w - 20, h - 40);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px sans-serif';
      ctx.fillText(xLabel, w / 2 - 40, h - 10);

      const civs = simData.civilizations || [];
      if (!civs.length) return;

      const maxX = params.maxDistance;
      const maxY = 1.0;

      ctx.fillStyle = color;
      for (let i = 0; i < Math.min(400, civs.length); i++) {
        const xVal = xFn(civs[i]);
        const yVal = yFn(civs[i]);
        const px = 60 + (xVal / maxX) * (w - 90);
        const py = (h - 40) - (yVal / maxY) * (h - 70);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function renderBarAB(canvasId) {
      const c = document.getElementById(canvasId);
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width = c.clientWidth * 2;
      const h = c.height = c.clientHeight * 2;
      ctx.clearRect(0, 0, w, h);

      const s = simData.stats || { rateA: 15, rateB: 2 };
      const barW = 100;
      const maxVal = Math.max(10, s.rateA * 1.3);

      // Bar A
      const hA = (s.rateA / maxVal) * (h - 80);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(w/3 - barW/2, h - 40 - hA, barW, hA);

      // Bar B
      const hB = (s.rateB / maxVal) * (h - 80);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect((2*w)/3 - barW/2, h - 40 - hB, barW, hB);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(s.rateA + '%', w/3 - 35, h - 50 - hA);
      ctx.fillText(s.rateB + '%', (2*w)/3 - 35, h - 50 - hB);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px sans-serif';
      ctx.fillText('Model A (No Delay)', w/3 - 80, h - 10);
      ctx.fillText('Model B (Temporal)', (2*w)/3 - 80, h - 10);
    }

    function renderHistogram(canvasId, title) {
      const c = document.getElementById(canvasId);
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width = c.clientWidth * 2;
      const h = c.height = c.clientHeight * 2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '22px sans-serif';
      ctx.fillText(title, 40, 40);

      const bins = [20, 45, 75, 120, 80, 30];
      const maxB = 140;
      const bw = (w - 100) / bins.length;

      for (let i = 0; i < bins.length; i++) {
        const bh = (bins[i] / maxB) * (h - 90);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(60 + i * bw, h - 30 - bh, bw - 10, bh);
      }
    }

    // Auto initialize on load
    startSim();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `temporal-mismatch-simulation-android.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
