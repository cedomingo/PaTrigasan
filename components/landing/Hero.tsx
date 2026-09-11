import { SectionLabel } from "@/components/ui";
import { SubtleArc, FaintGrid, TranslucentCircle } from "@/components/background";
import BrandMark from "./BrandMark";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-20 sm:pt-28">
      <TranslucentCircle tone="blue" size={420} className="-right-40 -top-32 -z-10" />
      <SubtleArc className="-bottom-40 -left-32 -z-10" />
      <FaintGrid className="inset-x-0 top-0 -z-10 h-64 w-full" />

      <div className="mx-auto max-w-2xl text-center">


        <h1 className="font-serif text-5xl leading-tight text-navy sm:text-6xl">
          Math Sprint
        </h1>


      </div>
    </section>
  );
}
