// pdfService.js
// Responsibility: extract text from PDF files and provide simple sentence splitting.
// Frontend-only; uses pdfjsLib available on the page.

export async function extractTextFromPDF(file) {
  // Reads the file into an ArrayBuffer and extracts text page-by-page
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Join text items intelligently: PDFs store text in fragments with irregular spacing.
    // Join without unconditional spaces, then collapse multiple spaces to single space.
    let text = textContent.items
      .map(item => item.str)
      .join('')  // join without adding space; items may already have space
      .replace(/\s+/g, ' ');  // collapse multiple whitespace to single space
    pages.push(text);
  }

  return pages;
}

// Minimal sentence splitter that keeps punctuation. Not perfect, but simple and fast.
export function splitToSentences(text) {
  if (!text) return [];
  const re = /[^.!?]+[.!?]+[)"'”’\]]*|[^.!?]+$/g;
  const matches = text.match(re);
  return matches ? matches.map(s => s.trim()) : [];
}
