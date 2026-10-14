const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const steps = [
  {title:"Ekspansi isotermal (suhu tinggi)",text:"Gas menyerap kalor dari sumber panas, mengembang pada suhu tetap, dan melakukan usaha pada lingkungan.",fact:"Suhu tetap • Volume bertambah • Q masuk",gas:"linear-gradient(#ffad4d,#ffd9a1 45%,#c4d9ce)",piston:"35%"},
  {title:"Pendinginan isokhorik",text:"Volume gas tetap saat kalor dilepaskan ke regenerator. Suhu dan tekanan gas menurun.",fact:"Volume tetap • Suhu menurun • Kalor dilepas",gas:"linear-gradient(#7bd5f2,#c9edf4 45%,#c4d9ce)",piston:"35%"},
  {title:"Kompresi isotermal (suhu rendah)",text:"Gas dikompresi pada suhu rendah yang tetap. Lingkungan melakukan usaha pada gas dan kalor dilepaskan.",fact:"Suhu tetap • Volume berkurang • Q keluar",gas:"linear-gradient(#55b9e7,#b6e4f4 45%,#c4d9ce)",piston:"65%"},
  {title:"Pemanasan isokhorik",text:"Pada volume tetap, gas menerima kembali kalor dari regenerator sehingga suhu dan tekanannya meningkat.",fact:"Volume tetap • Suhu meningkat • Kalor masuk",gas:"linear-gradient(#ffad4d,#ffd9a1 45%,#c4d9ce)",piston:"65%"}
];
let currentStep = 0;
function setStep(index){
  currentStep = (index + steps.length) % steps.length;
  const s = steps[currentStep];
  $("#stepBadge").textContent = `Proses ${currentStep+1} dari 4`;
  $("#stepTitle").textContent = s.title;
  $("#stepText").textContent = s.text;
  $("#stepFact").textContent = s.fact;
  $("#gasVisual").style.background = s.gas;
  $("#pistonVisual").style.top = s.piston;
  $$(".step-tab").forEach((b,i)=>b.classList.toggle("active",i===currentStep));
  $$(".process-card").forEach((b,i)=>b.classList.toggle("selected",i===currentStep));
}
$$("[data-step]").forEach(b=>b.addEventListener("click",()=>setStep(Number(b.dataset.step))));
$("#prevStep").addEventListener("click",()=>setStep(currentStep-1));
$("#nextStep").addEventListener("click",()=>setStep(currentStep+1));

const hot = $("#hotTemp"), cold = $("#coldTemp");
function updateEfficiency(){
  const th = Number(hot.value), tc = Number(cold.value);
  $("#hotValue").textContent = `${th} K`;
  $("#coldValue").textContent = `${tc} K`;
  const efficiency = (1 - tc/th)*100;
  $("#efficiency").innerHTML = `${efficiency.toFixed(1)}<small>%</small>`;
  $("#meterFill").style.width = `${Math.max(0,Math.min(100,efficiency))}%`;
  $("#effNote").textContent = `Batas ideal untuk Th = ${th} K dan Tc = ${tc} K.`;
  // Schematic cycle changes slightly to reflect the selected temperature ratio.
  const depth = 70 + Math.max(0, Math.min(40, (th-tc)/12));
  $("#cyclePath").setAttribute("d",`M110 70 C220 90 390 ${depth+80} 610 ${depth+105} L610 105 C390 75 220 45 110 40Z`);
  $("#cycleArea").setAttribute("d",$("#cyclePath").getAttribute("d"));
}
hot.addEventListener("input",updateEfficiency); cold.addEventListener("input",updateEfficiency);
$("#resetParams").addEventListener("click",()=>{hot.value=600;cold.value=300;updateEfficiency()});

$$(".quiz-options button").forEach(button=>button.addEventListener("click",()=>{
  const feedback=$("#quizFeedback");
  if(button.dataset.answer==="volume"){
    feedback.textContent="Benar! Dalam proses isokhorik, volume tetap.";
    feedback.style.color="#14845e";
  }else{
    feedback.textContent="Belum tepat. Coba ingat arti isokhorik: volume gas tidak berubah.";
    feedback.style.color="#c45c32";
  }
}));

