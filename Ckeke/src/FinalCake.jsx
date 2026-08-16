import React from 'react';
import { useOrderStore } from './store';
import { TransformControls, Text } from '@react-three/drei';

export default function FinalCake() {
  const { layers, decorations, selectedId, setSelectedId } = useOrderStore();

  return (
    <group position={[0, -1.2, 0]}>
      {/* طبقات الكيك */}
      {layers.map((layer, index) => (
        <mesh key={index} position={[0, 0.75 + (index * 1.5), 0]} castShadow receiveShadow>
          <cylinderGeometry args={[Math.max(2.2 - (index * 0.5), 0.5), Math.max(2.2 - (index * 0.5), 0.5), 1.5, 64]} />
          <meshStandardMaterial color={layer.color} roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
      
      {/* محرك الزينة */}
      {decorations.map((dec) => (
        <TransformControls 
          key={dec.id} 
          enabled={selectedId === dec.id}
          onMouseDown={() => setSelectedId(dec.id)}
        >
          <group position={dec.position} onClick={(e) => { e.stopPropagation(); setSelectedId(dec.id); }}>
            {dec.type === '🌹 ورد' && <mesh><sphereGeometry args={[0.3]} /><meshStandardMaterial color="red" /></mesh>}
            {dec.type === '👑 تاج' && <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.1, 16, 32]} /><meshStandardMaterial color="gold" /></mesh>}
            {dec.type === '🦋 فراشات' && <mesh><coneGeometry args={[0.2, 0.4, 3]} /><meshStandardMaterial color="purple" /></mesh>}
            {dec.type === '💖 قلب' && <mesh><dodecahedronGeometry args={[0.3]} /><meshStandardMaterial color="pink" /></mesh>}
            {dec.type === '🎓 تخرج' && <mesh><boxGeometry args={[0.4, 0.2, 0.4]} /><meshStandardMaterial color="black" /></mesh>}
            {dec.type === '💍 خاتم' && <mesh><torusGeometry args={[0.2, 0.05, 16, 32]} /><meshStandardMaterial color="silver" /></mesh>}
          </group>
        </TransformControls>
      ))}

      {/* القاعدة */}
      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.1, 64]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}
