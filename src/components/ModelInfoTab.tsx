import React from 'react';
import {
  BookOpen,
  Atom,
  Binary,
  HelpCircle,
  Smartphone,
  CheckCircle,
  Radio,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

export const ModelInfoTab: React.FC = () => {
  return (
    <div className="space-y-4 pb-16 max-w-4xl mx-auto text-slate-200">
      {/* Introduction Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-sm sm:text-base font-bold font-tech text-slate-100">
            แนวคิดและหลักการทางวิทยาศาสตร์ (Scientific Background)
          </h2>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
          <b>Temporal Mismatch Hypothesis for SETI</b> (สมมติฐานความเหลื่อมล้ำทางเวลาในโครงการค้นหาสิ่งมีชีวิตทรงภูมิปัญญาต่างดาว) 
          เป็นทฤษฎีที่ชี้ให้เห็นว่า แม้ในทางทฤษฎีจะมีอารยธรรมต่างดาวถือกำเนิดขึ้นมากมายในกาแล็กซีทางช้างเผือก (ตามสมการ Drake Equation) 
          แต่โอกาสที่มนุษย์โลกจะตรวจพบสัญญาณ <b>Technosignature</b> นั้นกลับต่ำมากอันเนื่องมาจาก <b>ความเร็วแสงที่จำกัด (Finite Speed of Light, c)</b> 
          ทำให้เกิดความไม่สอดคล้องระหว่างช่วงเวลาที่อารยธรรมส่งสัญญาณ กับช่วงเวลาที่คลื่นเดินทางมาถึงโลก
        </p>
      </div>

      {/* Equations Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Atom className="w-5 h-5" />
          <h3 className="text-sm sm:text-base font-bold font-tech text-slate-100">
            สมการหลักของโมเดล (Core Mathematical Equations)
          </h3>
        </div>

        {/* Eq 1: Light travel time */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="text-xs font-semibold text-cyan-400">
            1. เวลาการเดินทางของแสง (Light Travel Time: τ)
          </div>
          <div className="text-sm font-mono text-cyan-200 bg-cyan-950/40 px-3 py-2 rounded-lg border border-cyan-800/40">
            τ = distance / c
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            เมื่อกำหนดให้ระยะทาง (distance) มีหน่วยเป็น <b>ปีแสง (Light-Years)</b> และความเร็วแสง c = 1 ปีแสงต่อปี 
            ทำให้ค่าเวลาที่แสงใช้เดินทาง <b>τ (ปี)</b> มีค่าเท่ากับตัวเลขระยะทาง (ปีแสง) โดยตรง
          </p>
        </div>

        {/* Eq 2: Observation Time */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="text-xs font-semibold text-sky-400">
            2. เวลาและประวัติศาสตร์ที่โลกสังเกตเห็น (Observation Time: t_obs)
          </div>
          <div className="text-sm font-mono text-sky-200 bg-sky-950/40 px-3 py-2 rounded-lg border border-sky-800/40">
            t_obs = t_current − τ
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ภาพและสัญญาณที่โลกสังเกตเห็นในกาลเวลาปัจจุบัน t_current แท้จริงแล้วเป็นสถานะของอารยธรรมในอดีตเมื่อ t_obs ปีก่อน 
            หากอารยธรรมอยู่ห่างออกไป 50,000 ปีแสง เรากำลังมองเห็นสิ่งที่เกิดขึ้นเมื่อ 50,000 ปีที่แล้ว
          </p>
        </div>

        {/* Eq 3: Temporal Mismatch */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="text-xs font-semibold text-amber-400">
            3. ความเหลื่อมล้ำทางเทคโนโลยีและกาลเวลา (Temporal Mismatch: ΔK)
          </div>
          <div className="text-sm font-mono text-amber-200 bg-amber-950/40 px-3 py-2 rounded-lg border border-amber-800/40">
            ΔK = K(t_current) − K(t_obs)
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ผลต่างระหว่างระดับเทคโนโลยีจริงในปัจจุบัน K(t_current) กับระดับเทคโนโลยีที่โลกสังเกตได้ K(t_obs) 
            หากอารยธรรมพัฒนาเร็วมากหรืออยู่ไกลมาก ΔK จะมีค่าสูง ซึ่งนำไปสู่ปรากฏการณ์ "สัญญาณล้าสมัย" หรือ "อารยธรรมสูญสิ้นไปแล้วแต่สัญญาณเพิ่งมาถึง"
          </p>
        </div>

        {/* Eq 4: Detection Window Co-temporality */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="text-xs font-semibold text-emerald-400">
            4. เงื่อนไขการตัดผ่านของหน้าต่างเวลา (Co-temporal Detection Window)
          </div>
          <div className="text-xs font-mono text-emerald-200 bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-800/40">
            (t_birth + τ) ≤ t_current ≤ (t_birth + L_signal + τ)
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            โลกจะสามารถตรวจพบ Technosignature ได้ก็ต่อเมื่อหน้าคลื่นสัญญาณที่เริ่มส่งเมื่อ t_birth เคลื่อนที่มาถึงโลก 
            และยังไม่สิ้นสุดอายุของสัญญาณ L_signal หากสัญญาณมาไม่ถึง หรือเคลื่อนผ่านโลกไปแล้วหลายพันปีก่อนมนุษย์ประดิษฐ์กล้องโทรทรรศน์วิทยุ โอกาสตรวจพบจะเป็นศูนย์ทันที
          </p>
        </div>
      </div>

      {/* Variables Explanation Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Binary className="w-5 h-5" />
          <h3 className="text-sm sm:text-base font-bold font-tech text-slate-100">
            คำอธิบายตัวแปรทุกตัวในระบบจำลอง (Variable Dictionary)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-2.5">ตัวแปร</th>
                <th className="py-2 px-2.5">ความหมายภาษาไทย</th>
                <th className="py-2 px-2.5">หน่วย / ช่วงค่า</th>
                <th className="py-2 px-2.5">บทบาทในโมเดล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-[11px]">
              <tr>
                <td className="py-2 px-2.5 font-mono text-cyan-300 font-bold">civCount (N)</td>
                <td className="py-2 px-2.5 text-slate-200">จำนวนอารยธรรมจำลอง</td>
                <td className="py-2 px-2.5 text-slate-400">100 - 150,000 แห่ง</td>
                <td className="py-2 px-2.5 text-slate-300">ขนาดกลุ่มตัวอย่างประชากรเพื่อประเมินความน่าจะเป็นเชิงสถิติ</td>
              </tr>
              <tr>
                <td className="py-2 px-2.5 font-mono text-cyan-300 font-bold">distance (d)</td>
                <td className="py-2 px-2.5 text-slate-200">ระยะห่างจากโลก</td>
                <td className="py-2 px-2.5 text-slate-400">10 - 150,000 ปีแสง</td>
                <td className="py-2 px-2.5 text-slate-300">เป็นตัวกำหนดระยะเวลาที่คลื่นแสงใช้เดินทาง และการลดทอนของฟลักซ์สัญญาณ (1/d²)</td>
              </tr>
              <tr>
                <td className="py-2 px-2.5 font-mono text-cyan-300 font-bold">tau (τ)</td>
                <td className="py-2 px-2.5 text-slate-200">เวลาการเดินทางของแสง</td>
                <td className="py-2 px-2.5 text-slate-400">ปี (Years)</td>
                <td className="py-2 px-2.5 text-slate-300">τ = d / c กำหนดว่าข้อมูลที่เราเห็นนั้นเก่ากว่าปัจจุบันกี่ปี</td>
              </tr>
              <tr>
                <td className="py-2 px-2.5 font-mono text-cyan-300 font-bold">lifetime (L)</td>
                <td className="py-2 px-2.5 text-slate-200">อายุขัยของอารยธรรม</td>
                <td className="py-2 px-2.5 text-slate-400">1,000 - 5,000,000 ปี</td>
                <td className="py-2 px-2.5 text-slate-300">ช่วงเวลาตั้งแต่ถือกำเนิดจนถึงการล่มสลายหรือวิวัฒน์พ้นสถานะดั้งเดิม</td>
              </tr>
              <tr>
                <td className="py-2 px-2.5 font-mono text-cyan-300 font-bold">signalLifetime</td>
                <td className="py-2 px-2.5 text-slate-200">อายุของ Technosignature</td>
                <td className="py-2 px-2.5 text-slate-400">100 - 100,000 ปี</td>
                <td className="py-2 px-2.5 text-slate-300">ระยะเวลาที่มีการแพร่กระจายคลื่นวิทยุ/เลเซอร์ที่มนุษย์สามารถดักฟังสัญญาณได้</td>
              </tr>
              <tr>
                <td className="py-2 px-2.5 font-mono text-cyan-300 font-bold">techGrowthRate (k)</td>
                <td className="py-2 px-2.5 text-slate-200">อัตราการพัฒนาเทคโนโลยี</td>
                <td className="py-2 px-2.5 text-slate-400">0.001 - 0.050</td>
                <td className="py-2 px-2.5 text-slate-300">ความชันของฟังก์ชัน K(t) บ่งบอกว่าอารยธรรมก้าวกระโดดเร็วเพียงใด</td>
              </tr>
              <tr>
                <td className="py-2 px-2.5 font-mono text-cyan-300 font-bold">directionality</td>
                <td className="py-2 px-2.5 text-slate-200">ทิศทางการส่งสัญญาณ</td>
                <td className="py-2 px-2.5 text-slate-400">0.0 ถึง 1.0</td>
                <td className="py-2 px-2.5 text-slate-300">0 = กระจายทุกทิศ (Isotropic), 1 = บีมเลเซอร์ลำแคบเข้มข้นตรงมายังโลก</td>
              </tr>
              <tr>
                <td className="py-2 px-2.5 font-mono text-cyan-300 font-bold">detectorSensitivity</td>
                <td className="py-2 px-2.5 text-slate-200">ความไวของเครื่องตรวจจับ</td>
                <td className="py-2 px-2.5 text-slate-400">0.1 ถึง 1.0</td>
                <td className="py-2 px-2.5 text-slate-300">ขีดความสามารถของกล้องโทรทรรศน์วิทยุและอัลกอริทึมบนโลก</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Pillars of Science vs Assumptions Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Layers className="w-5 h-5" />
          <h3 className="text-sm sm:text-base font-bold font-tech text-slate-100">
            การจำแนกประเภท: ฟิสิกส์จริง vs สมมติฐาน vs ค่าสุ่ม
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Pillar 1 */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/50">
            <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>1. หลักฟิสิกส์ที่พิสูจน์แล้ว</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>ความเร็วแสงในสุญญากาศมีค่าจำกัด (c ≈ 300,000 กม./วินาที)</li>
              <li>การลดทอนของฟลักซ์พลังงานคลื่นแม่เหล็กไฟฟ้าตามระยะทางกำลังสอง (Inverse-Square Law)</li>
              <li>ข้อมูลไม่สามารถเคลื่อนที่เร็วกว่าแสงได้</li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50">
            <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>2. สมมติฐานของแบบจำลอง</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>รูปแบบการเติบโตทางเทคโนโลยีเป็นไปตามเส้นโค้ง Logistic / Exponential</li>
              <li>อารยธรรมมีการส่ง Technosignature ออกสู่อวกาศในช่วงเวลาหนึ่ง</li>
              <li>การประเมินว่าเทคโนโลยีระดับต่ำกว่า 0.05 ตรวจจับไม่ได้</li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50">
            <div className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. ค่าสุ่มเพื่อการทดลอง</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>พิกัดและมุมการวางตัวของอารยธรรมรอบโลก</li>
              <li>เวลาการถือกำเนิดที่แน่นอน (Birth Epoch)</li>
              <li>ทิศทางการบีมสัญญาณและการเบี่ยงเบนเล็กน้อยของกำลังส่ง</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Android Usage Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2 text-cyan-400">
          <Smartphone className="w-5 h-5" />
          <h3 className="text-sm sm:text-base font-bold font-tech text-slate-100">
            วิธีเปิดใช้งานบนมือถือ Android (Mobile Instructions)
          </h3>
        </div>
        <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
          <p>
            1. <b>เปิดผ่านเบราว์เซอร์</b>: ใช้งานได้ทันทีบน Google Chrome, Samsung Internet, Firefox บน Android ทุกรุ่น
          </p>
          <p>
            2. <b>เพิ่มลงในหน้าจอหลัก (PWA Mode)</b>: กดปุ่มเมนู 3 จุด (⋮) ใน Chrome แล้วเลือก <i>"เพิ่มลงในหน้าจอหลัก" (Add to Home screen)</i> เพื่อเปิดใช้งานแบบเต็มหน้าจอเหมือนแอปมือถือ
          </p>
          <p>
            3. <b>ใช้งานออฟไลน์ (Standalone HTML)</b>: กดปุ่ม <i>"ดาวน์โหลดไฟล์เดี่ยว HTML"</i> ด้านบนเพื่อบันทึกไฟล์ <code>.html</code> ไว้บนเครื่อง สามารถเปิดทดลองได้ตลอดเวลาโดยไม่ต้องต่ออินเทอร์เน็ต
          </p>
        </div>
      </div>

      {/* Explicit Scientific Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/60 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
        <HelpCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-rose-300">ข้อควรระวังทางวิชาการ: </span>
          แบบจำลองนี้สร้างขึ้นเพื่อเป็นเครื่องมือเชิงการศึกษาและวิจัย เพื่อสาธิตผลกระทบทางคณิตศาสตร์ของความเร็วแสงที่มีต่อการดักฟังสัญญาณอวกาศ (SETI)
          <b> ไม่สามารถนำผลลัพธ์นี้ไปอ้างอิงเป็นหลักฐานทางกายภาพว่ามีสิ่งมีชีวิตทรงภูมิปัญญาต่างดาวอยู่จริง</b>
        </div>
      </div>
    </div>
  );
};
