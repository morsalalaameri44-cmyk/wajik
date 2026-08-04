import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import FinalCake from './FinalCake'; 
import { useOrderStore } from './store';

export default function App() {
  // تم التأكد من جلب الدالة الصحيحة (updateLayerColor)
  const { layers, addLayer, removeLayer, updateLayerColor } = useOrderStore();
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, #2c1618 0%, #0d0607 100%)', fontFamily: 'sans-serif' }}>
      
      <Canvas camera={{ position: [0, 4, 10], fov: 45 }} shadows>
        <ambientLight intensity={0.4} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2.5} castShadow />
        <Environment preset="studio" />
        
        <FinalCake />
        
        <ContactShadows position={[0, -1.15, 0]} opacity={0.8} scale={15} blur={2.5} far={4} color="#000000" />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enableZoom={true} />
      </Canvas>

      <button 
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        style={{
          position: 'absolute', top: '20px', left: '20px', zIndex: 50,
          backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '30px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease',
          backdropFilter: 'blur(5px)'
        }}
      >
        {isPanelOpen ? '👁️ عرض ملء الشاشة' : '🎨 تعديل التصميم'}
      </button>

      <div style={{
        position: 'absolute', bottom: '20px', left: '50%',
        transform: `translate(-50%, ${isPanelOpen ? '0' : '120%'})`,
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '90%', maxWidth: '400px', 
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderRadius: '24px', padding: '24px', boxShadow: '0 15px 50px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '20px',
        direction: 'rtl', maxHeight: '70vh', overflowY: 'auto'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, color: '#150a0a', fontSize: '22px', fontWeight: '900' }}>المراسيم</h2>
              <span style={{ fontSize: '11px', backgroundColor: '#2c1618', color: '#d4af37', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>Cake Studio</span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>يحبرها قلبك.. صمم كيكتك الخاصة</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={addLayer} disabled={layers.length >= 3} style={{ width: '35px', height: '35px', borderRadius: '8px', border: 'none', backgroundColor: layers.length >= 3 ? '#e5e7eb' : '#2c1618', color: layers.length >= 3 ? '#9ca3af' : '#d4af37', fontSize: '18px', cursor: layers.length >= 3 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>+</button>
            <button onClick={removeLayer} disabled={layers.length <= 1} style={{ width: '35px', height: '35px', borderRadius: '8px', border: 'none', backgroundColor: layers.length <= 1 ? '#e5e7eb' : '#ef4444', color: layers.length <= 1 ? '#9ca3af' : 'white', fontSize: '18px', cursor: layers.length <= 1 ? 'not-allowed' : 'pointer' }}>-</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {layers.map((layer, index) => (
            <div key={layer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: '10px 15px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                {index === 0 ? 'الطبقة السفلية' : index === 1 ? 'الطبقة الوسطى' : 'الطبقة العلوية'}
              </span>
              {/* هنا تم تصحيح الخطأ البرمجي واستخدام updateLayerColor */}
              <input type="color" value={layer.color} onChange={(e) => updateLayerColor(index, e.target.value)} style={{ width: '35px', height: '35px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }} />
            </div>
          ))}
        </div>
        
        <button style={{ width: '100%', padding: '14px', backgroundColor: '#2c1618', color: '#d4af37', border: '1px solid #d4af37', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          تأكيد التصميم والانتقال للسعر
        </button>
      </div>
    </div>
  );
}
