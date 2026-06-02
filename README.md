# YucelSinMedia — Dental Social Hub

Diş sağlığı turizmi için sosyal medya yönetim paneli. Tek dosya (`index.html`), kurulum gerektirmez — tarayıcıda açılır.

## Bölümler
- **Dashboard** — Araştırmaya dayalı güncel trendler (TikTok / Instagram / YouTube), tıkla → platforma git.
- **Trend Takip** — Platform filtreli trend listesi.
- **Hasta Galerisi** — Önce/sonra fotoğraf arşivi (tarayıcıda kalıcı).
- **Influencer Hub** — İşbirliği listesi, Excel/CSV içe aktarma, Mail/DM, AI mesaj üretimi, "gönderildi" durumu ve silme.
- **İçerik Önerileri** — AI ile içerik fikri üretici.
- **Hasta Röportajları** — Gerçek hasta hikayelerinden Instagram içeriği (1./3. şahıs, çoklu format).

## AI kurulumu
Sol alttaki ⚙ → API anahtarı gir. Desteklenen (tarayıcıdan çalışan) sağlayıcılar:
- **Google Gemini** (ücretsiz) — `AIza...` · aistudio.google.com/apikey
- **Groq** (ücretsiz) — `gsk_...` · console.groq.com/keys
- **Anthropic Claude** (ücretli) — `sk-ant-...`

> Not: OpenAI/ChatGPT anahtarları tarayıcıdan doğrudan çalışmaz (CORS).
> API anahtarı yalnızca tarayıcıda (localStorage) saklanır, repoya yazılmaz.

## Yayın
GitHub Pages ile yayınlanır; `index.html` kök dizindedir.
