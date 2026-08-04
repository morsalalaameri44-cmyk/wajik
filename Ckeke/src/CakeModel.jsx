import { useOrderStore } from './store';

export default function CakeModel() {
  // جلب قائمة الطبقات من المخزن الذي أنشأناه للتو
  const layers = useOrderStore((state) => state.layers);

  return (
    // خفضنا المجسم قليلاً للأسفل (-1) لكي يظل في منتصف الشاشة عندما نصل لـ 3 طبقات
    <group position={[0, -1, 0]}> 
      
      {layers.map((layer, index) => {
        // حساب الارتفاع (Y): كل طبقة ارتفاعها 1.2
        // الطبقة الأولى (index 0) مركزها عند 0.6
        // الطبقة الثانية (index 1) مركزها عند 1.8
        // وهكذا... لترتكز كل طبقة فوق الأخرى بدقة متناهية
        const yPos = (index * 1.2) + 0.6;

        return (
          <mesh key={layer.id} position={[0, yPos, 0]} castShadow receiveShadow>
            {/* استخدام نصف القطر (radius) القادم من المخزن لكل طبقة */}
            <cylinderGeometry args={[layer.radius, layer.radius, layer.height, 128]} />
            
            <meshStandardMaterial 
              color={layer.color} 
              roughness={0.6} // ملمس واقعي يشبه الكريمة
              metalness={0.1}
              envMapIntensity={0.5} 
            />
          </mesh>
        );
      })}

    </group>
  );
}
