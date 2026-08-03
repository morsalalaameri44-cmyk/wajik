import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import CakeModel from './CakeModel';
import { useOrderStore } from './store';

export default function App() {
  const setCakeColor = useOrderStore((state) => state.setCakeColor);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      
      {/* لوحة التحكم */}
      <div style={{ width: '35%', padding: '20px', backgroundColor: 'white', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Cake Studio</h2>
        <p style={{ fontSize: '12px', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>معالج التصميم</p>
        
        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>لون التغطية:</label>
          <input 
            type="color" 
            defaultValue="#FFD700"
            onChange={(e) => setCakeColor(e.target.value)}
            style={{ width: '100%', height: '40px', cursor: 'pointer', border: 'none', padding: 0 }}
          />
        </div>
      </div>

      {/* استوديو 3D */}
      <div style={{ width: '65%', height: '100%', backgroundColor: '#e5e7eb' }}>
        <Canvas camera={{ position: [0, 4, 8], fov: 45 }} shadows>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
          
          <CakeModel />
          
          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2} />
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        </Canvas>
      </div>
      
    </div>
  );
}
