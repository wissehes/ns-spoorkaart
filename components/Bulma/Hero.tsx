import React from "react";

type HeroColor = "primary" | "link" | "info" | "success" | "warning" | "danger";
type HeroSize = "small" | "medium" | "large" | "halfheight" | "fullheight";

export default function Hero({
  children,
  size,
  color,
}: {
  children: React.ReactNode;
  size?: HeroSize;
  color?: HeroColor;
}) {
  return (
    <section
      className={`hero ${size ? `is-${size}` : ""} ${
        color ? `is-${color}` : ""
      }`}
    >
      <div className="hero-body">{children}</div>
    </section>
  );
}

export const HeroTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="title">{children}</p>
);

export const HeroSubtitle = ({ children }: { children: React.ReactNode }) => (
  <p className="subtitle">{children}</p>
);
