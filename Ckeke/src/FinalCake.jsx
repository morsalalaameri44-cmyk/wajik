import React from 'react';
import { useOrderStore } from './store';
import { TransformControls } from '@react-three/drei';

export default function FinalCake() {
  const { layers, decorations, selectedId, setSelectedId } = useOrderStore();

  return (
    <group position={[0, -1.2, 0]} onClick={() => setSelectedId(null)}>
      {/* طبقات الكيك */}
      {layers.map((layer, index) => (
        <mesh key={index} position={[0, 0.75 + (index * 1.5), 0]}>
          <cylinderGeometry args={[Math.max(2.2 - (index * 0.5), 0.5), Math.max(2.2 - (index * 0.5), 0.5), 1.5, 64]} />
          <meshStandardMaterial color={layer.color} roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
      
      {/* الزينة: لا تظهر الأسهم إلا للمختار فقط */}
      {decorations.map((dec) => (
        <TransformControls 
          key={dec.id} 
          enabled={selectedId === dec.id}
          showX={selectedId === dec.id}
          showY={selectedId === dec.id}
          showZ={selectedId === dec.id}
        >
          <group position={dec.position} onClick={(e) => { e.stopPropagation(); setSelectedId(dec.id); }}>
            {dec.type === '🌹 ورد' && <mesh><sphereGeometry args={[0.3]} /><meshStandardMaterial color="red" /></mesh>}
            {dec.type === '👑 تاج' && <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.1, 16, 32]} /><meshStandardMaterial color="gold" /></mesh>}
            {dec.type === '🦋 فراشات' && <mesh><coneGeometry args={[0.2, 0.4, 3]} /><meshStandardMaterial color="purple" /></mesh>}
            {dec.type === '💖 قلب' && <mesh><dodecahedronGeometry args={[0.3]} /><meshStandardMaterial color="pink" /></mesh>}
          </group>
        </TransformControls>
      ))}

      <mesh position={[0, -0.05, 0]}><cylinderGeometry args={[3.2, 3.2, 0.1, 64]} /><meshStandardMaterial color="#d4af37" /></mesh>
    </group>
  );
}