const conclusion=$("#conclusion");
function countWords(){const text=conclusion.value.trim();$("#wordCount").textContent=`${text ? text.split(/\s+/).length : 0} kata`;}
conclusion.addEventListener("input",countWords);
$("#saveConclusion").addEventListener("click",()=>{
  const text=conclusion.value.trim();
  const msg=$("#saveMessage");
  if(!text){msg.textContent="Tuliskan kesimpulan terlebih dahulu.";return;}
  try{localStorage.setItem("kesimpulanKelompokDua",text);msg.textContent="Kesimpulan tersimpan di browser ini.";}
  catch(e){msg.textContent="Kesimpulan siap disalin, tetapi penyimpanan browser tidak tersedia.";}
});
try{const saved=localStorage.getItem("kesimpulanKelompokDua");if(saved){conclusion.value=saved;countWords();}}catch(e){}

const menuToggle=$("#menuToggle"), nav=$("#mainNav");
menuToggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(open));menuToggle.textContent=open?"✕":"☰";});
$$("nav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuToggle.setAttribute("aria-expanded","false");menuToggle.textContent="☰";}));
const sections=$$("main section[id]");
if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){$$("nav a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${entry.target.id}`));}}),{rootMargin:"-25% 0px -65% 0px"});
  sections.forEach(section=>observer.observe(section));
}

const komentarForm = document.getElementById("komentarForm");
const namaKomentar = document.getElementById("namaKomentar");
const isiKomentar = document.getElementById("isiKomentar");
const komentarList = document.getElementById("komentarList");
const jumlahKomentar = document.getElementById("jumlahKomentar");

const STORAGE_KEY = "komentar_hipotesis_stirling";

let daftarKomentar = [];

try {
  const dataTersimpan = localStorage.getItem(STORAGE_KEY);
  const hasilParse = dataTersimpan ? JSON.parse(dataTersimpan) : [];

  if (Array.isArray(hasilParse)) {
    daftarKomentar = hasilParse.filter(
      (item) =>
        item &&
        typeof item.nama === "string" &&
        typeof item.isi === "string" &&
        typeof item.waktu === "string"
    );
  }
} catch (error) {
  console.warn("Komentar tersimpan tidak dapat dibaca.", error);
}

function buatElemen(tag, className, teks) {
  const elemen = document.createElement(tag);

  if (className) {
    elemen.className = className;
  }

  elemen.textContent = teks;
  return elemen;
}

function tampilkanKomentar() {
  komentarList.replaceChildren();

  jumlahKomentar.textContent = daftarKomentar.length;

  if (daftarKomentar.length === 0) {
    komentarList.appendChild(
      buatElemen(
        "p",
        "komentar-kosong",
        "Belum ada komentar. Jadilah yang pertama berdiskusi!"
      )
    );

    return;
  }

  daftarKomentar.slice().reverse().forEach((komentar) => {
    const kartu = document.createElement("article");
    kartu.className = "komentar-item";

    kartu.appendChild(
      buatElemen("strong", "", komentar.nama)
    );

    kartu.appendChild(
      buatElemen("small", "", komentar.waktu)
    );

    kartu.appendChild(
      buatElemen("p", "", komentar.isi)
    );

    komentarList.appendChild(kartu);
  });
}

komentarForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const nama = namaKomentar.value.trim();
  const isi = isiKomentar.value.trim();

  if (!nama || !isi) {
    alert("Nama dan komentar harus diisi.");
    return;
  }

  const komentarBaru = {
    nama: nama,
    isi: isi,
    waktu: new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    })
  };

  daftarKomentar.push(komentarBaru);

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(daftarKomentar)
    );
  } catch (error) {
    console.error("Komentar gagal disimpan.", error);

    alert(
      "Komentar ditampilkan, tetapi tidak dapat disimpan di browser."
    );
  }

  tampilkanKomentar();
  isiKomentar.value = "";
  namaKomentar.value = "";
});

tampilkanKomentar();

setStep(0);updateEfficiency();
