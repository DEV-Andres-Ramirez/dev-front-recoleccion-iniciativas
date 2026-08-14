import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Registro de Ayuda Humanitaria — Sismo en Colombia 2026";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#14507a",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            backgroundColor: "#b45309",
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 2,
            padding: "10px 28px",
            borderRadius: 999,
            marginBottom: 40,
          }}
        >
          EMERGENCIA · SISMO 7.4 · 10 DE AGOSTO DE 2026
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
          Colombia necesita tu ayuda
        </div>
        <div
          style={{
            fontSize: 34,
            marginTop: 28,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.4,
          }}
        >
          Registra las donaciones, servicios o voluntariado que puedes ofrecer a las
          personas afectadas por el terremoto.
        </div>
      </div>
    ),
    size,
  );
}
