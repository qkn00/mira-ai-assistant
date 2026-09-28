"use client";

import {
  AudioLines,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Clapperboard,
  CloudUpload,
  Heart,
  Info,
  Menu,
  Mic,
  MoreHorizontal,
  Pause,
  Play,
  SendHorizontal,
  Settings2,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Volume2,
  WandSparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type PersonaId = "selin" | "alara" | "defne" | "leyla";
type MoodId = "neutral" | "warm" | "focused" | "playful";
type Persona = {
  id: PersonaId;
  name: string;
  note: string;
  image: string;
  adultImage?: string;
};

const personas: Persona[] = [
  {
    id: "selin",
    name: "Selin",
    note: "Sıcak & samimi",
    image: "/avatars/selin-base.png",
    adultImage: "/avatars/selin-adult.png",
  },
  {
    id: "alara",
    name: "Alara",
    note: "Özgüvenli & zarif",
    image: "/avatars/alara-base.png",
    adultImage: "/avatars/alara-adult.png",
  },
  {
    id: "defne",
    name: "Defne",
    note: "Neşeli & yaratıcı",
    image: "/avatars/defne-base.png",
    adultImage: "/avatars/defne-adult.png",
  },
  {
    id: "leyla",
    name: "Leyla",
    note: "Sakin & etkileyici",
    image: "/avatars/leyla-base.png",
  },
];

const moods: { id: MoodId; label: string; note: string; icon: string }[] = [
  { id: "neutral", label: "Doğal", note: "Sakin ve dengeli", icon: "◌" },
  { id: "warm", label: "Sıcak", note: "Samimi ve gülümseyen", icon: "♡" },
  { id: "focused", label: "Odaklı", note: "Net ve profesyonel", icon: "◇" },
  { id: "playful", label: "Neşeli", note: "Enerjik ve canlı", icon: "✦" },
];

export default function HomePage() {
  const [activePersona, setActivePersona] = useState<PersonaId>("selin");
  const [activeMood, setActiveMood] = useState<MoodId>("warm");
  const [adultMode, setAdultMode] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [isListening, setIsListening] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("Sana eşlik etmek için buradayım. Bir şey sorabilirsin.");
  const [toast, setToast] = useState("");

  const selectedPersona = useMemo(
    () => personas.find((persona) => persona.id === activePersona) ?? personas[0],
    [activePersona],
  );
  const selectedMood = useMemo(
    () => moods.find((mood) => mood.id === activeMood) ?? moods[1],
    [activeMood],
  );
  const portraitImage = adultMode
    ? selectedPersona.adultImage ?? selectedPersona.image
    : selectedPersona.image;

  useEffect(() => {
    fetch("/api/avatar")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { activePersona?: PersonaId; adultMode?: boolean } | null) => {
        if (data?.activePersona && personas.some((persona) => persona.id === data.activePersona)) {
          setActivePersona(data.activePersona);
        }
        if (typeof data?.adultMode === "boolean") {
          setAdultMode(data.adultMode);
        }
      })
      .catch(() => undefined);
  }, []);

  function announce(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2100);
  }

  function savePreference(preference: { activePersona?: PersonaId; adultMode?: boolean }) {
    fetch("/api/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preference),
    }).catch(() => undefined);
  }

  function choosePersona(id: PersonaId) {
    setActivePersona(id);
    savePreference({ activePersona: id });
    announce(`${personas.find((persona) => persona.id === id)?.name ?? "Avatar"} seçildi`);
  }

  function toggleAdultMode() {
    if (adultMode) {
      setAdultMode(false);
      savePreference({ adultMode: false });
      announce("18+ görünümü kapatıldı");
      return;
    }
    setShowAgeGate(true);
  }

  function confirmAdultMode() {
    setAdultMode(true);
    setShowAgeGate(false);
    savePreference({ adultMode: true });
    announce("Gece Glam görünümü açıldı");
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    setReply(
      `“${cleanMessage.length > 42 ? `${cleanMessage.slice(0, 42)}…` : cleanMessage}” için buradayım. Nereden başlayalım?`,
    );
    setMessage("");
    setIsListening(false);
    setIsPlaying(true);
    window.setTimeout(() => setIsListening(true), 2800);
  }

  return (
    <main className={`studio-shell ${adultMode ? "adult-mode" : ""}`}>
      <div className="ambient ambient-violet" />
      <div className="ambient ambient-blue" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Mira Avatar Studio ana sayfa">
          <span className="brand-mark"><Sparkles size={16} strokeWidth={2.5} /></span>
          <span>Mira <em>Studio</em></span>
        </a>

        <nav className="desktop-nav" aria-label="Ana menü">
          <a className="nav-link active" href="#avatar">Avatar</a>
          <a className="nav-link" href="#style">Karakterler</a>
          <a className="nav-link" href="#voice">Ses</a>
          <a className="nav-link" href="#help">Yardım</a>
        </nav>

        <div className="top-actions">
          <button className="icon-button help-button" aria-label="Yardım"><CircleHelp size={19} /></button>
          <button className="profile-chip" onClick={() => setShowDetails((value) => !value)} aria-expanded={showDetails}>
            <span className="profile-avatar">G</span>
            <span className="profile-text"><b>Gökhan</b><small>Creator plan</small></span>
            <ChevronDown size={16} />
          </button>
          <button className="icon-button mobile-menu-button" onClick={() => setShowMobileMenu((value) => !value)} aria-label="Menüyü aç">
            {showMobileMenu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {(showDetails || showMobileMenu) && (
          <div className="quick-popover">
            <span className="online-dot" /> <b>Stüdyo hazır</b>
            <p>Avatar ayarların otomatik olarak kaydediliyor.</p>
          </div>
        )}
      </header>

      <section id="top" className="studio-grid">
        <aside className="intro-panel">
          <div className="eyebrow"><span /> KİŞİSEL AVATAR</div>
          <h1>Konuşan asistanın,<br /><i>senin tarzında.</i></h1>
          <p className="intro-copy">Dudak senkronu, doğal mikro mimikler ve sana özel bir görünüm. Asistanın her konuşmada canlı ve tutarlı kalsın.</p>

          <div className="status-card">
            <div className="status-icon"><AudioLines size={20} /></div>
            <div><b>{isListening ? "Dinlemeye hazır" : "Yanıt hazırlanıyor"}</b><span>{isListening ? "Mikrofon ve ses motoru aktif" : "Dudak senkronu işleniyor"}</span></div>
            <span className="status-live"><i /> CANLI</span>
          </div>

          <div className="feature-list">
            <div><span><Check size={14} /></span> Kelime bazlı dudak senkronu</div>
            <div><span><Check size={14} /></span> Doğal yüz ve göz hareketleri</div>
            <div><span><Check size={14} /></span> Anlık duygu geçişleri</div>
          </div>
        </aside>

        <section id="avatar" className="avatar-stage" aria-label={`${selectedPersona.name} dijital asistan ön izlemesi`}>
          <div className="stage-header">
            <span className="avatar-live"><i /> {selectedPersona.name.toLocaleUpperCase("tr-TR")} ŞU AN AKTİF</span>
            <button className="more-button" aria-label="Diğer seçenekler"><MoreHorizontal size={20} /></button>
          </div>

          <div className={`avatar-visual mood-${activeMood} ${isPlaying ? "speaking" : ""}`}>
            <div className="portrait-aura" />
            <img key={portraitImage} src={portraitImage} alt={`${selectedPersona.name}, ${adultMode ? "Gece Glam" : "Gece Modu"} avatarı`} />
            <div className="portrait-shade" />
            <div className="portrait-caption">
              <span className="caption-wave"><i /><i /><i /><i /><i /></span>
              <span>{adultMode ? "Yetişkin Gece Glam" : isPlaying ? "Dudak senkronu açık" : "Ön izleme duraklatıldı"}</span>
            </div>
          </div>

          <div className="speech-card">
            <span className="speech-spark"><Sparkles size={15} /></span>
            <p>{reply}</p>
          </div>

          <form className="message-composer" onSubmit={submitMessage}>
            <button type="button" className={`round-control ${isListening ? "on" : ""}`} onClick={() => setIsListening((value) => !value)} aria-label="Mikrofonu aç veya kapat">
              <Mic size={19} />
            </button>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={`${selectedPersona.name}'ya bir şey söyle...`} aria-label={`${selectedPersona.name}'ya mesaj yaz`} />
            <button type="button" className="smile-control" onClick={() => setActiveMood("playful")} aria-label="Neşeli duygu seç"><SmilePlus size={20} /></button>
            <button type="submit" className="send-button" aria-label="Mesajı gönder"><SendHorizontal size={18} /></button>
          </form>
        </section>

        <aside className="control-panel">
          <div className="panel-heading">
            <span className="eyebrow compact"><span /> CANLI ÖN İZLEME</span>
            <button className="outline-button" onClick={() => setShowDetails((value) => !value)}><Info size={15} /> Nasıl çalışır?</button>
          </div>

          <div className="audio-meter-card" id="voice">
            <div className="meter-top"><span className="mini-icon"><Volume2 size={16} /></span><b>Ses tepkisi</b><small>{isPlaying ? "Konuşuyor" : "Bekliyor"}</small></div>
            <div className={`waveform ${isPlaying ? "wave-active" : ""}`} aria-label="Ses dalga formu">
              {Array.from({ length: 31 }).map((_, index) => <i key={index} style={{ height: `${17 + ((index * 19) % 33)}%` }} />)}
            </div>
            <button className="play-row" onClick={() => setIsPlaying((value) => !value)}>
              <span className="play-symbol">{isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}</span>
              {isPlaying ? "Ön izlemeyi duraklat" : "Ön izlemeyi oynat"}
              <span>00:12 <b>/</b> 00:24</span>
            </button>
          </div>

          <section className="control-section character-section" id="style">
            <div className="section-title"><div><h2>Gece Modu · 4 avatar</h2><p>Karakterini seç, stil aynı kalsın</p></div><WandSparkles size={18} /></div>
            <div className="persona-grid">
              {personas.map((persona) => {
                const thumbnail = adultMode ? persona.adultImage ?? persona.image : persona.image;
                return (
                  <button key={persona.id} className={`persona-option ${activePersona === persona.id ? "selected" : ""}`} onClick={() => choosePersona(persona.id)} aria-pressed={activePersona === persona.id}>
                    <span className="persona-photo"><img src={thumbnail} alt="" /></span>
                    <span className="persona-copy"><b>{persona.name}</b><small>{persona.note}</small></span>
                    <span className="selection-dot">{activePersona === persona.id && <Check size={11} />}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="adult-mode-card" aria-label="Yetişkin modu">
            <div className="adult-mode-heading">
              <span className="adult-badge">18+</span>
              <div className="adult-mode-copy"><b>Gece Glam</b><small>{adultMode ? "Yetişkin görünümü açık" : "Daha olgun, şık portre stili"}</small></div>
              <button type="button" className={`adult-switch ${adultMode ? "on" : ""}`} role="switch" aria-checked={adultMode} aria-label="18+ Gece Glam modunu aç veya kapat" onClick={toggleAdultMode}>
                <span />
              </button>
            </div>
            <p>Yalnızca 18+ kullanıcılar için. Şık ve açık saçık olmayan portreler.</p>
          </section>

          <section className="control-section emotion-section">
            <div className="section-title"><div><h2>Konuşma duygusu</h2><p>Yanıt tonuna göre geçiş yapar</p></div><Bot size={18} /></div>
            <div className="mood-grid">
              {moods.map((mood) => (
                <button key={mood.id} className={`mood-option ${activeMood === mood.id ? "selected" : ""}`} onClick={() => setActiveMood(mood.id)}>
                  <span className="mood-symbol">{mood.icon}</span><span><b>{mood.label}</b><small>{mood.note}</small></span>
                </button>
              ))}
            </div>
          </section>

          <button className="generate-button" onClick={() => { setIsPlaying(true); announce(`${selectedMood.label} ifade ön izlemesi hazır`); }}>
            <Clapperboard size={18} /> İfade ön izlemesini oluştur
            <span>⌘ ↵</span>
          </button>
        </aside>
      </section>

      <footer className="studio-footer" id="help">
        <div className="footer-ready"><span><Check size={14} /></span><b>Avatarın yayınlanmaya hazır</b><small>Son düzenleme az önce kaydedildi</small></div>
        <div className="footer-actions"><button><CloudUpload size={17} /> Medya yükle</button><button><Settings2 size={17} /> Avatar ayarları</button><button className="publish-button"><Heart size={17} /> Yayınla</button></div>
      </footer>

      {showAgeGate && (
        <div className="age-gate-backdrop">
          <section className="age-gate-dialog" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
            <div className="age-gate-icon"><ShieldCheck size={24} /></div>
            <span className="age-gate-label">İSTEĞE BAĞLI · 18+</span>
            <h2 id="age-gate-title">Yetişkin moduna geçilsin mi?</h2>
            <p>Bu seçenek yalnızca 18 yaşını doldurmuş kullanıcılar içindir. Avatarların daha olgun bir gece stili ve şık glam portreleri gösterilir; açık saçık içerik bulunmaz.</p>
            <div className="age-gate-actions">
              <button className="age-cancel" onClick={() => setShowAgeGate(false)}>Vazgeç</button>
              <button className="age-confirm" onClick={confirmAdultMode}>18+ olduğumu onaylıyorum</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    </main>
  );
}
