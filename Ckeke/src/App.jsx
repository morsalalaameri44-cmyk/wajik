import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import CakeModel from './CakeModel';
import { useOrderStore } from './store';

export default function App() {
  const setCakeColor = useOrderStore((state) => state.setCakeColor);
  const cakeColor = useOrderStore((state) => state.cakeConfig.color);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      {/* استوديو 3D - يحتل الشاشة بالكامل */}
      <Canvas camera={{ position: [0, 3, 7], fov: 45 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        
        {/* بيئة إضاءة واقعية تنعكس على المجسم */}
        <Environment preset="city" />
        
        <CakeModel />
        
        {/* ظل ناعم تحت الكيكة لزيادة الواقعية */}
        <ContactShadows position={[0, -0.5, 0]} opacity={0.6} scale={10} blur={2.5} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enableZoom={true} />
      </Canvas>

      {/* لوحة التحكم العائمة (Mobile-First) */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '400px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        direction: 'rtl'
      }}>
        
        {/* الترويسة */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '22px', fontWeight: '800' }}>Cake Studio</h2>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '13px' }}>صمم كيكتك الخاصة بدقة</p>
        </div>

        {/* أدوات التخصيص */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '15px', fontWeight: 'bold', color: '#374151' }}>
            لون التغطية:
          </label>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input 
              type="color" 
              value={cakeColor || '#FFD700'}
              onChange={(e) => setCakeColor(e.target.value)}
              style={{ 
                width: '45px', 
                height: '45px', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer',
                padding: 0,
                backgroundColor: 'transparent'
              }}
            />
            <span style={{ fontSize: '13px', color: '#6b7280' }}>اسحب لاختيار اللون المناسب لمناسبتك</span>
          </div>
        </div>
        
        {/* زر الإجراء (Call to Action) */}
        <button style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#111827',
          color: 'white',
          border: 'none',
          borderRadius: '14px',
          fontSize: '15px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          تأكيد التصميم والانتقال للسعر
        </button>

      </div>
    </div>
  );
}
