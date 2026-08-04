import { useOrderStore } from './store';

export default function CakeModel() {
  const layers = useOrderStore((state) => state.layers);

  return (
    <group position={[0, -1.2, 0]}> 
      
      {/* قاعدة الكيك الذهبية */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.7, 2.7, 0.1, 64]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* طبقات الكيك - أسطوانة نظيفة ومثالية بدون أي تعقيدات */}
      {layers.map((layer, index) => {
        const yPos = (index * 1.2) + 0.65; 

        return (
          <mesh key={layer.id} position={[0, yPos, 0]} castShadow receiveShadow>
            {/* أسطوانة بدقة 64 لتكون دائرية تماماً وناعمة */}
            <cylinderGeometry args={[layer.radius, layer.radius, layer.height, 64]} />
            
            {/* استخدام خامة فيزيائية تعطي مظهر الكريمة الفاخرة المطفية */}
            <meshPhysicalMaterial 
              color={layer.color} 
              roughness={0.9} 
              metalness={0.05}
              clearcoat={0.1} 
              clearcoatRoughness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

