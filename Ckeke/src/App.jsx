import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import FinalCake from './FinalCake';
import { useOrderStore } from './store';

export default function App() {
  const { addDecoration, decorations, selectedId, removeDecoration, setSelectedId } = useOrderStore();
  const selectedDec = decorations.find(d => d.id === selectedId);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0d0607', position: 'relative' }}>
      
      {/* المشهد 3D */}
      <Canvas camera={{ position: [0, 4, 10], fov: 45 }} shadows>
        <ambientLight intensity={0.5} />
        <Environment preset="studio" />
        <FinalCake />
        <ContactShadows position={[0, -1.15, 0]} opacity={0.4} scale={10} blur={2} />
        <OrbitControls makeDefault />
      </Canvas>

      {/* لوحة التحكم بالعنصر (تظهر عند الاختيار) */}
      {selectedDec && (
        <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.95)', padding: 15, borderRadius: 15, direction: 'rtl', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
          <p>العنصر: {selectedDec.type}</p>
          <button onClick={() => removeDecoration(selectedDec.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: 8, cursor: 'pointer' }}>حذف الشكل</button>
        </div>
      )}

      {/* مكتبة الأشكال */}
      <div style={{ position: 'absolute', bottom: 0, width: '100%', background: '#fff', padding: 20, borderRadius: '20px 20px 0 0', direction: 'rtl', boxShadow: '0 -5px 20px rgba(0,0,0,0.2)' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>مكتبة الأشكال</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {['🌹 ورد', '👑 تاج', '🦋 فراشات', '💖 قلب', '🎓 تخرج', '💍 خاتم'].map(item => (
            <button key={item} onClick={() => addDecoration(item)} style={{ padding: '10px', borderRadius: 10, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}>{item}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
