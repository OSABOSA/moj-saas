"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { supabase } from "../lib/supabase";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrList, setQrList] = useState<any[]>([]); // Lista kodów
  
  const { user, isLoaded } = useUser();

  // 1. Funkcja do obsługi płatności (NOWOŚĆ)
  const handleCheckout = async () => {
    try {
      // Pukamy do naszego backendu
      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      const data = await response.json();

      // Jeśli backend zwrócił URL do Stripe, to tam idziemy
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Błąd: Nie otrzymano linku do płatności");
      }
    } catch (error) {
      console.error("Błąd płatności:", error);
      alert("Coś poszło nie tak z płatnością.");
    }
  };

  const fetchQrCodes = async () => {
    if (!isLoaded || !user) return;

    const { data, error } = await supabase
      .from('qrcodes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.log('Błąd:', error);
    else setQrList(data || []);
  };

  useEffect(() => {
    fetchQrCodes();
  }, [user, isLoaded]);

  const saveQRCode = async () => {
    if (!text) return alert("Wpisz coś!");
    if (!user) return alert("Musisz być zalogowany!");

    setLoading(true);
    
    const { error } = await supabase
      .from('qrcodes')
      .insert([
        { 
          url: text, 
          user_id: user.id 
        }
      ]);

    setLoading(false);

    if (error) {
      alert("Błąd: " + error.message);
    } else {
      fetchQrCodes();
      setText(""); 
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-8">
      
      {/* Nawigacja */}
      <nav className="w-full max-w-2xl flex justify-between items-center mb-10 p-4 bg-white rounded-xl shadow-sm">
        <div className="font-bold text-lg text-gray-800">QR Master</div>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                Zaloguj się
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Główna sekcja - widoczna tylko dla zalogowanych */}
      <SignedIn>
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col items-center gap-6 mb-10">
          
          {/* 2. Przycisk Płatności (NOWOŚĆ) */}
          <button 
            onClick={handleCheckout}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            💎 Kup Wersję PRO (20 PLN)
          </button>

          <hr className="w-full border-gray-100" />

          <h1 className="text-2xl font-bold text-gray-800">Twój Generator</h1>
          
          <input
            type="text"
            placeholder="Wpisz link..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="bg-white p-4 border-2 border-dashed border-gray-200 rounded-xl">
            {text ? (
              <QRCode value={text} size={150} />
            ) : (
              <div className="h-[150px] w-[150px] bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                Podgląd QR
              </div>
            )}
          </div>

          <button
            onClick={saveQRCode}
            disabled={loading || !text}
            className={`w-full p-3 rounded-lg font-bold text-white transition-colors ${
              loading || !text ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Zapisywanie..." : "Zapisz w Mojej Historii"}
          </button>
        </div>

        {/* Lista Historii */}
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Twoje kody</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {qrList.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100">
                <div className="shrink-0">
                  <QRCode value={item.url} size={50} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.url}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            
            {qrList.length === 0 && (
              <p className="text-center text-gray-400 col-span-2">Nie masz jeszcze żadnych kodów.</p>
            )}
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Zaloguj się, aby tworzyć kody</h2>
          <p className="text-gray-600">Twoje kody będą bezpiecznie przechowywane w chmurze.</p>
        </div>
      </SignedOut>

    </main>
  );
}