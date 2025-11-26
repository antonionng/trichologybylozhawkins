import Image from "next/image";
import type { ReactNode, CSSProperties } from "react";
import clsx from "clsx";
import { collageLayers, type CollageLayer } from "@/lib/visualAssets";

type BackgroundTone = "transparent" | "sand" | "mist" | "graphite" | "night";
type Texture = "linen" | "veined";

const backgroundToneClasses: Record<BackgroundTone, string> = {
  transparent: "bg-transparent",
  sand: "bg-brand-sand/55",
  mist: "bg-brand-mist/55",
  graphite: "bg-brand-graphite text-brand-ivory",
  night: "bg-brand-night text-brand-ivory",
};

const textureClasses: Record<Texture, string> = {
  linen: "texture-linen",
  veined: "texture-veined",
};

type CollageOptions = {
  layers?: CollageLayer[];
  parallax?: boolean;
};

type PageSectionProps = {
  id?: string;
  as?: keyof JSX.IntrinsicElements;
  tone?: BackgroundTone;
  texture?: Texture;
  heroImage?: {
    src: string;
    alt: string;
    position?: "left" | "right" | "center";
    priority?: boolean;
  };
  collage?: CollageOptions;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  padding?: "default" | "compact" | "none";
};

const paddingClasses: Record<NonNullable<PageSectionProps["padding"]>, string> = {
  default: "py-16 sm:py-20 lg:py-section",
  compact: "py-10 sm:py-12",
  none: "py-0",
};

export function PageSection({
  id,
  as: Tag = "section",
  tone = "transparent",
  texture,
  heroImage,
  collage,
  children,
  className,
  innerClassName,
  padding = "default",
}: PageSectionProps) {
  return (
    <Tag
      id={id}
      className={clsx(
        "relative overflow-hidden",
        paddingClasses[padding],
        backgroundToneClasses[tone],
        texture ? textureClasses[texture] : "",
        className,
      )}
    >
      {collage ? (
        <div
          aria-hidden
          className={clsx(
            "pointer-events-none absolute inset-0",
            collage.parallax ? "motion-safe:parallax-layer" : "",
          )}
        >
          {(collage.layers ?? collageLayers).map((layer, index) => (
            <CollageLayerVisual key={index} layer={layer} index={index} />
          ))}
        </div>
      ) : null}

      {heroImage ? (
        <div
          className={clsx(
            "pointer-events-none absolute inset-0",
            heroImage.position === "left" && "md:justify-start",
            heroImage.position === "right" && "md:justify-end",
          )}
        >
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority={heroImage.priority}
            className="object-cover opacity-80 mix-blend-multiply"
          />
        </div>
      ) : null}

      <div className={clsx("relative z-10", innerClassName)}>{children}</div>
    </Tag>
  );
}

function CollageLayerVisual({ layer, index }: { layer: CollageLayer; index: number }) {
  const baseClass = clsx(
    "absolute inset-0 transition-transform duration-[12000ms]",
    `layer-${index}`,
  );

  const style: CSSProperties = {
    mixBlendMode: layer.blendMode,
    opacity: layer.opacity,
    transform: `translate3d(0, 0, 0) scale(${1 + index * 0.04})`,
  };

  return (
    <div className={baseClass} style={style}>
      <Image
        src={layer.src}
        alt=""
        fill
        sizes="100vw"
        className={clsx(
          "object-cover",
          layer.type === "illustration" ? "blur-[1px]" : "opacity-90",
        )}
        priority={index === 0}
      />
    </div>
  );
}

