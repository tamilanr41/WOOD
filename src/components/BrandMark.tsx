type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mariya-logo.png"
        alt="Mariya Plywoods — Luxury Interiors"
        className="brand-mark__img"
      />
    </span>
  );
}
