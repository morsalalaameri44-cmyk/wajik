import { useOrderStore } from './store';

export default function CakeModel() {
  const layers = useOrderStore((state) => state.layers);

  return (
    <group position={[0, -1.2, 0]}> 
      
      {/* قاعدة الكيك الفاخرة (Cake Board) */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.7, 2.7, 0.1, 128]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* بناء الطبقات */}
      {layers.map((layer, index) => {
        const yPos = (index * 1.2) + 0.65; 

        return (
          <group key={layer.id} position={[0, yPos, 0]}>
            {/* جسم الطبقة الأساسي */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[layer.radius, layer.radius, layer.height, 128]} />
              <meshStandardMaterial 
                color={layer.color} 
                roughness={0.8} 
                metalness={0.05}
              />
            </mesh>
            
            {/* حلقة التنعيم - الانصياع التام للجاذبية الأرضية */}
            <mesh 
              position={[0, layer.height / 2, 0]} 
              rotation={[Math.PI / 2, 0, 0]} /* <-- هنا التعديل الصارم لإجبارها على الاستلقاء */
              castShadow 
              receiveShadow
            >
              <torusGeometry args={[layer.radius, 0.05, 32, 128]} />
              <meshStandardMaterial color={layer.color} roughness={0.8} metalness={0.05} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
