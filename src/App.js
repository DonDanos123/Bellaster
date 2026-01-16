import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

// Segédfüggvény a scriptek (QR olvasó, Tailwind) betöltéséhez
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
    // 1. Betöltjük a html5-qrcode könyvtárat a kamera használathoz
    loadScript("https://unpkg.com/html5-qrcode").catch(console.error);

    // 2. AUTOMATIKUSAN betöltjük a Tailwind CSS-t is, hogy szép legyen,
    // akkor is, ha nincs beállítva a CodeSandbox-ban.
    loadScript("https://cdn.tailwindcss.com").catch(console.error);
  }, []);

  // Spotify URL tisztítása ID kinyeréséhez
  const extractSpotifyId = (url) => {
    try {
      if (!url) return null;
      if (url.includes("spotify:track:")) {
        return url.split(":")[2];
      }
      if (url.includes("open.spotify.com/track/")) {
        const parts = url.split("/track/")[1].split("?")[0];
        return parts;
      }
      // Ha csak simán az ID-t írta be (22 karakter)
      if (url.length === 22) return url;
      return null;
    } catch (e) {
      return null;
    }
  };

  const startScanner = () => {
    setScannerActive(true);
    setScanError("");

    // Kis késleltetés, hogy a HTML elem létrejöjjön
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
              // SIKERES OLVASÁS
              const trackId = extractSpotifyId(decodedText);
              if (trackId) {
                setCurrentTrack(trackId);
                setIsRevealed(false);
                scanner.stop().then(() => {
                  scanner.clear();
                  setScannerActive(false);
                });
              } else {
                // Ha a QR kód nem spotify link
              }
            },
            (errorMessage) => {
              // Scannelés közben futó hibák (nem kritikus)
            }
          )
          .catch((err) => {
            setScanError(
              "Nem sikerült elindítani a kamerát. Engedélyezd a hozzáférést a böngészőben!"
            );
          });
      } catch (err) {
        setScanError("Hiba a szkenner betöltésekor. Frissítsd az oldalt!");
      }
    }, 100);
  };

  const stopScanner = () => {
    if (html5QrcodeScanner) {
      html5QrcodeScanner
        .stop()
        .then(() => {
          html5QrcodeScanner.clear();
          setScannerActive(false);
        })
        .catch(console.error);
    } else {
      setScannerActive(false);
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
      alert("Ez nem tűnik érvényes Spotify linknek!");
    }
  };

  // --- STÍLUS ÉS HTML ---

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      {/* Google Font betöltése és Globális Stílusok */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }
        .glass-button:active {
          transform: scale(0.95);
          background: rgba(255, 255, 255, 0.15);
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .bg-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(249,115,22,0.4) 0%, rgba(0,0,0,0) 70%);
          filter: blur(40px);
          z-index: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Háttér effekt */}
      <div className="bg-glow top-0 left-[-100px] animate-pulse"></div>
      <div
        className="bg-glow bottom-0 right-[-100px] bg-[radial-gradient(circle,_rgba(236,72,153,0.3)_0%,_rgba(0,0,0,0)_70%)] animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* --- KEZDŐKÉPERNYŐ --- */}
      {view === "home" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative">
          <div className="mb-10 relative">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-tr from-gray-800 to-black p-8 rounded-full border border-gray-700 shadow-2xl">
              <Disc size={64} className="text-orange-500 animate-spin-slow" />
            </div>
          </div>

          <h1 className="text-6xl font-black mb-2 tracking-tighter text-white drop-shadow-lg">
            BELLA<span className="text-orange-500">STER</span>
          </h1>
          <p className="text-gray-400 mb-16 text-lg font-light tracking-[0.2em] uppercase">
            Szülinapi Kiadás
          </p>

          <div className="w-full max-w-xs space-y-4">
            <button
              onClick={() => setView("game")}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-5 px-8 rounded-2xl shadow-xl shadow-orange-900/50 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg"
            >
              <Play size={28} className="fill-white" /> JÁTÉK INDÍTÁSA
            </button>

            <button
              onClick={() => setView("creator")}
              className="glass-button w-full text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 text-sm tracking-wide"
            >
              <Printer size={18} /> KÁRTYÁK KÉSZÍTÉSE
            </button>
          </div>
        </div>
      )}

      {/* --- KÁRTYA KÉSZÍTŐ --- */}
      {view === "creator" && (
        <div className="flex-1 flex flex-col items-center p-6 z-10 overflow-y-auto w-full max-w-md mx-auto">
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
              placeholder="Spotify Link (pl. https://open.spotify.com...)"
              className="w-full p-4 rounded-xl bg-black/50 border border-gray-700 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600"
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
              <div className="bg-white p-2 border-4 border-black mb-4 rounded-xl">
                <img src={generatedQR} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-black text-center font-bold text-sm mb-4">
                NYOMTASD KI EZT A KÉPET!
              </p>
              <a
                href={generatedQR}
                download="hitster_qr.png"
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

      {/* --- JÁTÉK MÓD --- */}
      {view === "game" && (
        <>
          {/* Játék Fejléc */}
          <div className="p-6 flex justify-between items-center z-20 w-full max-w-md mx-auto">
            <button
              onClick={() => setView("home")}
              className="glass-button p-3 rounded-full text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="bg-orange-500/20 text-orange-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/30">
              Játékban
            </div>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto z-10 relative">
            {/* SZKENNER OVERLAY */}
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

                  {/* Animált szkennelő csík */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-[scan_2s_infinite_linear]"></div>
                  <style>{`@keyframes scan { 0% {top: 0} 50% {top: 100%} 100% {top: 0} }`}</style>
                </div>

                {scanError ? (
                  <p className="text-red-400 mt-8 text-center text-sm bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                    {scanError}
                  </p>
                ) : (
                  <p className="mt-8 text-gray-500 text-sm tracking-widest uppercase">
                    Irányítsd a kamerát a kártyára
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
                {/* ZENE LEJÁTSZÓ KÁRTYA */}
                <div className="relative w-full aspect-[4/5] max-h-[500px] bg-[#121212] rounded-[40px] overflow-hidden shadow-2xl border border-white/5 flex flex-col transition-all duration-500 group">
                  {currentTrack ? (
                    <>
                      {/* Spotify Embed - iframe */}
                      <div className="flex-1 relative w-full h-full bg-black">
                        <iframe
                          src={`https://open.spotify.com/embed/track/${currentTrack}?utm_source=generator&theme=0`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="absolute inset-0 w-full h-full opacity-100" // Opacity full, a fedés takar
                        ></iframe>

                        {/* TAKARÁS / HOMÁLYOSÍTÁS */}
                        {!isRevealed && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-32 h-32 bg-gradient-to-tr from-gray-800 to-black rounded-full shadow-2xl flex items-center justify-center mb-8 border border-white/10 animate-spin-slow">
                              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-white/10">
                                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                              </div>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                              REJTETT DAL
                            </h3>
                            <p className="text-gray-400 mb-8 font-medium text-sm">
                              Indítsd el a lejátszást lent!
                            </p>

                            <div className="glass-panel px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">
                              Ne csalj!
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vezérlők */}
                      <div className="p-6 bg-[#181818] z-30 border-t border-white/5">
                        {!isRevealed ? (
                          <button
                            onClick={() => setIsRevealed(true)}
                            className="w-full bg-white text-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-white/5 flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                          >
                            LELEPLEZÉS <Check size={24} strokeWidth={3} />
                          </button>
                        ) : (
                          <div className="text-center animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <p className="text-green-400 font-bold mb-4 text-xl tracking-tight">
                              Helyes volt a tipp?
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
                    /* Üres állapot (Placeholder) */
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

                {/* Fő akciógomb */}
                {!scannerActive && !currentTrack && (
                  <button
                    onClick={startScanner}
                    className="mt-8 w-full max-w-[280px] bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-lg py-4 rounded-full shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 transform transition active:scale-95 hover:shadow-orange-500/40"
                  >
                    <Camera size={24} strokeWidth={2.5} /> BEOLVASÁS
                  </button>
                )}

                {/* Újra olvasás gomb, ha hiba van */}
                {currentTrack && !isRevealed && (
                  <button
                    onClick={() => {
                      setCurrentTrack(null);
                      startScanner();
                    }}
                    className="mt-6 text-gray-500 hover:text-white text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 py-2 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <RotateCcw size={12} /> Nem indul? Újraolvasás
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
