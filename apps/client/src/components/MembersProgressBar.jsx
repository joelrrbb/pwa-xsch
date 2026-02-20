import React, { useEffect, useState } from 'react';
import { IonText, IonIcon, IonProgressBar } from '@ionic/react';
import { flash, shieldCheckmarkOutline } from 'ionicons/icons';
import SlotCounter from 'react-slot-counter';
import { supabase } from '../supabaseClient';

const MembersProgressBar = () => {
  const [count, setCount] = useState(0);
  const [maskValue, setMaskValue] = useState('*****');
  const [loading, setLoading] = useState(true);
  const [dynamicTarget, setDynamicTarget] = useState(5000);
  const [trending, setTrending] = useState(0);
  const [showToast, setShowToast] = useState(false);
  
  // animKey es vital para forzar a que el componente "caiga" o gire de nuevo
  const [animKey, setAnimKey] = useState(0);

  // 1. Carga de datos de Supabase
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { count: dbCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
        const { data: stats } = await supabase.from('statistics').select('*').single();
        const fakes = stats?.fake_members_count || 0;
        setCount((dbCount || 0) + fakes);
        setDynamicTarget(stats?.target_goal || 5000);
        setTrending(stats?.trending ?? 0);
      } catch (err) {
        setCount(100000);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, []);

  // 2. Lógica del giro infinito que SIEMPRE cae en *
  useEffect(() => {
    const interval = setInterval(() => {
      // Forzamos el cambio de Key para que el SlotCounter re-anime desde números hasta el asterisco
      setAnimKey(prev => prev + 1);
      setMaskValue('*****'); 
    }, 3500); // Cada 4 segundos giran los números y caen en asterisco
    
    return () => clearInterval(interval);
  }, []);

  // 3. Lógica de incremento real (Solo el último dígito se ve real)
  useEffect(() => {
    if (loading) return;
    const scheduleNext = () => {
      const randomTime = Math.floor(Math.random() * 15000) + 5000;
      return setTimeout(() => {
        setCount(prev => prev + 1);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        scheduleNext();
      }, randomTime);
    };
    const timeoutId = scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [loading]);

  const daysLeft = Math.max(0, Math.ceil((new Date('2026-03-22') - new Date()) / 86400000));
  const lastDigit = count.toString().slice(-1); 
  const totalPercentage = Math.min(count / dynamicTarget, 0.99);

  return (
    <div className="relative overflow-hidden p-6 bg-gradient-to-br from-slate-950 via-black to-slate-900 rounded-[2.5rem] border border-green-500/20 shadow-2xl font-sans">
      
      {/* NOTIFICACIÓN TIPO ISLA */}
      <div className={`absolute top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${
        showToast ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
      }`}>
        <div className="min-w-[150px] justify-center bg-green-500 text-black text-[9px] font-black px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] uppercase flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
          Nuevo miembro añadido
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="/xsch-1.svg" alt="Logo" className="w-14 h-14 object-contain" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
            </div>
            
            <div>
              <IonText className="text-[10px] font-black text-green-500/50 tracking-[0.4em] uppercase block mb-1">
                Fuerza electoral
              </IonText>
              
              <div className="flex items-baseline font-mono text-3xl font-black tracking-tighter text-white">
                {/* MÁSCARA: Gira números y siempre aterriza en asterisco */}
                <div className="opacity-30">
                  <SlotCounter 
                    key={animKey}
                    value={maskValue} 
                    duration={2.0} // Tiempo que tardan los números en caer al asterisco
                    dummyCharacters={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']}
                    animateOnVisible={false}
                  />
                </div>
                
                {/* ÚLTIMO DÍGITO: El único que siempre muestra el valor real */}
                <div className="drop-shadow-[0_0_12px_rgba(74,222,128,0.8)] ml-1">
                  <SlotCounter 
                    key={`digit-${count}`}
                    value={lastDigit}
                    duration={1.2}
                    useMonospaceFont
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-right bg-green-500/10 p-2 rounded-xl border border-green-500/20">
            <div className="text-xl font-black text-green-400 italic leading-none">+{trending}%</div>
            <div className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-center">Tendencia</div>
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="relative mb-4">
          <div className="flex justify-between items-end mb-3 px-1 text-[7px] font-bold uppercase tracking-widest text-slate-600">
            <div className="flex flex-col">
              <span>Intención de apoyo</span>
              <span className="text-[10px] font-mono text-slate-500">{(totalPercentage * 100).toFixed(1)}%</span>
            </div>
            <div className="flex flex-col text-right text-green-500/50">
              <span>Proyección estimada</span>
              <span className="text-[10px] font-mono text-green-400">85.2%</span>
            </div>
          </div>
          <IonProgressBar 
            type="buffer"
            color="success"
            value={totalPercentage} 
            buffer={totalPercentage + 0.1}
            className="h-3 rounded-full overflow-hidden bg-white/5"
          />
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <IonIcon icon={shieldCheckmarkOutline} className="text-slate-600 text-sm" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">Datos sincronizados</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl font-black text-green-400 text-[10px]">
            <IonIcon icon={flash} className="animate-bounce" />
            <span>Faltan {daysLeft} días</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersProgressBar;