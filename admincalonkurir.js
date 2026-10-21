import{initializeApp,getApps,getApp}from"./fb.js";import{getDatabase,ref,push,set,update,remove,onValue}from"./fb.js";const firebaseConfig={apiKey:"AIzaSyDweL8xXcOu6ZODYzCa1KpqZVPLH5Ocijk",authDomain:"aplikasi-sahabatkugroup.firebaseapp.com",databaseURL:"https://aplikasi-sahabatkugroup-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"aplikasi-sahabatkugroup",storageBucket:"aplikasi-sahabatkugroup.firebasestorage.app",messagingSenderId:"323288632862",appId:"1:323288632862:web:57f12fbb5b18ad0fbd680f",measurementId:"G-788RL05MFR"},ackApp=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(ackApp);let cloudCalonKurir={},cloudPenilaian={},cloudUsersList={},cloudLeaderListAck={},ackCurrentScreen=null,ackQueueTimer=null,ackListOpen=!1;const ACK_SCORE_FIELDS=[{key:"kehadiran",label:"Kehadiran & Disiplin \u2014 Tepat waktu & patuh jadwal",max:10,group:"1\uFE0F\u20E3 Kehadiran & Disiplin"},{key:"etika",label:"Peraturan & etika",max:10,group:"2\uFE0F\u20E3 Pemahaman Materi"},{key:"sop",label:"SOP harian",max:10,group:"2\uFE0F\u20E3 Pemahaman Materi"},{key:"aplikasi",label:"Aplikasi kurir",max:10,group:"2\uFE0F\u20E3 Pemahaman Materi"},{key:"attitude",label:"Perilaku & attitude",max:5,group:"3\uFE0F\u20E3 Kesiapan Kurir (Attitude & Mental)"},{key:"tanggungjawab",label:"Tanggung jawab",max:5,group:"3\uFE0F\u20E3 Kesiapan Kurir (Attitude & Mental)"},{key:"kejujuran",label:"Kejujuran",max:5,group:"3\uFE0F\u20E3 Kesiapan Kurir (Attitude & Mental)"},{key:"ketelitian",label:"Alamat, barang, update order, komunikasi customer",max:10,group:"4\uFE0F\u20E3 Ketelitian Kerja"},{key:"praktik",label:"Ikuti arahan & siap antar (didampingi Trainer)",max:20,group:"5\uFE0F\u20E3 Praktik Lapangan"}],ACK_KELENGKAPAN_ITEMS=[{key:"sim",label:"SIM",max:2},{key:"stnk",label:"STNK",max:2},{key:"helm",label:"Helm",max:2},{key:"helm2",label:"Helm 2 (opsional)",max:1},{key:"jashujan",label:"Jas Hujan",max:2},{key:"sarungtangan",label:"Sarung Tangan",max:2},{key:"sepatu",label:"Sepatu",max:2},{key:"motor",label:"Motor",max:2}];function ackQueueRender(){ackQueueTimer&&clearTimeout(ackQueueTimer),ackQueueTimer=setTimeout(()=>{ackQueueTimer=null,ackRenderActiveScreen(),ackUpdateMenuBadge()},120)}function ackPasangListener(){onValue(ref(db,"calon_kurir"),snap=>{cloudCalonKurir=snap.val()||{},ackQueueRender()}),onValue(ref(db,"penilaian_calon_kurir"),snap=>{cloudPenilaian=snap.val()||{},ackQueueRender()}),onValue(ref(db,"users"),snap=>{cloudUsersList=snap.val()||{}}),onValue(ref(db,"leader_list"),snap=>{cloudLeaderListAck=snap.val()||{},ackPopulateLeaderSelect()})}window.sdOnAdmin?window.sdOnAdmin(ackPasangListener):ackPasangListener();function ackToast(msg,type){typeof window.toast=="function"?window.toast(msg,type):alert(msg)}async function ackConfirm(msg){return typeof window.showConfirm=="function"?await window.showConfirm(msg):confirm(msg)}function ackEsc(str){return String(str??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c])}function ackTodayISO(){const d=new Date,off=d.getTimezoneOffset()*6e4;return new Date(d.getTime()-off).toISOString().slice(0,10)}function ackCurrentMonthISO(){const d=new Date;return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}function ackFormatTanggal(iso){if(!iso)return"-";const bulan=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"],[y,m,d]=String(iso).split("-");return!y||!m||!d?iso:`${parseInt(d)} ${bulan[parseInt(m)-1]||m} ${y}`}function ackGetSession(){try{return JSON.parse(localStorage.getItem("sahabatku_session")||"null")}catch{return null}}function ackHitungHasil(total){return total>=90?{label:"LULUS",cls:"tr-hasil-lulus",emoji:"\u2705"}:total>=80?{label:"EVALUASI",cls:"tr-hasil-evaluasi",emoji:"\u23F3"}:{label:"TIDAK LULUS",cls:"tr-hasil-tidaklulus",emoji:"\u274C"}}function ackLastPenilaian(candidateId){const riwayat=Object.entries(cloudPenilaian||{}).filter(([,p])=>p&&p.calonKurirId===candidateId).sort((a,b)=>(b[1].createdAt||0)-(a[1].createdAt||0));return riwayat.length?riwayat[0][1]:null}function ackPengajuanBadgeHtml(c){const s=c&&c.statusPengajuan;return s==="diajukan"?'<span class="pm-chip" style="background:#fef3c7;color:#b45309;border-color:#fde68a;">Menunggu Persetujuan</span>':s==="disetujui"?'<span class="pm-chip pm-chip-approved">Disetujui - Sudah Jadi Kurir</span>':s==="ditolak"?'<span class="pm-chip pm-chip-rejected">Ditolak</span>':'<span class="pm-chip" style="background:#f1f5f9;color:#64748b;">Belum Diajukan Trainer</span>'}function ackInjectStyle(){if(document.getElementById("ack-style"))return;const css=`
    #ack-root .screen { display:none; min-height:100vh; }
    #ack-root .screen.active { display:flex; flex-direction:column; }
    .ack-check-row{ display:flex; align-items:center; justify-content:space-between; gap:10px;
      padding:10px 12px; border-radius:12px; background:#f8fafc; border:1px solid #eef2f7; cursor:pointer;
      transition:background .12s ease, border-color .12s ease; }
    .dark .ack-check-row{ background:#16213a; border-color:#243047; }
    .ack-check-row.is-on{ background:rgba(5,150,105,.08); border-color:rgba(5,150,105,.35); }
    .dark .ack-check-row.is-on{ background:rgba(5,150,105,.18); }
    .ack-check-row .trc-label{ font-size:12px; font-weight:700; color:#334155; }
    .dark .ack-check-row .trc-label{ color:#e2e8f0; }
    .ack-check-row .trc-toggle{ width:38px; height:22px; border-radius:999px; background:#cbd5e1; position:relative; flex-shrink:0; transition:background .15s ease; }
    .ack-check-row .trc-toggle::after{ content:''; position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.25); transition:transform .15s ease; }
    .ack-check-row.is-on .trc-toggle{ background:#059669; }
    .ack-check-row.is-on .trc-toggle::after{ transform:translateX(16px); }
    .ack-list-heading, .ack-form-heading{ font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.04em; color:#64748b; }
    .dark .ack-list-heading, .dark .ack-form-heading{ color:#94a3b8; }
    .ack-toggle-btn{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:800; text-transform:uppercase;
      padding:8px 14px; border-radius:12px; background:#1e293b; color:#fff; }
    .dark .ack-toggle-btn{ background:#334155; }
    .ack-toggle-btn.is-open i{ transform:rotate(180deg); }
    .ack-stat-tile-solid{ background:#FFF7ED !important; border-color:#FED7AA !important; }
    .dark .ack-stat-tile-solid{ background:rgba(194,65,12,.15) !important; border-color:rgba(194,65,12,.35) !important; }
    .ack-stat-tile-solid .l{ color:#C2410C !important; }
    .ack-stat-tile-solid .n{ color:#9A3412 !important; }
    .dark .ack-stat-tile-solid .l{ color:#FDBA74 !important; }
    .dark .ack-stat-tile-solid .n{ color:#FED7AA !important; }
    `,style=document.createElement("style");style.id="ack-style",style.textContent=css,document.head.appendChild(style)}const ACK_BERKAS_ITEMS=[{key:"ktp",label:"Fotokopi KTP"},{key:"kk",label:"Fotokopi KK"},{key:"simc",label:"Fotokopi SIM C Aktif"},{key:"skck",label:"SKCK (Jika Ada)"},{key:"bpjs",label:"BPJS Kesehatan"},{key:"foto",label:"Pas Foto 3x4"}],ACK_PERLENGKAPAN_ITEMS=[{key:"helm1",label:"Helm (1)"},{key:"helm2",label:"Helm (2) \u2014 opsional"},{key:"jashujan1",label:"Jas Hujan (1)"},{key:"jashujan2",label:"Jas Hujan (2) \u2014 opsional"}],ACK_VERIF_ITEMS=[{key:"interview",label:"Sudah Interview"},{key:"lulusSeleksi",label:"Lulus Seleksi"},{key:"training",label:"Sudah Training"},{key:"akunAktif",label:"Akun Aktif"},{key:"setujuSop",label:"Sudah Menyetujui SOP"},{key:"bayarDeposit",label:"Sudah Bayar Deposit & Administrasi"},{key:"terimaPerlengkapan",label:"Sudah Terima Perlengkapan"},{key:"aktifKurir",label:"Aktif Menjadi Kurir"}];function ackScreensHtml(){return`
    <!-- ================= DAFTAR CALON KURIR ================= -->
    <div id="screen-admin-calon-kurir" class="screen">
        <div class="pm-body">
            <div style="background:linear-gradient(135deg,#C2410C 0%,#EA580C 55%,#F97316 100%);color:#fff;padding:16px;border-radius:22px;margin-bottom:14px;position:relative;overflow:hidden;box-shadow:0 16px 32px -18px rgba(194,65,12,.5);">
                <div style="pointer-events:none;position:absolute;right:-30px;top:-40px;width:130px;height:130px;border-radius:999px;background:rgba(255,255,255,.15);filter:blur(2px);"></div>
                <div style="position:relative;display:flex;align-items:center;gap:10px;">
                    <div style="width:40px;height:40px;border-radius:14px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i data-lucide="user-plus" class="w-5 h-5"></i></div>
                    <div>
                        <h3 style="font-size:15px;font-weight:900;line-height:1;">Data Calon Kurir</h3>
                        <p style="font-size:10.5px;color:rgba(255,255,255,.85);margin-top:4px;">Seleksi &amp; pengajuan dari Trainer</p>
                    </div>
                </div>
            </div>
            <div class="pm-stats" style="margin-bottom:12px;">
                <div class="pm-stat-tile ack-stat-tile-solid"><p class="l">Total</p><p class="n" id="ack-stat-total">0</p></div>
                <div class="pm-stat-tile ack-stat-tile-solid"><p class="l">Menunggu</p><p class="n" id="ack-stat-menunggu">0</p></div>
                <div class="pm-stat-tile ack-stat-tile-solid"><p class="l">Disetujui</p><p class="n" id="ack-stat-disetujui">0</p></div>
            </div>
            <div class="pm-card space-y-2">
                <input id="ack-list-search" oninput="window.__ack.renderList()" class="pm-input" placeholder="Cari nama / NIK / no HP...">
                <div>
                    <label class="pm-label">Filter Bulan Training</label>
                    <div class="flex gap-2">
                        <input id="ack-list-bulan" type="month" oninput="window.__ack.renderList()" class="pm-input">
                        <button onclick="document.getElementById('ack-list-bulan').value='';window.__ack.renderList()" class="ack-toggle-btn" style="flex:0 0 auto;">Semua</button>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between gap-2 mt-3">
                <h4 class="ack-list-heading">Daftar Calon Kurir</h4>
                <button onclick="window.__ack.toggleListOpen()" class="ack-toggle-btn">
                    <span id="ack-toggle-list-text">Buka</span>
                    <i data-lucide="chevron-down" id="ack-toggle-list-icon" class="w-3.5 h-3.5 transition-transform"></i>
                </button>
            </div>
            <div id="ack-list-wrap" class="hidden">
                <div id="ack-list-container" class="mt-3"></div>
            </div>
        </div>
    </div>

    <!-- ================= FORM EDIT CALON KURIR ================= -->
    <div id="screen-admin-calon-kurir-form" class="screen">
        <div class="pm-body" style="padding-bottom:110px">
            <div class="flex items-center justify-between mb-2">
                <h2 class="ack-form-heading">Kelola Data Calon Kurir</h2>
                <button onclick="window.__ack.go('screen-admin-calon-kurir')" class="ack-toggle-btn">Batal</button>
            </div>
            <input type="hidden" id="ack-f-id">

            <div class="pm-section-title"><i data-lucide="id-card" class="w-3.5 h-3.5"></i>Data Diri</div>
            <div class="pm-card space-y-3">
                <div><label class="pm-label">Nama Lengkap</label><input id="ack-f-nama" class="pm-input" placeholder="Nama lengkap sesuai KTP"></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="pm-label">Jenis Kelamin</label>
                        <select id="ack-f-gender" class="pm-select">
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                    <div><label class="pm-label">NIK KTP</label><input id="ack-f-nik" inputmode="numeric" maxlength="16" class="pm-input" placeholder="16 digit NIK"></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="pm-label">Tempat Lahir</label><input id="ack-f-tempat-lahir" class="pm-input" placeholder="Kota lahir"></div>
                    <div><label class="pm-label">Tanggal Lahir</label><input id="ack-f-tanggal-lahir" type="date" class="pm-input"></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="pm-label">No. ID Card</label><input id="ack-f-id-card" class="pm-input" placeholder="Nomor ID Card (boleh kosong)"></div>
                    <div><label class="pm-label">Tanggal Training</label><input id="ack-f-tgl-training" type="date" class="pm-input"></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="pm-label">No HP Aktif/WA</label><input id="ack-f-hp-aktif" inputmode="numeric" class="pm-input" placeholder="08xxxxxxxxxx"></div>
                    <div><label class="pm-label">No HP Kurir</label><input id="ack-f-hp-kurir" inputmode="numeric" class="pm-input" placeholder="08xxxxxxxxxx"></div>
                </div>
                <div><label class="pm-label">Alamat Domisili</label><textarea id="ack-f-alamat" rows="2" class="pm-textarea" placeholder="Alamat domisili lengkap"></textarea></div>
                <div><label class="pm-label">Pekerjaan Lainnya</label><input id="ack-f-pekerjaan-lain" class="pm-input" placeholder="Kalau ada pekerjaan sampingan"></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="pm-label">Nama Bank / E-Wallet</label><input id="ack-f-bank-nama" class="pm-input" placeholder="Contoh: BCA / DANA"></div>
                    <div><label class="pm-label">No. Rekening / E-Wallet</label><input id="ack-f-bank-nomor" inputmode="numeric" class="pm-input" placeholder="Nomor rekening/ewallet"></div>
                </div>
                <div><label class="pm-label">Status Pernikahan</label>
                    <select id="ack-f-status-nikah" class="pm-select">
                        <option value="Belum Menikah">Belum Menikah</option>
                        <option value="Menikah">Menikah</option>
                        <option value="Cerai">Cerai</option>
                    </select>
                </div>
                <div><label class="pm-label">No. BPJS Kesehatan</label><input id="ack-f-bpjs" inputmode="numeric" class="pm-input" placeholder="Nomor BPJS Kesehatan"></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="pm-label">Kelas BPJS</label>
                        <select id="ack-f-bpjs-kelas" class="pm-select">
                            <option value="">-- Pilih Kelas --</option>
                            <option value="Kelas I">Kelas I</option>
                            <option value="Kelas II">Kelas II</option>
                            <option value="Kelas III">Kelas III</option>
                        </select>
                    </div>
                    <div><label class="pm-label">Biaya BPJS / Bulan</label><input id="ack-f-bpjs-biaya" inputmode="numeric" class="pm-input" placeholder="Contoh: 150000"></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="pm-label">Nama Kontak Darurat</label><input id="ack-f-darurat-nama" class="pm-input" placeholder="Nama kontak darurat"></div>
                    <div><label class="pm-label">Hubungan Keluarga</label><input id="ack-f-darurat-hubungan" class="pm-input" placeholder="Contoh: Orang Tua / Kakak"></div>
                </div>
                <div><label class="pm-label">No HP Kontak Darurat</label><input id="ack-f-darurat-hp" inputmode="numeric" class="pm-input" placeholder="08xxxxxxxxxx"></div>
                <div><label class="pm-label">Catatan Khusus</label><textarea id="ack-f-catatan" rows="2" class="pm-textarea" placeholder="Catatan tambahan (opsional)"></textarea></div>
            </div>

            <div class="pm-section-title"><i data-lucide="bike" class="w-3.5 h-3.5"></i>Data Kendaraan</div>
            <div class="pm-card space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="pm-label">Jenis Kendaraan</label>
                        <select id="ack-f-kend-jenis" class="pm-select">
                            <option value="Motor">Motor</option>
                            <option value="Mobil">Mobil</option>
                            <option value="Sepeda">Sepeda</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div><label class="pm-label">Merek</label><input id="ack-f-kend-merek" class="pm-input" placeholder="Contoh: Honda"></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="pm-label">Tipe</label><input id="ack-f-kend-tipe" class="pm-input" placeholder="Contoh: Beat"></div>
                    <div><label class="pm-label">Tahun</label><input id="ack-f-kend-tahun" inputmode="numeric" maxlength="4" class="pm-input" placeholder="Contoh: 2021"></div>
                </div>
                <div><label class="pm-label">Warna</label><input id="ack-f-kend-warna" class="pm-input" placeholder="Warna kendaraan"></div>
                <div><label class="pm-label">Nomor Polisi/Plat (opsional)</label><input id="ack-f-kend-plat" class="pm-input" placeholder="Contoh: E 1234 ABC"></div>
                <div><label class="pm-label">Nomor STNK (opsional)</label><input id="ack-f-kend-stnk" class="pm-input" placeholder="Nomor STNK"></div>
                <div><label class="pm-label">Masa Berlaku STNK (opsional)</label><input id="ack-f-kend-stnk-berlaku" type="date" class="pm-input"></div>
            </div>

            <div class="pm-section-title"><i data-lucide="file-check-2" class="w-3.5 h-3.5"></i>Checklist Kelengkapan Berkas</div>
            <div class="pm-card space-y-2" id="ack-f-berkas-wrap"></div>

            <div class="pm-section-title"><i data-lucide="package-check" class="w-3.5 h-3.5"></i>Checklist Perlengkapan Kurir</div>
            <div class="pm-card space-y-2" id="ack-f-perlengkapan-wrap"></div>

            <div class="pm-section-title"><i data-lucide="badge-check" class="w-3.5 h-3.5"></i>Status Verifikasi</div>
            <div class="pm-card space-y-2" id="ack-f-verifikasi-wrap"></div>

            <button class="pm-btn-primary flex items-center justify-center gap-2 mt-2" onclick="window.__ack.saveCandidate()">
                <i data-lucide="save" class="w-4 h-4"></i> Simpan Perubahan
            </button>
        </div>
    </div>

    <div id="ack-modal-slot"></div>
    `}function ackInjectScreens(){if(document.getElementById("ack-root"))return;const mount=document.getElementById("main-layout")||document.body,wrap=document.createElement("div");wrap.id="ack-root",wrap.innerHTML=ackScreensHtml(),mount.appendChild(wrap),ackRenderChecklistGroups();const bulanIniEl=document.getElementById("ack-list-bulan");bulanIniEl&&(bulanIniEl.value=ackCurrentMonthISO()),window.lucide&&window.lucide.createIcons()}function ackChecklistRowHtml(prefix,key,label,checked){return`<div class="ack-check-row ${checked?"is-on":""}" data-key="${key}" onclick="window.__ack.toggleCheck('${prefix}','${key}', this)">
        <span class="trc-label">${ackEsc(label)}</span>
        <span class="trc-toggle"></span>
    </div>`}let ackFormState={berkas:{},perlengkapan:{},verifikasi:{}};function ackRenderChecklistGroups(){const berkasWrap=document.getElementById("ack-f-berkas-wrap");berkasWrap&&(berkasWrap.innerHTML=ACK_BERKAS_ITEMS.map(i=>ackChecklistRowHtml("berkas",i.key,i.label,!!ackFormState.berkas[i.key])).join(""));const perlengkapanWrap=document.getElementById("ack-f-perlengkapan-wrap");perlengkapanWrap&&(perlengkapanWrap.innerHTML=ACK_PERLENGKAPAN_ITEMS.map(i=>ackChecklistRowHtml("perlengkapan",i.key,i.label,!!ackFormState.perlengkapan[i.key])).join(""));const verifWrap=document.getElementById("ack-f-verifikasi-wrap");verifWrap&&(verifWrap.innerHTML=ACK_VERIF_ITEMS.map(i=>ackChecklistRowHtml("verifikasi",i.key,i.label,!!ackFormState.verifikasi[i.key])).join(""))}const ACK_SCREENS=["screen-admin-calon-kurir","screen-admin-calon-kurir-form"];function ackAfterNavigate(screenId){if(!ACK_SCREENS.includes(screenId)){ackCurrentScreen=null;return}ackCurrentScreen=screenId,ackRenderActiveScreen()}function ackPatchNavigation(){if(window.__ackNavPatched)return;window.__ackNavPatched=!0;const origNavigateTo=window.navigateTo;window.navigateTo=function(screenId){typeof origNavigateTo=="function"&&origNavigateTo(screenId),ackAfterNavigate(screenId)}}function ackRenderActiveScreen(){ackCurrentScreen&&ackCurrentScreen==="screen-admin-calon-kurir"&&(ackRenderList(),ackApplyListOpenState())}function ackUpdateMenuBadge(){const jumlah=Object.values(cloudCalonKurir||{}).filter(c=>c&&c.statusPengajuan==="diajukan").length,badge=document.getElementById("badge-calon-kurir-menu");badge&&(jumlah>0?(badge.textContent=jumlah>9?"9+":String(jumlah),badge.classList.remove("hidden")):badge.classList.add("hidden"))}function ackCandidateCardHtml(id,c,index){const last=ackLastPenilaian(id),hasilChip=last?(()=>{const h=ackHitungHasil(last.total||0);return`<span class="tr-hasil-badge ${h.cls}" style="font-size:10px;padding:3px 9px;">${h.emoji} ${last.total||0}/100</span>`})():'<span class="pm-chip" style="background:#f1f5f9;color:#64748b">Belum dinilai</span>';return`<div class="pm-card" style="position:relative;overflow:hidden;padding-left:16px;">
        <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#fb923c,#f97316);"></div>
        <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex items-start gap-2.5">
                <div style="width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg,#fb923c,#f97316);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;flex-shrink:0;box-shadow:0 4px 10px -3px rgba(249,115,22,.45);">#${index}</div>
                <div class="min-w-0">
                    <p class="font-bold text-[13px] truncate">${ackEsc(c.nama||"-")}</p>
                    <p class="text-[10.5px] text-slate-400 truncate">NIK: ${ackEsc(c.nik||"-")}</p>
                    <p class="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><i data-lucide="phone" class="w-3 h-3"></i> ${ackEsc(c.hpAktif||"-")}</p>
                </div>
            </div>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-2.5">${hasilChip}${ackPengajuanBadgeHtml(c)}</div>
        <div class="flex gap-2 mt-3">
            <button onclick="window.__ack.showDetail('${id}')" class="pm-btn-outline flex-1">Detail</button>
            <button onclick="window.__ack.openForm('${id}')" class="pm-btn-outline flex-1" style="border-color:#c2410c;color:#c2410c">Kelola Data</button>
            <button onclick="window.__ack.deleteCandidate('${id}')" class="pm-btn-outline" style="border-color:#e11d48;color:#e11d48;flex:0 0 auto;padding-left:12px;padding-right:12px;">Hapus</button>
        </div>
    </div>`}function ackToggleListOpen(){ackListOpen=!ackListOpen,ackApplyListOpenState()}function ackApplyListOpenState(){const wrap=document.getElementById("ack-list-wrap"),text=document.getElementById("ack-toggle-list-text"),btn=text?text.closest(".ack-toggle-btn"):null;wrap&&wrap.classList.toggle("hidden",!ackListOpen),text&&(text.textContent=ackListOpen?"Tutup":"Buka"),btn&&btn.classList.toggle("is-open",ackListOpen)}function ackRenderList(){var _a,_b;const container=document.getElementById("ack-list-container");if(!container)return;const search=(((_a=document.getElementById("ack-list-search"))==null?void 0:_a.value)||"").trim().toLowerCase(),bulan=((_b=document.getElementById("ack-list-bulan"))==null?void 0:_b.value)||"",all=Object.values(cloudCalonKurir||{}),elTotal=document.getElementById("ack-stat-total"),elMenunggu=document.getElementById("ack-stat-menunggu"),elDisetujui=document.getElementById("ack-stat-disetujui");elTotal&&(elTotal.innerText=all.length),elMenunggu&&(elMenunggu.innerText=all.filter(c=>c&&c.statusPengajuan==="diajukan").length),elDisetujui&&(elDisetujui.innerText=all.filter(c=>c&&c.statusPengajuan==="disetujui").length);const entries=Object.entries(cloudCalonKurir||{}).filter(([,c])=>!c||bulan&&!(c.tglTraining||"").startsWith(bulan)?!1:search?(c.nama||"").toLowerCase().includes(search)||(c.nik||"").toLowerCase().includes(search)||(c.hpAktif||"").toLowerCase().includes(search):!0).sort((a,b)=>{const rank=s=>s==="diajukan"?0:s==="belum"||!s?1:2,ra=rank(a[1].statusPengajuan),rb=rank(b[1].statusPengajuan);return ra!==rb?ra-rb:(a[1].nama||"").localeCompare(b[1].nama||"")});if(!entries.length){container.innerHTML='<div class="pm-empty">Belum ada data calon kurir dari Trainer.</div>';return}container.innerHTML=entries.map(([id,c],i)=>ackCandidateCardHtml(id,c,i+1)).join(""),window.lucide&&window.lucide.createIcons()}function ackShowDetail(id){const c=cloudCalonKurir[id];if(!c)return ackToast("Data tidak ditemukan.");const berkasHtml=ACK_BERKAS_ITEMS.map(i=>`<span class="pm-chip ${c.berkas&&c.berkas[i.key]?"pm-chip-approved":"pm-chip-rejected"}">${ackEsc(i.label)}</span>`).join(" "),perlengkapanHtml=ACK_PERLENGKAPAN_ITEMS.map(i=>`<span class="pm-chip ${c.perlengkapan&&c.perlengkapan[i.key]?"pm-chip-approved":"pm-chip-rejected"}">${ackEsc(i.label)}</span>`).join(" "),verifHtml=ACK_VERIF_ITEMS.map(i=>`<span class="pm-chip ${c.verifikasi&&c.verifikasi[i.key]?"pm-chip-approved":"pm-chip-rejected"}">${ackEsc(i.label)}</span>`).join(" "),riwayat=Object.entries(cloudPenilaian||{}).filter(([,p])=>p&&p.calonKurirId===id).sort((a,b)=>(b[1].createdAt||0)-(a[1].createdAt||0)),last=riwayat.length?riwayat[0][1]:null,lastHasil=last?ackHitungHasil(last.total||0):null;let aksiHtml="";c.statusPengajuan==="diajukan"?lastHasil&&lastHasil.label==="LULUS"?aksiHtml=`<div class="flex gap-2 mt-3">
                <button onclick="document.getElementById('ack-modal-slot').innerHTML='';window.__ack.tolakPengajuan('${id}')" class="pm-btn-outline flex-1" style="border-color:#e11d48;color:#e11d48;">Tolak</button>
                <button onclick="window.__ack.openApproveModal('${id}')" class="pm-btn-primary flex-1" style="background:#059669;">Setujui &amp; Buat Akun Kurir</button>
            </div>`:aksiHtml=`<div class="pm-card mt-3" style="background:#fef3c7;border-color:#fde68a;">
                <p class="text-[11px] font-bold text-amber-700">Hasil penilaian belum LULUS (${lastHasil?lastHasil.label:"belum dinilai"}), belum bisa dibuatkan akun kurir.</p>
            </div>
            <button onclick="document.getElementById('ack-modal-slot').innerHTML='';window.__ack.tolakPengajuan('${id}')" class="pm-btn-outline flex-1 mt-2" style="border-color:#e11d48;color:#e11d48;width:100%;">Tolak Pengajuan</button>`:c.statusPengajuan==="disetujui"&&(aksiHtml=`<div class="pm-card mt-3" style="background:#d1fae5;border-color:#a7f3d0;">
            <p class="text-[11px] font-bold text-emerald-700">Sudah disetujui &amp; masuk Data Akun Kurir.</p>
        </div>`);const slot=document.getElementById("ack-modal-slot");slot.innerHTML=`
    <div class="pm-modal-overlay" onclick="if(event.target===this) this.remove()">
        <div class="pm-modal-sheet">
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-sm">${ackEsc(c.nama||"-")}</h3>
                <button onclick="document.getElementById('ack-modal-slot').innerHTML=''" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            <div class="mb-2">${ackPengajuanBadgeHtml(c)}</div>
            <div class="space-y-2 text-[12px]">
                <p><b>Jenis Kelamin:</b> ${ackEsc(c.gender||"-")}</p>
                <p><b>NIK:</b> ${ackEsc(c.nik||"-")}</p>
                <p><b>TTL:</b> ${ackEsc(c.tempatLahir||"-")}, ${ackFormatTanggal(c.tanggalLahir)}</p>
                <p><b>No. ID Card:</b> ${ackEsc(c.idCard||"-")}</p>
                <p><b>Tanggal Training:</b> ${ackFormatTanggal(c.tglTraining)}</p>
                <p><b>HP Aktif/WA:</b> ${ackEsc(c.hpAktif||"-")} &middot; <b>HP Kurir:</b> ${ackEsc(c.hpKurir||"-")}</p>
                <p><b>Alamat:</b> ${ackEsc(c.alamat||"-")}</p>
                <p><b>Pekerjaan Lain:</b> ${ackEsc(c.pekerjaanLain||"-")}</p>
                <p><b>Rekening/E-Wallet:</b> ${ackEsc(c.bankNama||"-")} \u2014 ${ackEsc(c.bankNomor||"-")}</p>
                <p><b>Status Pernikahan:</b> ${ackEsc(c.statusNikah||"-")}</p>
                <p><b>BPJS:</b> ${ackEsc(c.bpjs||"-")} (${ackEsc(c.bpjsKelas||"-")}, Rp ${(parseInt(c.bpjsBiaya)||0).toLocaleString("id-ID")}/bulan)</p>
                <p><b>Kontak Darurat:</b> ${ackEsc(c.daruratNama||"-")} (${ackEsc(c.daruratHubungan||"-")}) \u2014 ${ackEsc(c.daruratHp||"-")}</p>
                ${c.catatan?`<p><b>Catatan:</b> ${ackEsc(c.catatan)}</p>`:""}
            </div>
            <div class="pm-section-title mt-3"><i data-lucide="bike" class="w-3.5 h-3.5"></i>Kendaraan</div>
            <div class="space-y-1 text-[12px]">
                <p>${ackEsc(c.kendJenis||"-")} \u2014 ${ackEsc(c.kendMerek||"-")} ${ackEsc(c.kendTipe||"-")} (${ackEsc(c.kendTahun||"-")}) \u2014 ${ackEsc(c.kendWarna||"-")}</p>
                <p>Plat: ${ackEsc(c.kendPlat||"-")} &middot; STNK: ${ackEsc(c.kendStnk||"-")} &middot; Berlaku s/d: ${ackFormatTanggal(c.kendStnkBerlaku)}</p>
            </div>
            <div class="pm-section-title mt-3"><i data-lucide="file-check-2" class="w-3.5 h-3.5"></i>Kelengkapan Berkas</div>
            <div class="flex flex-wrap gap-1.5">${berkasHtml}</div>
            <div class="pm-section-title mt-3"><i data-lucide="package-check" class="w-3.5 h-3.5"></i>Perlengkapan Kurir</div>
            <div class="flex flex-wrap gap-1.5">${perlengkapanHtml}</div>
            <div class="pm-section-title mt-3"><i data-lucide="badge-check" class="w-3.5 h-3.5"></i>Status Verifikasi</div>
            <div class="flex flex-wrap gap-1.5">${verifHtml}</div>
            <div class="pm-section-title mt-3"><i data-lucide="clipboard-check" class="w-3.5 h-3.5"></i>Riwayat Penilaian</div>
            ${riwayat.length?riwayat.map(([pid,p])=>{const h=ackHitungHasil(p.total||0),scores=p.scores||{},kelengkapan=scores.kelengkapan||{},rincianHtml=ACK_SCORE_FIELDS.map(f=>{const nilai=Math.max(0,Math.min(f.max,parseInt(scores[f.key])||0)),pct=f.max>0?Math.round(nilai/f.max*100):0;return`<div style="margin-bottom:7px;">
                        <div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:2px;">
                            <span style="color:#64748b;">${ackEsc(f.label)}</span>
                            <span style="font-weight:800;">${nilai}/${f.max}</span>
                        </div>
                        <div style="height:5px;border-radius:99px;background:#e2e8f0;overflow:hidden;">
                            <div style="height:100%;border-radius:99px;width:${pct}%;background:${pct>=70?"#10B981":pct>=40?"#F59E0B":"#F43F5E"};"></div>
                        </div>
                    </div>`}).join(""),kelengkapanHtml=ACK_KELENGKAPAN_ITEMS.map(k=>{const nilai=Math.max(0,Math.min(k.max,parseInt(kelengkapan[k.key])||0));return`<span class="pm-chip ${nilai>=k.max?"pm-chip-approved":"pm-chip-rejected"}">${ackEsc(k.label)} (${nilai}/${k.max})</span>`}).join(" ");return`<div class="pm-card" style="cursor:pointer;" onclick="window.__ack.toggleRiwayatDetail('${pid}')">
                    <div class="flex items-center justify-between">
                        <div class="min-w-0"><p class="font-bold text-[12px]">${ackFormatTanggal(p.tanggalSeleksi)}</p><p class="text-[10px] text-slate-400">Trainer: ${ackEsc(p.trainerNama||"-")}</p></div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <span class="tr-hasil-badge ${h.cls}" style="font-size:11px;padding:4px 10px;">${h.emoji} ${p.total||0}/100</span>
                            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 transition-transform" id="ack-riwayat-chevron-${pid}"></i>
                        </div>
                    </div>
                    <div id="ack-riwayat-detail-${pid}" class="hidden" style="margin-top:10px;padding-top:10px;border-top:1px dashed #e2e8f0;" onclick="event.stopPropagation()">
                        <p style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:#64748b;margin-bottom:6px;">Rincian Nilai</p>
                        ${rincianHtml}
                        <p style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:#64748b;margin:10px 0 6px;">Kelengkapan</p>
                        <div class="flex flex-wrap gap-1.5">${kelengkapanHtml}</div>
                        ${p.catatan?`<p style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:#64748b;margin:10px 0 4px;">Catatan Trainer</p><p style="font-size:11.5px;color:#334155;">${ackEsc(p.catatan)}</p>`:""}
                    </div>
                </div>`}).join(""):'<div class="pm-empty">Belum ada penilaian.</div>'}
            <div class="flex gap-2 mt-3">
                <button onclick="document.getElementById('ack-modal-slot').innerHTML='';window.__ack.openForm('${id}')" class="pm-btn-outline flex-1">Edit Data</button>
                <button onclick="document.getElementById('ack-modal-slot').innerHTML='';window.__ack.deleteCandidate('${id}')" class="pm-btn-outline flex-1" style="border-color:#e11d48;color:#e11d48;">Hapus</button>
            </div>
            ${aksiHtml}
        </div>
    </div>`,window.lucide&&window.lucide.createIcons()}function ackToggleRiwayatDetail(pid){const el=document.getElementById(`ack-riwayat-detail-${pid}`),chev=document.getElementById(`ack-riwayat-chevron-${pid}`);el&&(el.classList.toggle("hidden"),chev&&(chev.style.transform=el.classList.contains("hidden")?"":"rotate(180deg)"))}async function ackDeleteCandidate(id){const c=cloudCalonKurir[id];if(c&&await ackConfirm(`Hapus data calon kurir "${c.nama||"-"}"? Seluruh riwayat penilaiannya juga akan dihapus. Tindakan ini tidak menghapus akun kurir yang mungkin sudah dibuat sebelumnya.`))try{await remove(ref(db,`calon_kurir/${id}`)),Object.entries(cloudPenilaian||{}).filter(([,p])=>p&&p.calonKurirId===id).map(([pid])=>pid).forEach(pid=>remove(ref(db,`penilaian_calon_kurir/${pid}`))),ackToast("Data calon kurir dihapus.")}catch(err){ackToast("Gagal menghapus: "+err.message)}}async function ackTolakPengajuan(id){const c=cloudCalonKurir[id];if(c&&await ackConfirm(`Tolak pengajuan "${c.nama||"-"}"? Trainer bisa mengajukan ulang setelah ini.`))try{await update(ref(db,`calon_kurir/${id}`),{statusPengajuan:"ditolak",tolakAt:Date.now()}),ackToast("Pengajuan ditolak.")}catch(err){ackToast("Gagal menolak pengajuan: "+err.message)}}function ackToggleCheck(prefix,key,el){ackFormState[prefix]||(ackFormState[prefix]={}),ackFormState[prefix][key]=!ackFormState[prefix][key],el&&el.classList.toggle("is-on",!!ackFormState[prefix][key])}function ackOpenForm(id){const c=id?cloudCalonKurir[id]:null;if(!c)return ackToast("Data calon kurir tidak ditemukan.");document.getElementById("ack-f-id").value=id;const setVal=(elId,val)=>{const el=document.getElementById(elId);el&&(el.value=val||"")};setVal("ack-f-nama",c.nama),setVal("ack-f-gender",c.gender||"Laki-laki"),setVal("ack-f-nik",c.nik),setVal("ack-f-tempat-lahir",c.tempatLahir),setVal("ack-f-tanggal-lahir",c.tanggalLahir),setVal("ack-f-id-card",c.idCard),setVal("ack-f-tgl-training",c.tglTraining),setVal("ack-f-hp-aktif",c.hpAktif),setVal("ack-f-hp-kurir",c.hpKurir),setVal("ack-f-alamat",c.alamat),setVal("ack-f-pekerjaan-lain",c.pekerjaanLain),setVal("ack-f-bank-nama",c.bankNama),setVal("ack-f-bank-nomor",c.bankNomor),setVal("ack-f-status-nikah",c.statusNikah||"Belum Menikah"),setVal("ack-f-bpjs",c.bpjs),setVal("ack-f-bpjs-kelas",c.bpjsKelas),setVal("ack-f-bpjs-biaya",c.bpjsBiaya),setVal("ack-f-darurat-nama",c.daruratNama),setVal("ack-f-darurat-hubungan",c.daruratHubungan),setVal("ack-f-darurat-hp",c.daruratHp),setVal("ack-f-catatan",c.catatan),setVal("ack-f-kend-jenis",c.kendJenis||"Motor"),setVal("ack-f-kend-merek",c.kendMerek),setVal("ack-f-kend-tipe",c.kendTipe),setVal("ack-f-kend-tahun",c.kendTahun),setVal("ack-f-kend-warna",c.kendWarna),setVal("ack-f-kend-plat",c.kendPlat),setVal("ack-f-kend-stnk",c.kendStnk),setVal("ack-f-kend-stnk-berlaku",c.kendStnkBerlaku),ackFormState={berkas:{...c.berkas||{}},perlengkapan:{...c.perlengkapan||{}},verifikasi:{...c.verifikasi||{}}},ackRenderChecklistGroups(),window.lucide&&window.lucide.createIcons(),window.__ack.go("screen-admin-calon-kurir-form")}async function ackSaveCandidate(){const id=document.getElementById("ack-f-id").value;if(!id)return ackToast("Data calon kurir tidak ditemukan.");const nama=document.getElementById("ack-f-nama").value.trim();if(!nama)return ackToast("Nama lengkap wajib diisi.","warning");const val=elId=>{var _a;return((_a=document.getElementById(elId))==null?void 0:_a.value.trim())||""},payload={nama,gender:val("ack-f-gender"),nik:val("ack-f-nik"),tempatLahir:val("ack-f-tempat-lahir"),tanggalLahir:val("ack-f-tanggal-lahir"),idCard:val("ack-f-id-card"),tglTraining:val("ack-f-tgl-training"),hpAktif:val("ack-f-hp-aktif"),hpKurir:val("ack-f-hp-kurir"),alamat:val("ack-f-alamat"),pekerjaanLain:val("ack-f-pekerjaan-lain"),bankNama:val("ack-f-bank-nama"),bankNomor:val("ack-f-bank-nomor"),statusNikah:val("ack-f-status-nikah"),bpjs:val("ack-f-bpjs"),bpjsKelas:val("ack-f-bpjs-kelas"),bpjsBiaya:val("ack-f-bpjs-biaya"),daruratNama:val("ack-f-darurat-nama"),daruratHubungan:val("ack-f-darurat-hubungan"),daruratHp:val("ack-f-darurat-hp"),catatan:val("ack-f-catatan"),kendJenis:val("ack-f-kend-jenis"),kendMerek:val("ack-f-kend-merek"),kendTipe:val("ack-f-kend-tipe"),kendTahun:val("ack-f-kend-tahun"),kendWarna:val("ack-f-kend-warna"),kendPlat:val("ack-f-kend-plat"),kendStnk:val("ack-f-kend-stnk"),kendStnkBerlaku:val("ack-f-kend-stnk-berlaku"),berkas:{...ackFormState.berkas},perlengkapan:{...ackFormState.perlengkapan},verifikasi:{...ackFormState.verifikasi},updatedAt:Date.now()};try{await update(ref(db,`calon_kurir/${id}`),payload),ackToast("Data calon kurir berhasil diperbarui."),window.__ack.go("screen-admin-calon-kurir")}catch(err){ackToast("Gagal menyimpan: "+err.message)}}function ackPopulateLeaderSelect(){const dropdown=document.getElementById("ack-ap-leader");if(!dropdown)return;const options=['<option value="">-- Pilih Leader --</option>'];Object.values(cloudLeaderListAck||{}).forEach(item=>{item&&item.nama&&options.push(`<option value="${ackEsc(item.nama)}">${ackEsc(item.nama)}</option>`)}),dropdown.innerHTML=options.join("")}function ackOpenApproveModal(candidateId){const c=cloudCalonKurir[candidateId];if(!c)return ackToast("Data calon kurir tidak ditemukan.");const suggestUsername=(c.nama||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,".").replace(/^\.+|\.+$/g,""),slot=document.getElementById("ack-modal-slot");slot.innerHTML=`
    <div class="pm-modal-overlay" onclick="if(event.target===this) this.remove()">
        <div class="pm-modal-sheet">
            <div class="flex items-center justify-between mb-3">
                <div><h3 class="font-bold text-sm">Setujui &amp; Buat Akun Kurir</h3><p class="text-[10px] text-slate-400">${ackEsc(c.nama||"-")}</p></div>
                <button onclick="document.getElementById('ack-modal-slot').innerHTML=''" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            <input type="hidden" id="ack-ap-candidate-id" value="${candidateId}">
            <div class="pm-card space-y-3">
                <div><label class="pm-label">Username</label><input id="ack-ap-username" class="pm-input" placeholder="username.kurir" value="${ackEsc(suggestUsername)}"></div>
                <div><label class="pm-label">Password</label><input id="ack-ap-password" class="pm-input" placeholder="Sandi login"></div>
                <div><label class="pm-label">Tanggal Bergabung</label><input id="ack-ap-tgl-gabung" type="date" class="pm-input" value="${ackTodayISO()}"></div>
                <div><label class="pm-label">Leader</label>
                    <select id="ack-ap-leader" class="pm-select"><option value="">-- Pilih Leader --</option></select>
                </div>
                <div><label class="pm-label">Status Akun</label>
                    <select id="ack-ap-status" class="pm-select">
                        <option value="aktif">AKTIF</option>
                        <option value="nonaktif">BLOKIR</option>
                    </select>
                </div>
            </div>
            <p class="text-[10.5px] text-slate-400 mt-2">Setelah disimpan, akun kurir baru langsung dibuat dan Profil Data Diri (Nama, NIK, TTL, No. ID Card, HP, alamat, pekerjaan lain, BPJS, kontak darurat) otomatis terisi dari data calon kurir ini.</p>
            <button onclick="window.__ack.submitApprove()" class="pm-btn-primary flex items-center justify-center gap-2 mt-3" style="background:#059669;">
                <i data-lucide="check-check" class="w-4 h-4"></i> Setujui &amp; Simpan Akun
            </button>
        </div>
    </div>`,ackPopulateLeaderSelect(),window.lucide&&window.lucide.createIcons()}async function ackSubmitApprove(){var _a,_b,_c,_d,_e,_f;const candidateId=(_a=document.getElementById("ack-ap-candidate-id"))==null?void 0:_a.value,c=candidateId?cloudCalonKurir[candidateId]:null;if(!c)return ackToast("Data calon kurir tidak ditemukan.");const username=(((_b=document.getElementById("ack-ap-username"))==null?void 0:_b.value)||"").trim().toLowerCase(),password=(((_c=document.getElementById("ack-ap-password"))==null?void 0:_c.value)||"").trim(),tglGabung=((_d=document.getElementById("ack-ap-tgl-gabung"))==null?void 0:_d.value)||"",leader=(((_e=document.getElementById("ack-ap-leader"))==null?void 0:_e.value)||"").trim(),status=((_f=document.getElementById("ack-ap-status"))==null?void 0:_f.value)||"aktif";if(!username||!password||!tglGabung)return ackToast("Mohon lengkapi username, password, dan tanggal bergabung.","warning");if(Object.values(cloudUsersList||{}).some(u=>(u&&u.username||"").trim().toLowerCase()===username))return ackToast(`Username "${username}" sudah terdaftar! Gunakan username yang berbeda.`,"warning");const session=ackGetSession(),userData={nama:c.nama||"",leader,username,password,tglGabung,status,role:"kurir",ongkirLocked:!0,ongkirPassword:""};try{const newUserRef=push(ref(db,"users"));await set(newUserRef,userData);const newUserId=newUserRef.key,kontakDaruratNama=c.daruratHubungan?`${c.daruratNama||"-"} (${c.daruratHubungan})`:c.daruratNama||"",profilPayload={namaLengkap:c.nama||"",nik:c.nik||"",tempatLahir:c.tempatLahir||"",tanggalLahir:c.tanggalLahir||"",noIdCard:c.idCard||"",noHpWa:c.hpAktif||"",noHpKurir:c.hpKurir||"",alamatDomisili:c.alamat||"",pekerjaanLain:c.pekerjaanLain||"",noBpjs:c.bpjs||"",kelasBpjs:c.bpjsKelas||"",biayaBpjs:parseInt(c.bpjsBiaya)||0,kontakDaruratNama,kontakDaruratNoHp:c.daruratHp||"",updatedAt:new Date().toISOString()};await set(ref(db,`profil_kurir/${newUserId}`),profilPayload),await update(ref(db,`calon_kurir/${candidateId}`),{statusPengajuan:"disetujui",approvedAt:Date.now(),approvedBy:(session==null?void 0:session.nama)||(session==null?void 0:session.username)||"-",approvedUserId:newUserId}),ackToast(`Akun kurir "${c.nama||"-"}" berhasil dibuat & profil data diri otomatis terisi.`),document.getElementById("ack-modal-slot").innerHTML="",ackRenderList()}catch(err){ackToast("Gagal menyetujui & membuat akun: "+err.message)}}window.__ack={go(screenId){typeof window.navigateTo=="function"&&window.navigateTo(screenId)},renderList:ackRenderList,toggleListOpen:ackToggleListOpen,openForm:ackOpenForm,saveCandidate:ackSaveCandidate,toggleCheck:ackToggleCheck,showDetail:ackShowDetail,deleteCandidate:ackDeleteCandidate,openApproveModal:ackOpenApproveModal,submitApprove:ackSubmitApprove,tolakPengajuan:ackTolakPengajuan,toggleRiwayatDetail:ackToggleRiwayatDetail};function ackBoot(){ackInjectStyle(),ackInjectScreens(),ackPatchNavigation(),ackUpdateMenuBadge()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ackBoot):ackBoot();
