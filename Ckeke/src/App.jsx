import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import FinalCake from './FinalCake';
import { useOrderStore } from './store';

export default function App() {
  const { addDecoration, decorations, selectedId, removeDecoration } = useOrderStore();
  const selectedDec = decorations.find(d => d.id === selectedId);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <Environment preset="studio" />
        <FinalCake />
        <OrbitControls makeDefault />
      </Canvas>

      {/* لوحة التحكم فقط عند اختيار عنصر */}
      {selectedDec && (
        <div style={{ position: 'absolute', top: 20, right: 20, background: '#fff', padding: 10, borderRadius: 10 }}>
          <button onClick={() => removeDecoration(selectedDec.id)}>حذف {selectedDec.type}</button>
        </div>
      )}

      {/* المكتبة السفلية */}
      <div style={{ position: 'absolute', bottom: 0, width: '100%', background: '#fff', padding: 20, direction: 'rtl' }}>
        <h4>أضف زينة</h4>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
          {['🌹 ورد', '👑 تاج', '🦋 فراشات', '💖 قلب'].map(item => (
            <button key={item} onClick={() => addDecoration(item)} style={{ padding: 10 }}>{item}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
