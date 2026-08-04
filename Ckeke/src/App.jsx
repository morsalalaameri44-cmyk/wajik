import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import CakeModel from './CakeModel';
import { useOrderStore } from './store';

export default function App() {
  // استدعاء جميع الدوال والبيانات من المخزن
  const { layers, addLayer, removeLayer, updateLayerColor } = useOrderStore();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      {/* استوديو 3D */}
      <Canvas camera={{ position: [0, 3, 8], fov: 45 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="city" />
        <CakeModel />
        <ContactShadows position={[0, -0.9, 0]} opacity={0.6} scale={10} blur={2.5} />
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
        direction: 'rtl',
        maxHeight: '70vh', 
        overflowY: 'auto'
      }}>
        
        {/* الترويسة وأزرار التحكم بالطبقات */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: '800' }}>Cake Studio</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>صمم كيكتك الخاصة طبقة بطبقة</p>
          </div>
          
          {/* أزرار الإضافة والحذف */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={addLayer} 
              disabled={layers.length >= 3} // تعطيل الزر إذا وصلنا 3 طبقات
              style={{ width: '35px', height: '35px', borderRadius: '8px', border: 'none', backgroundColor: layers.length >= 3 ? '#e5e7eb' : '#111827', color: layers.length >= 3 ? '#9ca3af' : 'white', fontSize: '18px', cursor: layers.length >= 3 ? 'not-allowed' : 'pointer' }}
            >
              +
            </button>
            <button 
              onClick={removeLayer} 
              disabled={layers.length <= 1} // تعطيل الزر إذا كانت طبقة واحدة فقط
              style={{ width: '35px', height: '35px', borderRadius: '8px', border: 'none', backgroundColor: layers.length <= 1 ? '#e5e7eb' : '#ef4444', color: layers.length <= 1 ? '#9ca3af' : 'white', fontSize: '18px', cursor: layers.length <= 1 ? 'not-allowed' : 'pointer' }}
            >
              -
            </button>
          </div>
        </div>

        {/* قائمة تلوين الطبقات (تظهر بناءً على عدد الطبقات الحالي) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {layers.map((layer, index) => (
            <div key={layer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: '10px 15px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                {index === 0 ? 'الطبقة السفلية' : index === 1 ? 'الطبقة الوسطى' : 'الطبقة العلوية'}
              </span>
              <input 
                type="color" 
                value={layer.color}
                onChange={(e) => updateLayerColor(index, e.target.value)}
                style={{ 
                  width: '35px', 
                  height: '35px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  padding: 0,
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* زر الإجراء */}
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
