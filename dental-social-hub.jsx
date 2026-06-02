import { useState, useEffect, useRef } from "react";

const TABS = ["Dashboard", "Trend Takip", "Hasta Galerisi", "Influencer Hub", "İçerik Önerileri", "Hasta Röportajları"];

const INFLUENCER_SUGGESTIONS = [
  { handle: "@burcuerzincanli", platform: "Instagram", followers: "2.1M", niche: "Yaşam Tarzı / Güzellik", country: "🇹🇷 Türkiye", avatar: "BE", engagement: "4.2%" },
  { handle: "@duyguasena", platform: "Instagram", followers: "1.8M", niche: "Sağlık & Estetik", country: "🇹🇷 Türkiye", avatar: "DA", engagement: "3.8%" },
  { handle: "@neslihanatagul", platform: "Instagram", followers: "3.4M", niche: "Yaşam Tarzı", country: "🇹🇷 Türkiye", avatar: "NA", engagement: "2.9%" },
  { handle: "@huda.beauty", platform: "Instagram", followers: "54M", niche: "Güzellik & Estetik", country: "🌍 Global", avatar: "HB", engagement: "1.4%" },
  { handle: "@katerinagray", platform: "TikTok", followers: "12M", niche: "Sağlık & Dönüşüm", country: "🌍 Global", avatar: "KG", engagement: "6.7%" },
  { handle: "@dr.karishma", platform: "Instagram", followers: "890K", niche: "Dental & Estetik", country: "🌍 Global", avatar: "DK", engagement: "5.1%" },
];

const TRENDS = [
  { platform: "TikTok", title: "Gülüş Dönüşümü", tag: "#SmileTransformation", views: "2.4B", growth: "+34%", hot: true },
  { platform: "Instagram", title: "Veneer Öncesi/Sonrası", tag: "#VeneerResults", views: "890M", growth: "+21%", hot: true },
  { platform: "YouTube", title: "Türkiye'de Diş Turizmi", tag: "Dental Tourism Turkey", views: "45M", growth: "+67%", hot: true },
  { platform: "TikTok", title: "Hollywood Smile", tag: "#HollywoodSmile", views: "1.1B", growth: "+18%", hot: false },
  { platform: "Instagram", title: "Zirkonyum Kaplama", tag: "#ZirconiumCrown", views: "320M", growth: "+12%", hot: false },
  { platform: "YouTube", title: "Diş Beyazlatma Vlog", tag: "Teeth Whitening Turkey", views: "28M", growth: "+29%", hot: true },
];

const CONTENT_IDEAS = [
  { type: "Reel / TikTok", title: "48 Saatte Mükemmel Gülüş", desc: "Hasta yolculuğunu hızlı kesmek — varış, klinik, sonuç", platform: ["Instagram", "TikTok"], priority: "Yüksek" },
  { type: "Carousel", title: "Türkiye'de Diş Tedavisi Neden Ucuz?", desc: "İngiltere/Almanya kıyaslamalı infografik", platform: ["Instagram"], priority: "Yüksek" },
  { type: "YouTube Vlog", title: "İngiliz Hasta Deneyimi", desc: "Uçuş + otel + klinik + sonuç tam döngü", platform: ["YouTube"], priority: "Orta" },
  { type: "Story Serisi", title: "Soru-Cevap: Veneer mi Zirkonyum mu?", desc: "Doktor ile canlı Q&A hikaye formatında", platform: ["Instagram"], priority: "Orta" },
  { type: "Reel", title: "Mutlu Hasta Anı", desc: "Hastanın aynada gülüşünü ilk gördüğü anı çek", platform: ["Instagram", "TikTok"], priority: "Yüksek" },
];

const platformColors = { Instagram: "#E1306C", TikTok: "#010101", YouTube: "#FF0000" };
const priorityColors = { Yüksek: "#00ffa3", Orta: "#ffc947", Düşük: "#888" };

// ─── HASTA RÖPORTAJ İÇERİK ÜRETİCİ SABIT VERİLER ────────────────────────────
const INTERVIEW_FORMATS = [
  { id: "reel_caption", label: "Reel Açıklaması", icon: "🎬", desc: "Kısa video altı caption + hashtag" },
  { id: "carousel_story", label: "Carousel Hikayesi", icon: "📖", desc: "Slayт slayт hasta yolculuğu" },
  { id: "quote_post", label: "Alıntı Postu", icon: "💬", desc: "Hastanın sözleri — güçlü bir cümle" },
  { id: "before_after", label: "Önce/Sonra Yazısı", icon: "✨", desc: "Dönüşüm odaklı caption" },
  { id: "story_highlight", label: "Story Metni", icon: "📲", desc: "Hikaye serisi için kısa metinler" },
  { id: "testimonial_post", label: "Referans Postu", icon: "⭐", desc: "Sosyal kanıt odaklı uzun caption" },
  { id: "interview_qa", label: "Soru & Cevap", icon: "🎙️", desc: "Hasta ile röportaj soruları + yanıtlar" },
  { id: "journey_vlog", label: "Vlog Tanıtımı", icon: "🎥", desc: "YouTube/Reels için intro metni" },
];

