import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import FinalCake from './FinalCake';
import { useOrderStore } from './store';

// شاشة البداية
function HomeScreen({ onStartNewOrder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: 'radial-gradient(circle at 50% 50%, #2c1618 0%, #0d0607 100%)', fontFamily: 'sans-serif', color: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ margin: 0, color: '#d4af37', fontSize: '48px', fontWeight: '900', letterSpacing: '2px' }}>المراسيم</h1>
        <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '16px', letterSpacing: '1px' }}>Cake Studio 3D</p>
      </div>
      <button onClick={onStartNewOrder} style={{ padding: '18px 40px', backgroundColor: '#d4af37', color: '#150a0a', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>+ طلب جديد</button>
    </div>
  );
}

// شاشة بيانات العميل
function CustomerDataScreen({ onNext, onBack }) {
  const { customerData, updateCustomerData } = useOrderStore();
  const inputStyle = { width: '100%', padding: '14px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px', marginBottom: '16px', direction: 'rtl' };
  
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '20px' }}>
      <button onClick={onBack}>🔙</button>
      <h2 style={{ textAlign: 'center' }}>بيانات العميل</h2>
      <input style={inputStyle} placeholder="اسم العميل" value={customerData.name} onChange={(e) => updateCustomerData('name', e.target.value)} />
      <button onClick={onNext} style={{ width: '100%', padding: '16px', backgroundColor: '#2c1618', color: '#d4af37', borderRadius: '14px' }}>بدء التصميم ➜</button>
    </div>
  );
}

// شاشة النكهات
function FlavorScreen({ onNext, onBack }) {
  const { flavorData, updateFlavorData } = useOrderStore();
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '20px' }}>
      <button onClick={onBack}>🔙</button>
      <h2>النكهات والحشوات</h2>
      <select onChange={(e) => updateFlavorData('cakeFlavor', e.target.value)} style={{width: '100%', padding: '10px'}}>
        <option value="فانيليا">فانيليا</option>
        <option value="شوكولاتة">شوكولاتة</option>
      </select>
      <button onClick={onNext} style={{ width: '100%', padding: '16px', backgroundColor: '#2c1618', color: '#d4af37', marginTop: '20px' }}>تأكيد ➜</button>
    </div>
  );
}

// الموجه الرئيسي (التطبيق)
export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const { layers, addLayer, removeLayer, updateLayerColor, addDecoration } = useOrderStore();
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  if (activeScreen === 'home') return <HomeScreen onStartNewOrder={() => setActiveScreen('customer')} />;
  if (activeScreen === 'customer') return <CustomerDataScreen onNext={() => setActiveScreen('wizard_3d')} onBack={() => setActiveScreen('home')} />;
  if (activeScreen === 'flavors') return <FlavorScreen onNext={() => alert('تم!')} onBack={() => setActiveScreen('wizard_3d')} />;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0d0607' }}>
      
      <button onClick={() => setIsPanelOpen(!isPanelOpen)} style={{ position: 'absolute', top: 20, left: 20, zIndex: 50, padding: 10, borderRadius: 20 }}>
        {isPanelOpen ? '👁️ إخفاء' : '🎨 تعديل'}
      </button>

      <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <Environment preset="studio" />
        <FinalCake />
        <OrbitControls />
      </Canvas>

      {/* لوحة التحكم */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%', padding: 20, display: isPanelOpen ? 'block' : 'none', background: 'rgba(255,255,255,0.9)', borderRadius: 20, direction: 'rtl' }}>
        <h3>إضافة زينة</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {['🌹 ورد', '👑 تاج', '🦋 فراشات', '✍️ كتابة'].map(item => (
            <button key={item} onClick={() => addDecoration(item)} style={{ padding: 10 }}>{item}</button>
          ))}
        </div>
        <button onClick={() => setActiveScreen('flavors')} style={{ width: '100%', marginTop: 20, padding: 15 }}>متابعة للنكهات ➜</button>
      </div>
    </div>
  );
}
