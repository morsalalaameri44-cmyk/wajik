import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import FinalCake from './FinalCake';
import { useOrderStore } from './store';

// 1. مكون الشاشة الرئيسية الفاخرة (Home Screen)
function HomeScreen({ onStartNewOrder }) {
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', width: '100vw', 
      background: 'radial-gradient(circle at 50% 50%, #2c1618 0%, #0d0607 100%)', 
      fontFamily: 'sans-serif', color: '#fff' 
    }}>
      
      {/* الشعار والهوية */}
      <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeIn 1s ease-in-out' }}>
        <h1 style={{ margin: 0, color: '#d4af37', fontSize: '48px', fontWeight: '900', letterSpacing: '2px' }}>المراسيم</h1>
        <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '16px', letterSpacing: '1px' }}>Cake Studio 3D</p>
      </div>

      {/* الأزرار الرئيسية */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '85%', maxWidth: '350px' }}>
        <button 
          onClick={onStartNewOrder}
          style={{ 
            padding: '18px 24px', backgroundColor: '#d4af37', color: '#150a0a', 
            border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', 
            cursor: 'pointer', boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            transition: 'transform 0.2s'
          }}
        >
          <span style={{ fontSize: '24px' }}>+</span>
          طلب جديد
        </button>

        <button 
          style={{ 
            padding: '18px 24px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#d4af37', 
            border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', 
            cursor: 'pointer', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
          }}
        >
          <span>📋</span>
          الطلبات السابقة
        </button>
      </div>
      
      <style>
        {`@keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`}
      </style>
    </div>
  );
}

// 2. المكون الرئيسي للتطبيق
export default function App() {
  // حالة جديدة للتحكم في الشاشة المعروضة ('home' أو 'wizard')
  const [activeScreen, setActiveScreen] = useState('home');
  
  const { layers, addLayer, removeLayer, updateLayerColor } = useOrderStore();
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // إذا كانت الحالة 'home'، نعرض الشاشة الرئيسية
  if (activeScreen === 'home') {
    return <HomeScreen onStartNewOrder={() => setActiveScreen('wizard')} />;
  }

  // إذا كانت الحالة 'wizard'، نعرض الاستوديو ثلاثي الأبعاد
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, #2c1618 0%, #0d0607 100%)', fontFamily: 'sans-serif' }}>
      
      {/* زر العودة للرئيسية */}
      <button 
        onClick={() => setActiveScreen('home')}
        style={{
          position: 'absolute', top: '20px', right: '20px', zIndex: 50,
          backgroundColor: 'transparent', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '12px', padding: '10px 15px', fontSize: '14px', fontWeight: 'bold',
          cursor: 'pointer', backdropFilter: 'blur(5px)'
        }}
      >
        رجوع ↩️
      </button>

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
          borderRadius: '30px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', backdropFilter: 'blur(5px)'
        }}
      >
        {isPanelOpen ? '👁️ عرض ملء الشاشة' : '🎨 تعديل التصميم'}
      </button>

      <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: `translate(-50%, ${isPanelOpen ? '0' : '120%'})`,
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)', width: '90%', maxWidth: '400px', 
        backgroundColor: 'rgba(255, 255, 255, 0.96)', borderRadius: '24px', padding: '24px', 
        boxShadow: '0 15px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '20px', direction: 'rtl'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#150a0a', fontSize: '22px', fontWeight: '900' }}>تصميم الطلب</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>الخطوة 2: مواصفات التورتة</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={addLayer} disabled={layers.length >= 3} style={{ width: '35px', height: '35px', borderRadius: '8px', border: 'none', backgroundColor: layers.length >= 3 ? '#e5e7eb' : '#2c1618', color: layers.length >= 3 ? '#9ca3af' : '#d4af37', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
            <button onClick={removeLayer} disabled={layers.length <= 1} style={{ width: '35px', height: '35px', borderRadius: '8px', border: 'none', backgroundColor: layers.length <= 1 ? '#e5e7eb' : '#ef4444', color: layers.length <= 1 ? '#9ca3af' : 'white', fontSize: '18px', cursor: 'pointer' }}>-</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {layers.map((layer, index) => (
            <div key={layer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: '10px 15px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>{index === 0 ? 'الطبقة السفلية' : index === 1 ? 'الطبقة الوسطى' : 'الطبقة العلوية'}</span>
              <input type="color" value={layer.color} onChange={(e) => updateLayerColor(index, e.target.value)} style={{ width: '35px', height: '35px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }} />
            </div>
          ))}
        </div>
        
        {/* زر السعر الديناميكي */}
        <button style={{ width: '100%', padding: '14px', backgroundColor: '#2c1618', color: '#d4af37', border: '1px solid #d4af37', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>متابعة للنكهات ➜</span>
          <span style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '4px 12px', borderRadius: '8px' }}>{layers.length * 5000} ريال</span>
        </button>
      </div>
    </div>
  );
}
