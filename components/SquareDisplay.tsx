import { ReactNode } from "react";

export default function SquareDisplay({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        margin: "1rem",
        borderColor: "black",
        borderWidth: "5px",
        borderRadius: "5px",
        borderStyle: "solid",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        minWidth: "75px",
        maxWidth: "75px",
        height: "75px",
      }}
    >
      {title && (
        <p
          style={{
            fontSize: "10px",
            fontFamily: "monospace",
            marginBottom: "0.5rem",
          }}
        >
          {title}
        </p>
      )}

      {children}
    </div>
  );
}