const INTERVIEW_LANGS = ["English", "Türkçe", "Deutsch", "Arabic (العربية)", "French", "Italian"];
const VIBES = ["Duygusal & İlham Verici", "Samimi & Gerçekçi", "Heyecanlı & Enerjik", "Güven Verici & Sakin"];

// ─── HASTA RÖPORTAJ İÇERİK ÜRETİCİ ──────────────────────────────────────────
function SalesScripts() {
  const [selectedFormat, setSelectedFormat] = useState(INTERVIEW_FORMATS[0]);
  const [language, setLanguage] = useState("English");
  const [vibe, setVibe] = useState("Duygusal & İlham Verici");
  const [patientName, setPatientName] = useState("");
  const [patientCountry, setPatientCountry] = useState("");
  const [treatment, setTreatment] = useState("Veneer");
  const [patientQuote, setPatientQuote] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeVariant, setActiveVariant] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const autoRef = useRef(null);

  const treatments = ["Veneer", "Zirkonyum Kaplama", "Hollywood Smile", "İmplant", "Diş Beyazlatma", "Gülüş Tasarımı", "All-on-4", "All-on-6"];
  const hotTrends = TRENDS.filter(t => t.hot).map(t => `${t.title} (${t.tag})`).join(", ");

  useEffect(() => {
    if (autoRefresh && result) {
      autoRef.current = setInterval(() => generate(true), 6 * 60 * 1000);
    } else {
      clearInterval(autoRef.current);
    }
    return () => clearInterval(autoRef.current);
  }, [autoRefresh, result]);

  const generate = async (silent = false) => {
    if (!silent) { setLoading(true); setResult(null); }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: `Sen Türkiye'deki premium dental sağlık turizmi kliniğinin Instagram içerik yazarısın. Gerçek hasta deneyimlerinden ilham verici, viral potansiyelli sosyal medya içerikleri üretiyorsun.

İçerik Formatı: ${selectedFormat.label} — ${selectedFormat.desc}
Dil: ${language}
Ton/Vibe: ${vibe}
Hasta Adı: ${patientName || "genel (isim kullanma, 'our patient' veya 'hastamız' de)"}
Hastanın Geldiği Ülke: ${patientCountry || "belirtilmedi"}
Uygulanan Tedavi: ${treatment}
Hastanın gerçek sözleri / alıntı (varsa): ${patientQuote || "yok — sen yaz"}
Ek notlar: ${extraNotes || "yok"}
Güncel trendler (organik entegre et): ${hotTrends}

Bu hasta röportajına dayalı Instagram içeriği üret. İçerik gerçek hissettirmeli, duygusal bağ kurmalı, izleyiciyi de aynı deneyimi yaşamak isteyecek şekilde motive etmeli. Klişelerden kaçın.

Format türüne göre tam içerik ver:
- Reel Açıklaması: caption + hashtag listesi
- Carousel: her slayt için başlık + kısa metin (5-7 slayt)
- Alıntı Postu: güçlü bir cümle öne çıkar + kısa açıklama + hashtag
- Önce/Sonra: dönüşüm odaklı caption, duygusal ve güçlü
- Story Metni: 5-6 hikaye kartı için kısa metinler
- Referans Postu: uzun form caption, sosyal kanıt odaklı
- Soru & Cevap: 5 soru + hasta ağzından doğal yanıtlar
- Vlog Tanıtımı: hook cümle + kısa açıklama + CTA

SADECE aşağıdaki JSON döndür:
{
  "variants": [
    {
      "label": "Versiyon adı",
      "hook": "İlk dikkat çeken cümle/hook",
      "content": "Ana içerik metni (formatına uygun, tam ve eksiksiz)",
      "hashtags": ["#tag1", "#tag2"],
      "postingTip": "Bu içeriği paylaşırken dikkat edilmesi gereken şey",
      "bestTime": "En iyi paylaşım zamanı"
    }
  ],
  "contentNote": "Bu içerik için trend & algoritma notu (1-2 cümle)"
}`
          }]
        })
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setActiveVariant(0);
      setLastRefreshed(new Date());
    } catch { setResult({ error: true }); }
    if (!silent) setLoading(false);
  };

  const copyAll = (v) => {
    const full = `${v.hook}\n\n${v.content}\n\n${(v.hashtags || []).join(" ")}`;
    navigator.clipboard.writeText(full);
    setCopiedIdx("all");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyPart = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
            Hasta Röportaj İçerikleri
          </div>
          <div style={{ color: "#666", fontSize: 13 }}>Gerçek hasta hikayelerinden Instagram içeriği üret</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastRefreshed && <div style={{ color: "#555", fontSize: 11 }}>Son: {lastRefreshed.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>}
          <button onClick={() => setAutoRefresh(v => !v)} style={{
            background: autoRefresh ? "rgba(0,255,163,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${autoRefresh ? "rgba(0,255,163,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 20, padding: "6px 14px",
            color: autoRefresh ? "#00ffa3" : "#666",
            fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontWeight: autoRefresh ? 700 : 400,
          }}>
            <span style={{ fontSize: 9, color: autoRefresh ? "#00ffa3" : "#444" }}>●</span>
            {autoRefresh ? "Oto-Yenileme Açık" : "Oto-Yenileme Kapalı"}
          </button>
        </div>
      </div>

      {/* Trend şeridi */}
      <div style={{
        background: "linear-gradient(90deg, rgba(225,48,108,0.08), rgba(255,107,53,0.04))",
        border: "1px solid rgba(225,48,108,0.2)", borderRadius: 12,
        padding: "10px 16px", marginBottom: 22,
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: "#E1306C", fontWeight: 700 }}>📸 INSTAGRAM TRENDLERİ:</span>
        {TRENDS.filter(t => t.hot).map((t, i) => (
          <span key={i} style={{
            background: "rgba(225,48,108,0.1)", border: "1px solid rgba(225,48,108,0.2)",
            borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#e1608c",
          }}>{t.tag}</span>
        ))}
        <span style={{ color: "#555", fontSize: 11, marginLeft: "auto" }}>Caption'lara otomatik eklenir</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 22, alignItems: "start" }}>

        {/* SOL — Ayarlar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Format seçimi */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 11, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>İçerik Formatı</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {INTERVIEW_FORMATS.map(f => (
                <button key={f.id} onClick={() => setSelectedFormat(f)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 11px", borderRadius: 10, border: "none",
                  background: selectedFormat.id === f.id ? "rgba(225,48,108,0.12)" : "transparent",
                  borderLeft: `2px solid ${selectedFormat.id === f.id ? "#E1306C" : "transparent"}`,
                  color: selectedFormat.id === f.id ? "#E1306C" : "#666",
                  cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: 15 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: selectedFormat.id === f.id ? 700 : 400 }}>{f.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.55 }}>{f.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Hasta & İçerik Bilgileri */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Hasta Bilgileri</div>

            {[
              ["Dil", language, setLanguage, INTERVIEW_LANGS, "select"],
              ["Ton / Vibe", vibe, setVibe, VIBES, "select"],
              ["Tedavi", treatment, setTreatment, treatments, "select"],
            ].map(([label, val, setter, opts]) => (
              <div key={label}>
                <div style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>{label}</div>
                <select value={val} onChange={e => setter(e.target.value)} style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, padding: "8px 10px", color: "#ccc", fontSize: 13, outline: "none",
                }}>
                  {opts.map(o => <option key={o} style={{ background: "#111" }}>{o}</option>)}
                </select>
              </div>
            ))}

            {[
              ["Hasta Adı (opsiyonel)", patientName, setPatientName, "ör: Sarah, Marco, Fatima..."],
              ["Nereden Geldi", patientCountry, setPatientCountry, "ör: UK, Germany, Netherlands..."],
            ].map(([label, val, setter, ph]) => (
              <div key={label}>
                <div style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>{label}</div>
                <input placeholder={ph} value={val} onChange={e => setter(e.target.value)} style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
                }} />
              </div>
            ))}

            <div>
              <div style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>Hastanın Kendi Sözleri 💬</div>
              <textarea placeholder='ör: "I never smiled in photos before. Now I can\'t stop!"' value={patientQuote}
                onChange={e => setPatientQuote(e.target.value)} rows={3}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(225,48,108,0.2)",
                  borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12, outline: "none",
                  resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5,
                }} />
            </div>

            <div>
              <div style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>Ek Notlar (opsiyonel)</div>
              <textarea placeholder="ör: Hasta 3 gün kaldı, önce korku vardı, şimdi çok mutlu..." value={extraNotes}
                onChange={e => setExtraNotes(e.target.value)} rows={2}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, padding: "8px 10px", color: "#ccc", fontSize: 12, outline: "none",
                  resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
                }} />
            </div>

            <button onClick={() => generate()} disabled={loading} style={{
              background: loading ? "#1a1a1a" : "linear-gradient(135deg, #E1306C, #ff6b35)",
              border: "none", borderRadius: 10, padding: "13px",
              color: loading ? "#555" : "#fff", fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer", width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {loading
                ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> Üretiliyor...</>
                : "📸 İçerik Üret"}
            </button>
          </div>
        </div>

        {/* SAĞ — Çıktı */}
        <div>
          {!result && !loading && (
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(225,48,108,0.2)",
              borderRadius: 20, padding: "60px 40px", textAlign: "center",
            }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>{selectedFormat.icon}</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{selectedFormat.label}</div>
              <div style={{ color: "#666", fontSize: 14, marginBottom: 6 }}>{selectedFormat.desc}</div>
              <div style={{ color: "#333", fontSize: 12 }}>Sol taraftan hasta bilgilerini gir ve "İçerik Üret" butonuna bas</div>
            </div>
          )}

          {loading && (
            <div style={{
              background: "rgba(225,48,108,0.03)", border: "1px solid rgba(225,48,108,0.12)",
              borderRadius: 20, padding: 60, textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 18, animation: "pulse 1.4s ease-in-out infinite" }}>🎙️</div>
              <div style={{ color: "#E1306C", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Röportaj içeriği hazırlanıyor...</div>
              <div style={{ color: "#555", fontSize: 13 }}>Hasta hikayesi işleniyor, trendler entegre ediliyor</div>
            </div>
          )}

          {result && result.error && (
            <div style={{ background: "rgba(255,0,85,0.05)", border: "1px solid rgba(255,0,85,0.2)", borderRadius: 16, padding: 24, color: "#ff6b6b", textAlign: "center" }}>
              Bir hata oluştu. Lütfen tekrar deneyin.
            </div>
          )}

          {result && !result.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Algoritma notu */}
              {result.contentNote && (
                <div style={{
                  background: "rgba(225,48,108,0.06)", border: "1px solid rgba(225,48,108,0.18)",
                  borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 16 }}>📊</span>
                  <div style={{ color: "#e1608c", fontSize: 13, lineHeight: 1.5 }}>{result.contentNote}</div>
                </div>
              )}

              {/* Versiyon seçici */}
              {result.variants?.length > 1 && (
                <div style={{ display: "flex", gap: 8 }}>
                  {result.variants.map((v, i) => (
                    <button key={i} onClick={() => setActiveVariant(i)} style={{
                      flex: 1, padding: "10px 8px", borderRadius: 12, border: "none",
                      background: activeVariant === i ? "rgba(225,48,108,0.15)" : "rgba(255,255,255,0.04)",
                      borderBottom: `2px solid ${activeVariant === i ? "#E1306C" : "transparent"}`,
                      color: activeVariant === i ? "#E1306C" : "#666",
                      fontWeight: activeVariant === i ? 700 : 400,
                      cursor: "pointer", fontSize: 12, transition: "all 0.15s",
                    }}>{v.label}</button>
                  ))}
                </div>
              )}

              {/* Ana içerik kartı */}
              {result.variants?.[activeVariant] && (() => {
                const v = result.variants[activeVariant];
                return (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>

                    {/* Kart başlık */}
                    <div style={{
                      padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(225,48,108,0.04)",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#E1306C", fontSize: 14 }}>{selectedFormat.icon} {v.label}</div>
                        {v.bestTime && <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>⏰ En iyi paylaşım: {v.bestTime}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => generate()} style={{
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8, padding: "6px 12px", color: "#888", fontSize: 11, cursor: "pointer",
                        }}>🔄 Yenile</button>
                        <button onClick={() => copyAll(v)} style={{
                          background: copiedIdx === "all" ? "rgba(225,48,108,0.3)" : "rgba(225,48,108,0.12)",
                          border: "1px solid rgba(225,48,108,0.3)", borderRadius: 8,
                          padding: "6px 14px", color: "#E1306C", fontSize: 11,
                          cursor: "pointer", fontWeight: 700, transition: "all 0.2s",
                        }}>{copiedIdx === "all" ? "✓ Kopyalandı!" : "📋 Tümünü Kopyala"}</button>
                      </div>
                    </div>

                    <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>

                      {/* Hook */}
                      {v.hook && (
                        <div>
                          <div style={{ color: "#666", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                            🪝 HOOK — İlk Cümle
                          </div>
                          <div style={{
                            background: "rgba(225,48,108,0.06)", border: "1px solid rgba(225,48,108,0.15)",
                            borderRadius: 10, padding: "12px 16px",
                            color: "#fff", fontSize: 15, fontWeight: 600, lineHeight: 1.6,
                            fontFamily: "Georgia, serif",
                            display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10,
                          }}>
                            <span>{v.hook}</span>
                            <button onClick={() => copyPart(v.hook, "hook")} style={{
                              background: "transparent", border: "1px solid rgba(225,48,108,0.3)",
                              borderRadius: 6, padding: "3px 9px", color: "#E1306C",
                              fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                            }}>{copiedIdx === "hook" ? "✓" : "Kopyala"}</button>
                          </div>
                        </div>
                      )}

                      {/* Ana içerik */}
                      <div>
                        <div style={{ color: "#666", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                          📝 İÇERİK
                        </div>
                        <div style={{
                          background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: 12, padding: 18,
                          color: "#ddd", fontSize: 14, lineHeight: 1.85,
                          whiteSpace: "pre-wrap", fontFamily: "Georgia, serif", minHeight: 100,
                          position: "relative",
                        }}>
                          {v.content}
                          <button onClick={() => copyPart(v.content, "content")} style={{
                            position: "absolute", top: 12, right: 12,
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 6, padding: "4px 10px", color: "#888",
                            fontSize: 10, cursor: "pointer",
                          }}>{copiedIdx === "content" ? "✓ Kopyalandı" : "Kopyala"}</button>
                        </div>
                      </div>

                      {/* Hashtagler */}
                      {v.hashtags?.length > 0 && (
                        <div>
                          <div style={{ color: "#666", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                            # HASHTAGLER
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {v.hashtags.map((h, i) => (
                              <span key={i} style={{
                                background: "rgba(225,48,108,0.08)", border: "1px solid rgba(225,48,108,0.2)",
                                borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#e1608c",
                              }}>{h}</span>
                            ))}
                            <button onClick={() => copyPart(v.hashtags.join(" "), "tags")} style={{
                              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 20, padding: "3px 12px", fontSize: 11, color: "#666",
                              cursor: "pointer", marginLeft: 4,
                            }}>{copiedIdx === "tags" ? "✓" : "Tümünü Kopyala"}</button>
                          </div>
                        </div>
                      )}

                      {/* Paylaşım ipucu */}
                      {v.postingTip && (
                        <div style={{
                          background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)",
                          borderRadius: 10, padding: "10px 14px",
                          display: "flex", gap: 8, alignItems: "flex-start",
                        }}>
                          <span style={{ fontSize: 14 }}>🎯</span>
                          <div style={{ color: "#00d4ff", fontSize: 12, lineHeight: 1.5 }}>
                            <strong>Paylaşım İpucu:</strong> {v.postingTip}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Hızlı kopyala özeti */}
              {result.variants?.length > 1 && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16 }}>
                  <div style={{ color: "#555", fontSize: 11, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Tüm Versiyonlar</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.variants.map((v, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(225,48,108,0.12)", border: "1px solid rgba(225,48,108,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#E1306C", flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, color: "#777", fontSize: 12 }}>{v.label}</div>
                        <button onClick={() => copyAll(v)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 10px", color: "#555", fontSize: 11, cursor: "pointer" }}>Kopyala</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

function Avatar({ initials, size = 40, color = "#00ffa3" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}33, ${color}11)`,
      border: `1.5px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color,
      fontFamily: "'DM Mono', monospace", flexShrink: 0,
    }}>{initials}</div>
  );
}

function TrendCard({ trend }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "18px 20px", display: "flex",
      alignItems: "center", gap: 16, transition: "all 0.2s", cursor: "pointer",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,255,163,0.3)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
    >
      <div style={{
        background: platformColors[trend.platform] + "22",
        border: `1px solid ${platformColors[trend.platform]}44`,
        borderRadius: 10, padding: "6px 12px", fontSize: 11,
        color: platformColors[trend.platform], fontWeight: 700,
        fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
      }}>{trend.platform}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{trend.title}</div>
        <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{trend.tag}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: "#00ffa3", fontWeight: 700, fontSize: 13 }}>{trend.growth}</div>
        <div style={{ color: "#555", fontSize: 11 }}>{trend.views} görüntülenme</div>
      </div>
      {trend.hot && (
        <div style={{
          background: "linear-gradient(135deg, #ff6b35, #ff0055)",
          borderRadius: 20, padding: "3px 10px", fontSize: 10,
          fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
        }}>🔥 HOT</div>
      )}
    </div>
  );
}



// ─── DİĞER BÖLÜMLER ──────────────────────────────────────────────────────────
function PatientGallery() {
  const [patients, setPatients] = useState([
    { id: 1, name: "Sarah M.", date: "Oca 2025", treatment: "Hollywood Smile", status: "Tamamlandı", before: null, after: null },
    { id: 2, name: "James T.", date: "Mar 2025", treatment: "Veneer (18 diş)", status: "Devam Ediyor", before: null, after: null },
    { id: 3, name: "Emma K.", date: "Nis 2025", treatment: "Zirkonyum Kaplama", status: "Tamamlandı", before: null, after: null },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", treatment: "", date: "" });
  const [uploadType, setUploadType] = useState(null);
  const [uploadPatientId, setUploadPatientId] = useState(null);
  const fileRef = useRef();
  const statusColors = { "Tamamlandı": "#00ffa3", "Devam Ediyor": "#ffc947" };

  const addPatient = () => {
    if (!newPatient.name || !newPatient.treatment) return;
    setPatients(prev => [...prev, { id: Date.now(), ...newPatient, date: newPatient.date || new Date().toLocaleDateString("tr-TR"), status: "Devam Ediyor", before: null, after: null }]);
    setNewPatient({ name: "", treatment: "", date: "" });
    setShowAdd(false);
  };

  const handleUpload = (e, patientId, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, [type]: url } : p));
  };

  const triggerUpload = (patientId, type) => {
    setUploadPatientId(patientId); setUploadType(type); fileRef.current.click();
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => handleUpload(e, uploadPatientId, uploadType)} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>Hasta Galerisi</div>
          <div style={{ color: "#666", fontSize: 13 }}>Başlangıç & sonuç fotoğrafları</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "linear-gradient(135deg, #00ffa3, #00d4ff)", border: "none", borderRadius: 12, padding: "10px 20px", color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+ Yeni Hasta</button>
      </div>
      {showAdd && (
        <div style={{ background: "rgba(0,255,163,0.05)", border: "1px solid rgba(0,255,163,0.2)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: "#00ffa3", marginBottom: 14 }}>Hasta Ekle</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[["Ad Soyad", "name"], ["Tedavi", "treatment"], ["Tarih", "date"]].map(([label, key]) => (
              <input key={key} placeholder={label} value={newPatient[key]} onChange={e => setNewPatient(p => ({ ...p, [key]: e.target.value }))}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", flex: "1 1 160px" }} />
            ))}
            <button onClick={addPatient} style={{ background: "#00ffa3", border: "none", borderRadius: 10, padding: "10px 20px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Kaydet</button>
            <button onClick={() => setShowAdd(false)} style={{ background: "transparent", border: "1px solid #444", borderRadius: 10, padding: "10px 16px", color: "#888", cursor: "pointer" }}>İptal</button>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {patients.map(patient => (
          <div key={patient.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{patient.name}</div>
                <div style={{ color: "#666", fontSize: 12 }}>{patient.treatment} · {patient.date}</div>
              </div>
              <div style={{ background: (statusColors[patient.status] || "#888") + "22", color: statusColors[patient.status] || "#888", border: `1px solid ${statusColors[patient.status] || "#888"}44`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{patient.status}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {[["before", "ÖNCE"], ["after", "SONRA"]].map(([type, label]) => (
                <div key={type} style={{ position: "relative", aspectRatio: "1", background: "rgba(255,255,255,0.02)", borderRight: type === "before" ? "1px solid rgba(255,255,255,0.06)" : "none", cursor: "pointer", overflow: "hidden" }} onClick={() => triggerUpload(patient.id, type)}>
                  {patient[type] ? <img src={patient[type]} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
                      <div style={{ fontSize: 28, opacity: 0.2 }}>📷</div>
                      <div style={{ fontSize: 10, color: "#555", fontWeight: 700 }}>{label}</div>
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 700, color: type === "before" ? "#ff6b6b" : "#00ffa3" }}>{label}</div>
                </div>
              ))}
            </div>
            {patient.before && patient.after && (
              <div style={{ padding: "10px 20px", textAlign: "center" }}>
                <button style={{ background: "linear-gradient(135deg, #00ffa3, #00d4ff)", border: "none", borderRadius: 20, padding: "6px 20px", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>📤 Sosyal Medyaya Paylaş</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfluencerHub() {
  const [myList, setMyList] = useState([]);
  const [newHandle, setNewHandle] = useState("");
  const [showMail, setShowMail] = useState(null);
  const [loadingMail, setLoadingMail] = useState(false);
  const [mailContent, setMailContent] = useState("");
  const [mailPurpose, setMailPurpose] = useState("işbirliği");

  const addHandle = () => {
    if (!newHandle.trim()) return;
    const h = newHandle.trim().startsWith("@") ? newHandle.trim() : "@" + newHandle.trim();
    setMyList(prev => [...prev, { handle: h, platform: "Instagram", followers: "—", niche: "Belirsiz", country: "—", avatar: h.slice(1, 3).toUpperCase(), engagement: "—" }]);
    setNewHandle("");
  };

  const generateMail = async (influencer) => {
    setShowMail(influencer); setLoadingMail(true); setMailContent("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Sen bir dental sağlık turizmi firmasının sosyal medya uzmanısın. Türkiye'de diş tedavisi hizmetleri sunuyorsunuz (veneer, zirkonyum, hollywood smile, implant). Şu influencer ile ${mailPurpose} için bir İngilizce işbirliği teklif maili yaz:\n\nInfluencer: ${influencer.handle}\nPlatform: ${influencer.platform}\nTakipçi: ${influencer.followers}\nNiş: ${influencer.niche}\nAmaç: ${mailPurpose}\n\nKısa, profesyonel, samimi ve cazip bir mail olsun. Özel teklif detayları ekle (ücretsiz tedavi, konaklama, uçuş). Sadece mail metnini yaz.` }]
        })
      });
      const data = await res.json();
      setMailContent(data.content?.find(b => b.type === "text")?.text || "Hata oluştu.");
    } catch { setMailContent("API hatası."); }
    setLoadingMail(false);
  };

  const allList = [...INFLUENCER_SUGGESTIONS, ...myList.map(m => ({ ...m, custom: true }))];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>Influencer Hub</div>
        <div style={{ color: "#666", fontSize: 13 }}>İşbirliği yapabileceğin hesaplar & AI mail oluşturucu</div>
      </div>
      <div style={{ background: "rgba(0,255,163,0.04)", border: "1px solid rgba(0,255,163,0.15)", borderRadius: 14, padding: 16, marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input placeholder="@instagram_hesabı ekle..." value={newHandle} onChange={e => setNewHandle(e.target.value)} onKeyDown={e => e.key === "Enter" && addHandle()}
          style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none" }} />
        <select value={mailPurpose} onChange={e => setMailPurpose(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "#aaa", fontSize: 13, outline: "none" }}>
          <option value="işbirliği">İşbirliği Teklifi</option>
          <option value="bedava tedavi karşılığı içerik">Ücretsiz Tedavi Teklifi</option>
          <option value="brand ambassador">Brand Ambassador</option>
          <option value="vlog çekimi">Vlog İşbirliği</option>
        </select>
        <button onClick={addHandle} style={{ background: "#00ffa3", border: "none", borderRadius: 10, padding: "10px 18px", color: "#000", fontWeight: 700, cursor: "pointer" }}>+ Ekle</button>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {allList.map((inf, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${inf.custom ? "rgba(0,255,163,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Avatar initials={inf.avatar} size={44} color={inf.custom ? "#00ffa3" : "#00d4ff"} />
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{inf.handle}</span>
                {inf.custom && <span style={{ fontSize: 10, color: "#00ffa3", background: "rgba(0,255,163,0.1)", borderRadius: 10, padding: "1px 8px" }}>Özel</span>}
              </div>
              <div style={{ color: "#666", fontSize: 12 }}>{inf.niche} · {inf.country}</div>
            </div>
            <div style={{ textAlign: "center", minWidth: 70 }}><div style={{ color: "#fff", fontWeight: 700 }}>{inf.followers}</div><div style={{ color: "#555", fontSize: 11 }}>takipçi</div></div>
            <div style={{ textAlign: "center", minWidth: 60 }}><div style={{ color: "#00ffa3", fontWeight: 700 }}>{inf.engagement}</div><div style={{ color: "#555", fontSize: 11 }}>etkileşim</div></div>
            <div style={{ background: platformColors[inf.platform] + "22", color: platformColors[inf.platform], border: `1px solid ${platformColors[inf.platform]}44`, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{inf.platform}</div>
            <button onClick={() => generateMail(inf)} style={{ background: "linear-gradient(135deg, #00ffa3, #00d4ff)", border: "none", borderRadius: 10, padding: "8px 16px", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>✉️ Mail Yaz</button>
          </div>
        ))}
      </div>
      {showMail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setShowMail(null)}>
          <div style={{ background: "#0f0f0f", border: "1px solid rgba(0,255,163,0.3)", borderRadius: 20, padding: 32, maxWidth: 620, width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><div style={{ fontWeight: 700, color: "#00ffa3", fontSize: 16 }}>✉️ İşbirliği Maili</div><div style={{ color: "#666", fontSize: 12 }}>{showMail.handle}</div></div>
              <button onClick={() => setShowMail(null)} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer" }}>✕</button>
            </div>
            {loadingMail ? <div style={{ textAlign: "center", padding: 40 }}><div style={{ color: "#00ffa3" }}>Oluşturuluyor...</div></div> : (
              <>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, color: "#ccc", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>{mailContent}</div>
                <button onClick={() => navigator.clipboard.writeText(mailContent)} style={{ marginTop: 16, background: "#00ffa3", border: "none", borderRadius: 10, padding: "10px 20px", color: "#000", fontWeight: 700, cursor: "pointer", width: "100%" }}>📋 Kopyala</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentIdeas() {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState(CONTENT_IDEAS);
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Tümü");

  const generateIdeas = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Türkiye'de diş sağlığı turizmi yapan bir klinik için sosyal medya içerik fikirleri üret. Konu: "${topic || "genel dental turizm"}". Platform: ${platform}.\n\nSadece JSON dizisi döndür:\n[{"type":"içerik türü","title":"başlık","desc":"açıklama","platform":["platform"],"priority":"Yüksek/Orta/Düşük"}]\n\n5 fikir üret.` }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "[]";
      try { setIdeas(JSON.parse(text.replace(/```json|```/g, "").trim())); } catch { setIdeas(CONTENT_IDEAS); }
    } catch { setIdeas(CONTENT_IDEAS); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>İçerik Önerileri</div>
        <div style={{ color: "#666", fontSize: 13 }}>AI destekli içerik fikri üreteci</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <input placeholder="Konu gir..." value={topic} onChange={e => setTopic(e.target.value)}
          style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none" }} />
        <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "#aaa", fontSize: 13, outline: "none" }}>
          {["Tümü", "Instagram", "TikTok", "YouTube"].map(p => <option key={p}>{p}</option>)}
        </select>
        <button onClick={generateIdeas} disabled={loading} style={{ background: loading ? "#333" : "linear-gradient(135deg, #00ffa3, #00d4ff)", border: "none", borderRadius: 10, padding: "10px 20px", color: loading ? "#666" : "#000", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "⟳ Üretiliyor..." : "✨ AI Fikir Üret"}</button>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {ideas.map((idea, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 22px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ background: "rgba(0,255,163,0.1)", border: "1px solid rgba(0,255,163,0.2)", borderRadius: 10, padding: "6px 12px", fontSize: 11, color: "#00ffa3", fontWeight: 700, whiteSpace: "nowrap" }}>{idea.type}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 15, marginBottom: 4 }}>{idea.title}</div>
              <div style={{ color: "#888", fontSize: 13, lineHeight: 1.5 }}>{idea.desc}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {(Array.isArray(idea.platform) ? idea.platform : [idea.platform]).map(p => (
                  <span key={p} style={{ background: (platformColors[p] || "#555") + "22", color: platformColors[p] || "#aaa", border: `1px solid ${(platformColors[p] || "#555")}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{p}</span>
                ))}
              </div>
            </div>
            <div style={{ background: (priorityColors[idea.priority] || "#888") + "22", color: priorityColors[idea.priority] || "#888", border: `1px solid ${priorityColors[idea.priority] || "#888"}44`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{idea.priority}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const stats = [
    { label: "Toplam Hasta", value: "142", change: "+12 bu ay", icon: "🦷" },
    { label: "Takip Edilen Trend", value: "38", change: "3 yeni bu hafta", icon: "📈" },
    { label: "Influencer", value: "24", change: "6 aktif görüşme", icon: "⭐" },
    { label: "İçerik Fikri", value: "67", change: "15 bu hafta üretildi", icon: "✨" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>Genel Bakış</div>
        <div style={{ color: "#666", fontSize: 13 }}>{new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 22 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{s.value}</div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>{s.label}</div>
            <div style={{ color: "#00ffa3", fontSize: 11, marginTop: 8 }}>{s.change}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 18, fontWeight: 700, color: "#fff", fontSize: 16 }}>🔥 Bu Haftanın Trendleri</div>
      <div style={{ display: "grid", gap: 10 }}>
        {TRENDS.filter(t => t.hot).map((t, i) => <TrendCard key={i} trend={t} />)}
      </div>
    </div>
  );
}

function TrendPage() {
  const [filter, setFilter] = useState("Tümü");
  const platforms = ["Tümü", "Instagram", "TikTok", "YouTube"];
  const filtered = filter === "Tümü" ? TRENDS : TRENDS.filter(t => t.platform === filter);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>Trend Takip</div>
        <div style={{ color: "#666", fontSize: 13 }}>Dental & sağlık turizmi trendleri</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {platforms.map(p => (
          <button key={p} onClick={() => setFilter(p)} style={{ background: filter === p ? "#00ffa3" : "rgba(255,255,255,0.05)", border: `1px solid ${filter === p ? "#00ffa3" : "rgba(255,255,255,0.1)"}`, borderRadius: 20, padding: "6px 16px", color: filter === p ? "#000" : "#888", fontWeight: filter === p ? 700 : 400, cursor: "pointer", fontSize: 13 }}>{p}</button>
        ))}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((t, i) => <TrendCard key={i} trend={t} />)}
      </div>
    </div>
  );
}

// ─── ANA APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const tabIcons = ["🏠", "📈", "📸", "⭐", "✨", "🎙️"];

  const renderTab = () => {
    switch (activeTab) {
      case 0: return <Dashboard />;
      case 1: return <TrendPage />;
      case 2: return <PatientGallery />;
      case 3: return <InfluencerHub />;
      case 4: return <ContentIdeas />;
      case 5: return <SalesScripts />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", zIndex: 100, padding: "28px 0" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ background: "linear-gradient(135deg, #00ffa3, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>Dental<br />Social Hub</div>
          <div style={{ color: "#444", fontSize: 11, marginTop: 4 }}>Sağlık Turizmi · SM Yönetimi</div>
        </div>
        <div style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, border: "none",
              background: activeTab === i ? "rgba(0,255,163,0.1)" : "transparent",
              borderLeft: activeTab === i ? "2px solid #00ffa3" : "2px solid transparent",
              color: activeTab === i ? "#00ffa3" : "#555",
              fontWeight: activeTab === i ? 700 : 400, cursor: "pointer", textAlign: "left", fontSize: 13, width: "100%", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{tabIcons[i]}</span>
              {tab}
              {i === 5 && <span style={{ marginLeft: "auto", background: "rgba(0,255,163,0.15)", color: "#00ffa3", borderRadius: 10, padding: "1px 7px", fontSize: 9, fontWeight: 700 }}>YENİ</span>}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials="SM" size={34} color="#00ffa3" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>Sosyal Medya</div>
              <div style={{ fontSize: 10, color: "#555" }}>Yöneticisi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 220, padding: "36px 40px", maxWidth: 1000 }}>
        {renderTab()}
      </div>
    </div>
  );
}
