"use client";

// Ошибка в самом каркасе сайта (layout) — переводы и стили могут быть недоступны,
// поэтому простая страница со встроенными стилями и текстом на обоих языках
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="lv">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#111827",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#A4343A" }}>bestauto.lv</div>
          <h1 style={{ fontSize: 26, margin: "24px 0 8px" }}>Radās kļūda</h1>
          <p style={{ color: "#6b7280", margin: 0 }}>Lūdzu, mēģiniet vēlreiz pēc brīža.</p>
          <p style={{ color: "#6b7280", margin: "4px 0 0" }}>Произошла ошибка. Попробуйте ещё раз чуть позже.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              height: 48,
              padding: "0 24px",
              borderRadius: 999,
              border: 0,
              background: "#A4343A",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Mēģināt vēlreiz / Повторить
          </button>
        </div>
      </body>
    </html>
  );
}
