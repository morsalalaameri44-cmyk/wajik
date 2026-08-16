import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import FinalCake from './FinalCake';
import { useOrderStore } from './store';

// الموجه الرئيسي
export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const { layers, addLayer, removeLayer, updateLayerColor, addDecoration } = useOrderStore();
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', fontFamily: 'sans-serif' }}>
      
      {/* 1. المشهد 3D (دائم في الخلفية) */}
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas camera={{ position: [0, 4, 10], fov: 45 }} shadows>
          <ambientLight intensity={0.5} />
          <Environment preset="studio" />
          <FinalCake />
          <ContactShadows position={[0, -1.15, 0]} opacity={0.4} scale={10} blur={2} />
          <OrbitControls makeDefault />
        </Canvas>
      </div>

      {/* 2. واجهة التحكم (Overlays) */}
      {isPanelOpen && (
        <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'white', padding: '20px', borderRadius: '20px 20px 0 0', direction: 'rtl' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>إضافة زينة احترافية</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {['🌹 ورد', '👑 تاج', '🦋 فراشات', '✍️ كتابة'].map(item => (
              <button key={item} onClick={() => addDecoration(item)} style={{ padding: '10px', borderRadius: '8px' }}>{item}</button>
            ))}
          </div>
          <button onClick={() => alert('نظام المراجعة يعمل الآن!')} style={{ width: '100%', marginTop: '15px', padding: '15px', background: '#d4af37', border: 'none' }}>اعتماد الطلب ➜</button>
        </div>
      )}
    </div>
  );
}
