"use client";

import { useEffect, useState } from "react";

/**
 * Global error boundary — catches errors that escape route-level boundaries.
 *
 * This replaces the entire <html> and <body>, so it must include its own
 * minimal HTML shell. Keep it dependency-free (no Tailwind classes, no icons,
 * no next-intl — if the i18n layer itself caused the crash, a translator
 * hook here would recurse). Locale is read straight from the lb_locale
 * cookie with a tiny inline dictionary instead.
 *
 * https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error
 */

// Inline copy for the Tier-1..3 locales. Keyed by cookie value.
const COPY: Record<string, Record<string, string>> = {
  en: {
    lang: "en",
    title: "Something went wrong",
    description:
      "A critical error occurred. Try reloading the page. If the problem persists, restart the container or check the server logs.",
    errorId: "Error ID",
    retry: "Try again",
  },
  fr: {
    lang: "fr",
    title: "Une erreur est survenue",
    description:
      "Une erreur critique s'est produite. Essayez de recharger la page. Si le problème persiste, redémarrez le conteneur ou consultez les logs du serveur.",
    errorId: "ID d'erreur",
    retry: "Réessayer",
  },
  es: {
    lang: "es",
    title: "Algo ha ido mal",
    description:
      "Se produjo un error crítico. Prueba a recargar la página. Si el problema persiste, reinicia el conteneur o revisa los logs del servidor.",
    errorId: "ID del error",
    retry: "Reintentar",
  },
  de: {
    lang: "de",
    title: "Etwas ist schiefgelaufen",
    description:
      "Es ist ein kritischer Fehler aufgetreten. Lade die Seite neu. Wenn das Problem weiterhin besteht, starte den Container neu oder prüfe die Server-Logs.",
    errorId: "Fehler-ID",
    retry: "Erneut versuchen",
  },
  zh: {
    lang: "zh-Hans",
    title: "出了点问题",
    description:
      "发生了严重错误。请尝试重新加载页面。如果问题仍然存在，请重启容器或查看服务器日志。",
    errorId: "错误 ID",
    retry: "重试",
  },
  ar: {
    lang: "ar",
    title: "حدث خطأ ما",
    description:
      "حدث خطأ حرج. حاول إعادة تحميل الصفحة. إذا استمرت المشكلة، أعد تشغيل الحاوية أو تحقق من سجلات الخادم.",
    errorId: "معرّف الخطأ",
    retry: "حاول مجددًا",
  },
};

function copyFor(): Record<string, string> {
  try {
    const m = /(?:^|;\s*)lb_locale=([^;]+)/.exec(document.cookie);
    const loc = m ? decodeURIComponent(m[1]) : "en";
    return COPY[loc] ?? COPY.en;
  } catch {
    return COPY.en;
  }
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Read after mount so SSR/prerender always gets the safe default.
  const [c] = useState(copyFor);

  useEffect(() => {
    console.error("[global-error-boundary]", error);
  }, [error]);

  return (
    <html lang={c.lang}>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#0a0a0a",
            color: "#eaeaea",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            {c.title}
          </h2>
          <p
            style={{
              maxWidth: "28rem",
              fontSize: "0.875rem",
              color: "#a0a0a0",
              marginBottom: "1.5rem",
            }}
          >
            {c.description}
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "#666",
                marginBottom: "1.5rem",
              }}
            >
              {c.errorId}: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "1px solid #333",
              borderRadius: "0.5rem",
              backgroundColor: "transparent",
              color: "#eaeaea",
              cursor: "pointer",
            }}
          >
            {c.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
