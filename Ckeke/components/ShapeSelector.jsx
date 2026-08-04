import { useOrderStore } from "../store/orderStore";
import {
  Circle,
  Square,
  Heart,
  RectangleHorizontal
} from "lucide-react";

const shapes = [
  {
    id: "round",
    title: "دائري",
    icon: Circle,
  },
  {
    id: "square",
    title: "مربع",
    icon: Square,
  },
  {
    id: "rectangle",
    title: "مستطيل",
    icon: RectangleHorizontal,
  },
  {
    id: "heart",
    title: "قلب",
    icon: Heart,
  },
];

export default function ShapeSelector() {

  const shape = useOrderStore(
    (state) => state.cake.shape
  );

  const updateCake = useOrderStore(
    (state) => state.updateCake
  );

  return (

    <div className="space-y-3">

      <h3 className="text-lg font-bold">
        شكل التورتة
      </h3>

      <div className="grid grid-cols-2 gap-4">

        {shapes.map((item) => {

          const Icon = item.icon;

          const selected = shape === item.id;

          return (

            <button
              key={item.id}
              onClick={() =>
                updateCake("shape", item.id)
              }

              className={`

              rounded-2xl
              border-2
              p-5
              transition-all
              duration-300

              ${
                selected
                  ? "border-pink-500 bg-pink-50 shadow-lg scale-105"
                  : "border-gray-200 bg-white hover:border-pink-300 hover:shadow"
              }

              `}
            >

              <div className="flex flex-col items-center gap-3">

                <Icon
                  size={45}
                />

                <span className="font-semibold">
                  {item.title}
                </span>

              </div>

            </button>

          );

        })}

      </div>

    </div>

  );

}