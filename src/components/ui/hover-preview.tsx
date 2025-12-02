"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";

const previewData = {
  automation: {
    image:
      "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=560&h=320&fit=crop",
    title: "Automation Workflows",
    subtitle: "Streamline repetitive tasks",
  },
  integration: {
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=560&h=320&fit=crop",
    title: "API Integrations",
    subtitle: "Connect your favorite tools",
  },
  productivity: {
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=560&h=320&fit=crop",
    title: "Productivity Tools",
    subtitle: "Boost team efficiency",
  },
};

const styles = `
  .hover-link {
    color: hsl(var(--primary));
    font-weight: 700;
    cursor: pointer;
    position: relative;
    display: inline-block;
    transition: color 0.3s ease;
  }

  .hover-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: hsl(var(--primary));
    transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .hover-link:hover::after {
    width: 100%;
  }

  .preview-card {
    position: fixed;
    pointer-events: none;
    z-index: 1000;
    opacity: 0;
    transform: translateY(10px) scale(0.95);
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform, opacity;
  }

  .preview-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .preview-card-inner {
    background: hsl(var(--background));
    border: 2px solid hsl(var(--border));
    padding: 8px;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px hsl(var(--border));
    overflow: hidden;
  }

  .preview-card img {
    width: 280px;
    height: auto;
    display: block;
    border: 1px solid hsl(var(--border));
  }

  .preview-card-title {
    padding: 12px 8px 4px;
    font-size: 0.875rem;
    color: hsl(var(--foreground));
    font-weight: 700;
  }

  .preview-card-subtitle {
    padding: 0 8px 8px;
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
  }
`;

const HoverLink = ({
  previewKey,
  children,
  onHoverStart,
  onHoverMove,
  onHoverEnd,
}: {
  previewKey: string;
  children: React.ReactNode;
  onHoverStart: (key: string, e: React.MouseEvent) => void;
  onHoverMove: (e: React.MouseEvent) => void;
  onHoverEnd: () => void;
}) => {
  return (
    <span
      className="hover-link font-mono"
      onMouseEnter={(e) => onHoverStart(previewKey, e)}
      onMouseMove={onHoverMove}
      onMouseLeave={onHoverEnd}
    >
      {children}
    </span>
  );
};

const PreviewCard = ({
  data,
  position,
  isVisible,
  cardRef,
}: {
  data: (typeof previewData)[keyof typeof previewData] | null;
  position: { x: number; y: number };
  isVisible: boolean;
  cardRef: React.RefObject<HTMLDivElement>;
}) => {
  if (!data) return null;

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={`preview-card ${isVisible ? "visible" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="preview-card-inner">
        <img
          src={data.image || "/placeholder.svg"}
          alt={data.title || ""}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <div className="preview-card-title font-mono">{data.title}</div>
        <div className="preview-card-subtitle font-mono">{data.subtitle}</div>
      </div>
    </div>
  );
};

export function HoverPreview({ totalWorkflows = 150 }: { totalWorkflows?: number }) {
  const [activePreview, setActivePreview] = useState<
    (typeof previewData)[keyof typeof previewData] | null
  >(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Preload all images on mount
  useEffect(() => {
    Object.entries(previewData).forEach(([, data]) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = data.image;
    });
  }, []);

  const updatePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
    const cardWidth = 300;
    const cardHeight = 250;
    const offsetY = 20;

    let x = e.clientX - cardWidth / 2;
    let y = e.clientY - cardHeight - offsetY;

    if (x + cardWidth > window.innerWidth - 20) {
      x = window.innerWidth - cardWidth - 20;
    }
    if (x < 20) {
      x = 20;
    }

    if (y < 20) {
      y = e.clientY + offsetY;
    }

    setPosition({ x, y });
  }, []);

  const handleHoverStart = useCallback(
    (key: string, e: React.MouseEvent) => {
      setActivePreview(previewData[key as keyof typeof previewData]);
      setIsVisible(true);
      updatePosition(e);
    },
    [updatePosition]
  );

  const handleHoverMove = useCallback(
    (e: React.MouseEvent) => {
      if (isVisible) {
        updatePosition(e);
      }
    },
    [isVisible, updatePosition]
  );

  const handleHoverEnd = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="text-xl text-muted-foreground font-mono">
        <span className="inline-block">
          {totalWorkflows}+ production-ready{" "}
          <HoverLink
            previewKey="automation"
            onHoverStart={handleHoverStart}
            onHoverMove={handleHoverMove}
            onHoverEnd={handleHoverEnd}
          >
            automation workflows
          </HoverLink>
          . Deploy tested{" "}
          <HoverLink
            previewKey="integration"
            onHoverStart={handleHoverStart}
            onHoverMove={handleHoverMove}
            onHoverEnd={handleHoverEnd}
          >
            integrations
          </HoverLink>{" "}
          and boost your{" "}
          <HoverLink
            previewKey="productivity"
            onHoverStart={handleHoverStart}
            onHoverMove={handleHoverMove}
            onHoverEnd={handleHoverEnd}
          >
            productivity
          </HoverLink>
          . Built by developers, for developers.
        </span>
      </div>

      <PreviewCard
        data={activePreview}
        position={position}
        isVisible={isVisible}
        cardRef={cardRef}
      />
    </>
  );
}
