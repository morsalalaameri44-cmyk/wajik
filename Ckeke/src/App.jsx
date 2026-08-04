import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, SpotLight } from '@react-three/drei';
import CakeModel from './CakeModel';
import { useOrderStore } from './store';

export default function App() {
  const { layers, addLayer, removeLayer, updateLayerColor } = useOrderStore();
  // حالة للتحكم بظهور أو إخفاء القائمة
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    // خلفية متدرجة تشبه إضاءة استوديو التصوير
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #d1d5db 100%)', fontFamily: 'sans-serif' }}>
      
      {/* استوديو 3D */}
      <Canvas camera={{ position: [0, 4, 10], fov: 45 }} shadows>
        <ambientLight intensity={0.5} />
        {/* إضاءة مسلطة كاستوديو حقيقي */}
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <Environment preset="studio" />
        <CakeModel />
        <ContactShadows position={[0, -1.15, 0]} opacity={0.7} scale={15} blur={2.5} far={4} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enableZoom={true} />
      </Canvas>

      {/* زر العرض بملء الشاشة (يطفو في الزاوية العلوية) */}
      <button 
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        style={{
          position: 'absolute', top: '20px', left: '20px', zIndex: 50,
          backgroundColor: '#ffffff', color: '#111827', border: 'none',
          borderRadius: '30px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease'
        }}
      >
        {isPanelOpen ? '👁️ عرض ملء الشاشة' : '🎨 تعديل التصميم'}
      </button>

      {/* لوحة التحكم العائمة (مع حركة انسيابية للاختفاء والظهور) */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '50%',
        // هنا يتم سحب القائمة للأسفل لإخفائها بناءً على حالة الزر
        transform: `translate(-50%, ${isPanelOpen ? '0' : '120%'})`,
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '90%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '20px',
        direction: 'rtl', maxHeight: '70vh', overflowY: 'auto'
      }}>
        
        {/* الترويسة وأزرار التحكم بالطبقات */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: '800' }}>Cake Studio</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>صمم كيكتك الخاصة طبقة بطبقة</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={addLayer} disabled={layers.length >= 3} style={{ width: '35px', height: '35px', borderRadius: '8px', border: 'none', backgroundColor: layers.length >= 3 ? '#e5e7eb' : '#111827', color: layers.length >= 3 ? '#9ca3af' : 'white', fontSize: '18px', cursor: layers.length >= 3 ? 'not-allowed' : 'pointer' }}>+</button>
            <button onClick={removeLayer} disabled={layers.length <= 1} style={{ width: '35px', height: '35px', borderRadius: '8px', border: 'none', backgroundColor: layers.length <= 1 ? '#e5e7eb' : '#ef4444', color: layers.length <= 1 ? '#9ca3af' : 'white', fontSize: '18px', cursor: layers.length <= 1 ? 'not-allowed' : 'pointer' }}>-</button>
          </div>
        </div>

        {/* قائمة تلوين الطبقات */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {layers.map((layer, index) => (
            <div key={layer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: '10px 15px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                {index === 0 ? 'الطبقة السفلية' : index === 1 ? 'الطبقة الوسطى' : 'الطبقة العلوية'}
              </span>
              <input type="color" value={layer.color} onChange={(e) => updateLayerColor(index, e.target.value)} style={{ width: '35px', height: '35px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }} />
            </div>
          ))}
        </div>
        
        <button style={{ width: '100%', padding: '14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          تأكيد التصميم والانتقال للسعر
        </button>
      </div>
    </div>
  );
}
