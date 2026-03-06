import { Link } from "react-router-dom";

type Variant = "default" | "white";
type Size = "sm" | "md" | "lg";

interface BrandLogoProps {
  variant?: Variant;
  size?: Size;
  linkToHome?: boolean;
  className?: string;
}

const HEIGHT_MAP: Record<Size, number> = {
  sm: 28,
  md: 34,
  lg: 42,
};

const SRC_MAP: Record<Variant, string> = {
  default: "/brand/vinys-logo.png",
  white: "/brand/vinys-logo-white.png",
};

export default function BrandLogo({
  variant = "default",
  size = "md",
  linkToHome = true,
  className = "",
}: BrandLogoProps) {
  const height = HEIGHT_MAP[size];

  const img = (
    <img
      src={SRC_MAP[variant]}
      alt="Vinys — Adaptive Therapeutic Yoga"
      style={{ height: `${height}px`, width: "auto" }}
      loading="eager"
      className={className}
    />
  );

  if (!linkToHome) return img;

  return (
    <Link to="/" className="inline-flex items-center">
      {img}
    </Link>
  );
}
