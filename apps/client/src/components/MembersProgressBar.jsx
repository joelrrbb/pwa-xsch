import React, { useEffect, useState } from 'react';
import { IonText, IonIcon, IonProgressBar } from '@ionic/react';
import { trophyOutline, people, flash, shieldCheckmarkOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';

const MembersProgressBar = () => {
  const [count, setCount] = useState(0);
  const [displayValue, setDisplayValue] = useState("******");
  const [loading, setLoading] = useState(true);
  const [dynamicTarget, setDynamicTarget] = useState(1);
  const [extraProgress, setExtraProgress] = useState(0);
  const [trending, setTrending] = useState(0);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // 1. Obtener conteo real de miembros
        const { count: dbCount, error: countError } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });

        // 2. Obtener configuración de la tabla statistics (fakes y target)
        const { data: stats, error: statsError } = await supabase
          .from('statistics')
          .select('fake_members_count, target_goal, trending')
          .single();

        if (countError || statsError) throw (countError || statsError);

        // 3. Combinar datos
        const fakes = stats?.fake_members_count || 0;
        const target = stats?.target_goal || 5000;
        const finalInitialCount = (dbCount || 0) + fakes;
		const trendingValue = stats?.trending ?? 0; 
		
        
        console.log("Datos DB:", { real: dbCount, total: finalInitialCount });

        setCount(finalInitialCount);
        setDynamicTarget(target);
		setTrending(trendingValue);

        // Lógica de meta dinámica original
        // if (finalInitialCount > target * 0.8) {
          // setDynamicTarget(Math.ceil(finalInitialCount / 1000) * 1000 + 2000);
        // }
      } catch (err) {
        console.error("Error fetching data:", err);
        setCount(1000); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, []);

  useEffect(() => {
    if (loading) return;
    let timeoutId;
    const scheduleNextIncrement = () => {
      const randomTime = Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000;
      timeoutId = setTimeout(() => {
        setCount(prev => {
          const nextValue = prev + 1;
          if (nextValue > dynamicTarget * 0.9) setDynamicTarget(old => old + 1000);
          return nextValue;
        });
        scheduleNextIncrement();
      }, randomTime);
    };
    scheduleNextIncrement();
    return () => clearTimeout(timeoutId);
  }, [loading, dynamicTarget]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExtraProgress(0.03);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (count === 0) return;
    let iterations = 0;
    const strValue = count.toString();
    const finalTargetStr = "*".repeat(Math.max(0, 7 - strValue.length)) + strValue;

    const animInterval = setInterval(() => {
      setDisplayValue(
        finalTargetStr.split("").map((char, index) => {
          if (char === "*") return "*"; 
          if (iterations > 10) return char;
          return "0123456789"[Math.floor(Math.random() * 10)];
        }).join("")
      );
      if (iterations > 15) clearInterval(animInterval);
      iterations++;
    }, 50);
    return () => clearInterval(animInterval);
  }, [count]);

  const daysLeft = Math.max(0, Math.ceil((new Date('2026-03-22') - new Date()) / (1000 * 60 * 60 * 24)));
  const totalPercentage = Math.min((count / dynamicTarget) + extraProgress, 0.99);

  return (
    <div className="relative overflow-hidden p-6 bg-gradient-to-br from-slate-950 via-black to-slate-900 rounded-[2.5rem] border border-green-500/20 shadow-2xl font-sans">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
		  
			<div className="relative">
              <img src="/xsch-1.svg" alt="Logo" className="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
            </div>
			
            <div>
              <IonText className="text-[10px] font-black text-green-500/50 tracking-[0.4em] uppercase block mb-1">
                Fuerza electoral
              </IonText>
              <div className="flex items-baseline font-mono">
                <h2 className="text-4xl font-black tracking-tighter">
                  {displayValue.split(-2).map((char, i) => (
                    <span 
                      key={i} 
                      className="font-bold text-white drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]"
                    >
                      {char}
                    </span>
                  ))}
                </h2>
                
              </div>
            </div>
          </div>

          <div className="text-right bg-green-500/10 p-2 rounded-xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <div className="text-xl font-black text-green-400 italic leading-none">
              +{trending}%
            </div>
            <div className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-center">Tendencia</div>
          </div>
		  
        </div>

        <div className="relative mb-4">
		
		  <div className="flex justify-between items-end mb-3 px-1">
            <div className="flex flex-col">
              <span className="text-[7px] font-bold text-slate-600 uppercase tracking-[0.2em]">Intención de apoyo</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">{((count / dynamicTarget) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[7px] font-bold text-green-500/50 uppercase tracking-[0.2em]">Proyección estimada</span>
              <span className="text-[10px] font-mono text-green-400 font-bold">85.2%</span>
            </div>
          </div>
          

          <div className="relative group">
            {/* Animación de Shimmer sobre la barra */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
              <div className="w-full h-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full" />
            </div>

            <IonProgressBar 
              type="buffer"
              color="success"
              value={totalPercentage} 
              buffer={totalPercentage + 0.15} // El buffer da sensación de "capacidad de reserva"
              className="h-3 rounded-full overflow-hidden bg-white/5 border border-white/5 shadow-inner"
            />
          </div>
        </div>

        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <IonIcon icon={shieldCheckmarkOutline} className="text-slate-600 text-sm" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">
              Datos sincronizados
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl">
            <IonIcon icon={flash} className="text-green-400 text-xs animate-bounce" />
            <span className="text-[10px] font-black text-green-400 uppercase tracking-tighter">
              Faltan {daysLeft} días
            </span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default MembersProgressBar;