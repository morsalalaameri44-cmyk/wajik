import { useOrderStore } from './store';

export default function FinalCake() {
  const layers = useOrderStore((state) => state.layers);

  return (
    <group position={[0, -1.2, 0]}> 
      
      {/* قاعدة الكيك الذهبية */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.7, 2.7, 0.1, 64]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* طبقات الكيك الصافية - أسطوانة نقية فقط */}
      {layers.map((layer, index) => {
        const yPos = (index * 1.2) + 0.65; 
        return (
          <mesh key={`layer-${layer.id}`} position={[0, yPos, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[layer.radius, layer.radius, layer.height, 64]} />
            <meshStandardMaterial color={layer.color} roughness={0.8} metalness={0.1} />
          </mesh>
        );
      })}
    </group>
  );
}
