/**
 * Saneador de texto enriquecido para descripciones de tickets.
 *
 * PROBLEMA QUE RESUELVE: al pegar desde Gmail/Word/Docs, el navegador inserta
 * el HTML de origen completo (<span style="color: rgb(31,31,31); font-family:
 * &quot;Google Sans&quot;...">). Ese HTML terminaba guardado en la base de datos
 * y salía crudo en los exportes a Excel, correos y PDF.
 *
 * CONTRATO: el editor solo ofrece NEGRITA, así que únicamente se conservan
 * <strong> y los saltos de línea. Todo lo demás se descarta preservando el texto.
 */

// Únicas etiquetas que sobreviven al saneado.
const BOLD_TAGS = new Set(["B", "STRONG"]);

// Etiquetas de bloque: no se conservan, pero dejan un salto de línea.
const BLOCK_TAGS = new Set([
  "DIV", "P", "LI", "UL", "OL", "TABLE", "TR", "TD", "TH",
  "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "SECTION", "ARTICLE",
]);

// Nunca se debe conservar su contenido.
const DROP_CONTENT = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "OBJECT", "EMBED"]);

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Detecta negrita aplicada por estilo en línea (así la pegan Word y Gmail). */
function hasBoldStyle(el) {
  const weight = (el.style && el.style.fontWeight) || "";
  if (!weight) return false;
  if (weight === "bold" || weight === "bolder") return true;
  const numeric = parseInt(weight, 10);
  return !Number.isNaN(numeric) && numeric >= 600;
}

function walk(node) {
  let out = "";
  node.childNodes.forEach((child) => {
    // Nodo de texto: se escapa y se normaliza el espacio duro (&nbsp;).
    if (child.nodeType === 3) {
      out += escapeHtml(child.nodeValue.replace(/\u00a0/g, " "));
      return;
    }
    if (child.nodeType !== 1) return; // comentarios y otros: fuera

    const tag = child.tagName;
    if (DROP_CONTENT.has(tag)) return;
    if (tag === "BR") {
      out += "<br>";
      return;
    }

    const inner = walk(child);
    if (inner.trim()) {
      // Se conserva la negrita venga como etiqueta o como estilo en línea.
      out += BOLD_TAGS.has(tag) || hasBoldStyle(child)
        ? `<strong>${inner}</strong>`
        : inner;
    }
    if (BLOCK_TAGS.has(tag)) out += "<br>";
  });
  return out;
}

/** Colapsa saltos repetidos y recorta los de los extremos. */
function tidy(html) {
  return html
    .replace(/(?:\s*<br\s*\/?>\s*){3,}/gi, "<br><br>")
    .replace(/^(?:\s*<br\s*\/?>\s*)+/i, "")
    .replace(/(?:\s*<br\s*\/?>\s*)+$/i, "")
    .trim();
}

/**
 * Devuelve HTML seguro: solo <strong> y <br>, sin atributos.
 * Es idempotente — aplicarlo dos veces da el mismo resultado.
 */
export function sanitizeRichHtml(input) {
  if (input === null || input === undefined) return "";
  const raw = String(input);
  if (!raw.trim()) return "";

  // Sin DOM disponible (SSR/tests): se cae a un despojo básico de etiquetas.
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    return tidy(stripTags(raw));
  }

  const doc = new window.DOMParser().parseFromString(`<body>${raw}</body>`, "text/html");
  return tidy(walk(doc.body));
}

/** Despojo de etiquetas sin DOM (respaldo y uso en validaciones). */
function stripTags(raw) {
  return String(raw)
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

/**
 * Convierte a texto plano legible (para exportes, validaciones y contadores).
 */
export function htmlToPlainText(input) {
  if (input === null || input === undefined) return "";
  const raw = String(input);
  if (!raw.trim()) return "";

  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    return stripTags(raw).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  const doc = new window.DOMParser().parseFromString(
    `<body>${raw.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(div|p|li|tr|h[1-6])>/gi, "\n$&")}</body>`,
    "text/html"
  );
  return (doc.body.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default sanitizeRichHtml;
