import React, { useState, useEffect } from "react";
import {
  Camera,
  Play,
  Check,
  Music,
  Printer,
  Heart,
  RotateCcw,
  X,
  Gift,
  Disc,
  LogIn,
} from "lucide-react";

// Segédfüggvény a scriptek betöltéséhez
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export default function App() {
  const [view, setView] = useState("home"); // home, game, creator
  const [scannerActive, setScannerActive] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [html5QrcodeScanner, setHtml5QrcodeScanner] = useState(null);
  const [scanError, setScanError] = useState("");

  // Kártya készítő állapota
  const [inputUrl, setInputUrl] = useState("");
  const [generatedQR, setGeneratedQR] = useState(null);

  useEffect(() => {
    // Könyvtárak betöltése
    loadScript("https://unpkg.com/html5-qrcode").catch(console.error);
    loadScript("https://cdn.tailwindcss.com").catch(console.error);
  }, []);

  // Spotify URL tisztítása
  const extractSpotifyId = (url) => {
    try {
      if (!url) return null;
      if (url.includes("spotify:track:")) return url.split(":")[2];
      if (url.includes("open.spotify.com/track/"))
        return url.split("/track/")[1].split("?")[0];
      if (url.length === 22) return url;
      return null;
    } catch (e) {
      return null;
    }
  };

  const startScanner = () => {
    setScannerActive(true);
    setScanError("");

    setTimeout(() => {
      try {
        const scanner = new window.Html5Qrcode("reader");
        setHtml5QrcodeScanner(scanner);
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        scanner
          .start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              const trackId = extractSpotifyId(decodedText);
              if (trackId) {
                setScannerActive(false);
                setCurrentTrack(trackId);
                setIsRevealed(false);
                scanner
                  .stop()
                  .then(() => scanner.clear())
                  .catch(console.error);
              }
            },
            (errorMessage) => {}
          )
          .catch((err) => {
            setScanError("Engedélyezd a kamerát!");
          });
      } catch (err) {
        setScanError("Hiba a szkennernél. Frissíts!");
      }
    }, 100);
  };

  const stopScanner = () => {
    setScannerActive(false);
    if (html5QrcodeScanner) {
      html5QrcodeScanner
        .stop()
        .then(() => {
          html5QrcodeScanner.clear();
        })
        .catch(console.error);
    }
  };

  const generateQRCode = () => {
    const id = extractSpotifyId(inputUrl);
    if (id) {
      const url = `https://open.spotify.com/track/${id}`;
      setGeneratedQR(
        `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
          url
        )}`
      );
    } else {
      alert("Rossz Spotify link!");
    }
  };

  const handleSpotifyLogin = () => {
    window.open(
      "https://accounts.spotify.com/login?continue=https://open.spotify.com",
      "_blank"
    );
  };

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      {/* Stílusok */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap');
        
        html, body {
          margin: 0;
          padding: 0;
          background-color: #0a0a0a;
          overscroll-behavior: none; /* Letiltja a rugózást */
          overflow: hidden; /* Letiltja a görgetést */
          height: 100%;
          width: 100%;
          position: fixed; /* Rögzíti a nézetet */
        }

        body { font-family: 'Inter', sans-serif; }
        
        .glass-panel { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .glass-button { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.2s ease; }
        .glass-button:active { transform: scale(0.95); background: rgba(255, 255, 255, 0.15); }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .click-through { pointer-events: none; }
      `}</style>

      {/* Háttér */}
      <div className="absolute top-0 left-[-100px] w-[300px] h-[300px] bg-orange-500/40 blur-[40px] animate-pulse pointer-events-none"></div>
      <div
        className="absolute bottom-0 right-[-100px] w-[300px] h-[300px] bg-pink-500/30 blur-[40px] animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* --- HOME VIEW --- */}
      {view === "home" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative h-full">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-tr from-gray-800 to-black p-8 rounded-full border border-gray-700 shadow-2xl">
              <Disc size={64} className="text-orange-500 animate-spin-slow" />
            </div>
          </div>
          <h1 className="text-5xl font-black mb-2 tracking-tighter text-white drop-shadow-lg">
            BELLA<span className="text-orange-500">STER</span>
          </h1>
          <p className="text-gray-400 mb-8 text-lg font-light tracking-[0.2em] uppercase">
            Szülinapi Kiadás
          </p>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={() => setView("game")}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-5 px-8 rounded-2xl shadow-xl shadow-orange-900/50 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg"
            >
              <Play size={28} className="fill-white" /> JÁTÉK INDÍTÁSA
            </button>

            <button
              onClick={handleSpotifyLogin}
              className="glass-button w-full text-green-400 font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 text-sm tracking-wide border-green-500/30"
            >
              <LogIn size={18} /> SPOTIFY CSATLAKOZÁS
            </button>
            <p className="text-[10px] text-gray-500 max-w-[250px] mx-auto leading-tight">
              A teljes dalok lejátszásához egyszer be kell jelentkezned a
              böngészőben.
            </p>

            <button
              onClick={() => setView("creator")}
              className="glass-button w-full text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 text-sm tracking-wide mt-2"
            >
              <Printer size={18} /> KÁRTYÁK KÉSZÍTÉSE
            </button>
          </div>
        </div>
      )}

      {/* --- CREATOR VIEW --- */}
      {view === "creator" && (
        <div className="flex-1 flex flex-col items-center p-6 z-10 overflow-y-auto w-full max-w-md mx-auto h-full">
          <button
            onClick={() => setView("home")}
            className="self-start mb-8 text-gray-400 hover:text-white flex items-center gap-2 font-medium glass-button px-4 py-2 rounded-full text-xs"
          >
            <RotateCcw size={14} /> VISSZA
          </button>
          <h2 className="text-3xl font-black mb-2 text-white">KÁRTYA GYÁR</h2>
          <p className="text-sm text-gray-400 mb-10 text-center leading-relaxed">
            Másold be a Spotify linket, és mentsd le a generált kódot.
          </p>
          <div className="w-full glass-panel p-6 rounded-3xl space-y-4 mb-8">
            <input
              type="text"
              placeholder="Spotify Link..."
              className="w-full p-4 rounded-xl bg-black/50 border border-gray-700 text-white focus:outline-none focus:border-orange-500 transition-colors"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            <button
              onClick={generateQRCode}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Gift size={20} /> GENERÁLÁS
            </button>
          </div>
          {generatedQR && (
            <div className="bg-white p-6 rounded-3xl flex flex-col items-center shadow-2xl w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
              <img
                src={generatedQR}
                alt="QR Code"
                className="w-48 h-48 mb-4 border-4 border-black rounded-xl"
              />
              <a
                href={generatedQR}
                download="bellaster_qr.png"
                target="_blank"
                rel="noreferrer"
                className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-800"
              >
                MENTÉS
              </a>
            </div>
          )}
        </div>
      )}

      {/* --- GAME VIEW --- */}
      {view === "game" && (
        <>
          <div className="p-4 flex justify-between items-center z-20 w-full max-w-md mx-auto">
            <button
              onClick={() => setView("home")}
              className="glass-button p-2 rounded-full text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="bg-orange-500/20 text-orange-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/30">
              Játékban
            </div>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto z-10 relative h-full max-h-[85vh]">
            {scannerActive ? (
              <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                <h3 className="text-white text-2xl font-bold mb-8 tracking-tight">
                  KÓD KERESÉSE...
                </h3>
                <div className="relative w-full max-w-xs aspect-square overflow-hidden rounded-[30px] border-4 border-white/10 shadow-2xl bg-black">
                  <div
                    id="reader"
                    className="w-full h-full object-cover opacity-80"
                  ></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-[scan_2s_infinite_linear]"></div>
                  <style>{`@keyframes scan { 0% {top: 0} 50% {top: 100%} 100% {top: 0} }`}</style>
                </div>
                {scanError && (
                  <p className="text-red-400 mt-8 text-center text-sm">
                    {scanError}
                  </p>
                )}
                <button
                  onClick={stopScanner}
                  className="mt-12 glass-button px-10 py-3 rounded-full text-white font-bold tracking-wide text-sm"
                >
                  MÉGSE
                </button>
              </div>
            ) : (
              <>
                <div className="relative w-full h-full max-h-[65vh] bg-[#121212] rounded-[30px] overflow-hidden shadow-2xl border border-white/5 flex flex-col transition-all duration-500 group">
                  {currentTrack ? (
                    <>
                      {/* SPOTIFY IFRAME */}
                      <div className="flex-1 relative w-full h-full bg-black">
                        <iframe
                          src={`https://open.spotify.com/embed/track/${currentTrack}?utm_source=generator&theme=0`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="absolute inset-0 w-full h-full opacity-100 z-10"
                        ></iframe>

                        {/* HOMÁLYOSÍTÓ RÉTEG - IGAZI BLUR ÉS FELJEBB VIVE */}
                        {!isRevealed && (
                          <div className="absolute top-0 left-0 right-0 bottom-[170px] bg-black/40 backdrop-blur-3xl z-20 flex flex-col items-center justify-center p-8 text-center border-b-2 border-green-500/50 shadow-2xl">
                            <div className="bg-white/10 p-4 rounded-full mb-4">
                              <Music
                                size={40}
                                className="text-white animate-pulse"
                              />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              Rejtett Dal
                            </h3>
                            <p className="text-gray-300 text-sm">
                              A borító és a cím titkos!
                            </p>
                            <p className="text-green-500 text-xs font-bold mt-4 uppercase animate-bounce">
                              ↓ Nyomj a Play gombra lent! ↓
                            </p>
                          </div>
                        )}
                      </div>

                      {/* VEZÉRLŐK */}
                      <div className="p-4 bg-[#181818] z-30 border-t border-white/5 shrink-0">
                        {!isRevealed ? (
                          <button
                            onClick={() => setIsRevealed(true)}
                            className="w-full bg-white text-black font-black text-lg py-4 rounded-2xl shadow-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
                          >
                            LELEPLEZÉS <Check size={24} />
                          </button>
                        ) : (
                          <div className="text-center animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <p className="text-green-400 font-bold mb-2 text-xl">
                              Ez volt a helyes válasz?
                            </p>
                            <button
                              onClick={() => {
                                setCurrentTrack(null);
                                setIsRevealed(false);
                              }}
                              className="text-gray-400 hover:text-white underline decoration-2 underline-offset-4 py-2 text-sm uppercase tracking-wide font-bold"
                            >
                              Következő kártya
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-[#181818] to-black">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center mb-6 opacity-50">
                        <Camera size={32} className="text-gray-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        HÚZZ EGY KÁRTYÁT
                      </h3>
                      <p className="text-gray-500 text-xs uppercase tracking-widest max-w-[200px]">
                        És olvasd be a QR kódot a kezdéshez
                      </p>
                    </div>
                  )}
                </div>

                {/* ÚJ GOMBOK A KÁRTYA ALATT */}
                <div className="w-full mt-4 space-y-2 shrink-0">
                  {!scannerActive && !currentTrack && (
                    <button
                      onClick={startScanner}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-lg py-4 rounded-full shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 transform transition active:scale-95 hover:shadow-orange-500/40"
                    >
                      <Camera size={24} strokeWidth={2.5} /> BEOLVASÁS
                    </button>
                  )}

                  {currentTrack && !isRevealed && (
                    <button
                      onClick={() => {
                        setCurrentTrack(null);
                        startScanner();
                      }}
                      className="w-full text-gray-500 hover:text-white text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 py-2 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <RotateCcw size={12} /> Újraolvasás
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
