import markdownit from 'markdown-it'

const markdown = markdownit({
  html: false,
  breaks: true,
  linkify: true,
})

export function renderArticleMarkdown(content: string): string {
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    return ''
  }

  return markdown.render(normalizedContent)
}

export function getArticlePreview(content: string): string {
  for (const rawLine of content.split(/\r?\n/)) {
    const normalizedLine = stripHtml(markdown.renderInline(rawLine)).replace(/\s+/g, ' ').trim()

    if (normalizedLine.length > 0) {
      return decodeHtmlEntities(normalizedLine)
    }
  }

  return 'Aucun extrait disponible.'
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ')
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
}
