import type { BlogArticle, BlogAuthor, BlogCategory, BlogCover } from '~~/types/blog'

type RawEntity = {
  id?: number | string
  documentId?: string
  attributes?: Record<string, unknown>
  [key: string]: unknown
}

type StrapiCollectionResponse = {
  data?: unknown
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const strapiUrl = config.public.strapiUrl.replace(/\/$/, '')
  const headers = config.strapiToken
    ? {
        Authorization: `Bearer ${config.strapiToken}`,
      }
    : undefined

  try {
    const articleResponse = await $fetch<StrapiCollectionResponse>(`${strapiUrl}/api/articles`, {
      headers,
      query: {
        populate: '*',
      },
    })

    const rawArticles = unwrapMany(articleResponse.data)
    const needsAuthorFallback = rawArticles.some((article) => !extractDirectAuthor(article))

    let authorsByArticleKey = new Map<string, BlogAuthor>()

    if (needsAuthorFallback) {
      try {
        const authorResponse = await $fetch<StrapiCollectionResponse>(`${strapiUrl}/api/authors`, {
          headers,
          query: {
            populate: '*',
          },
        })

        authorsByArticleKey = buildAuthorsByArticleIndex(unwrapMany(authorResponse.data))
      }
      catch (authorError) {
        console.error('Author fallback fetch failed:', authorError)
      }
    }

    return rawArticles.map((article) => normalizeArticle(article, strapiUrl, authorsByArticleKey))
  }
  catch (error) {
    console.error('Article fetch failed:', error)

    throw createError({
      statusCode: 502,
      statusMessage: 'Impossible de récupérer les articles depuis Strapi.',
    })
  }
})

function unwrapMany(input: unknown): RawEntity[] {
  if (!input) {
    return []
  }

  const source = isRecord(input) && 'data' in input ? input.data : input

  if (!source) {
    return []
  }

  const collection = Array.isArray(source) ? source : [source]

  return collection
    .map(unwrapOne)
    .filter((entity): entity is RawEntity => entity !== null)
}

function unwrapOne(input: unknown): RawEntity | null {
  if (!input) {
    return null
  }

  const source = isRecord(input) && 'data' in input ? input.data : input

  if (!source || Array.isArray(source) || !isRecord(source)) {
    return null
  }

  if (isRecord(source.attributes)) {
    return {
      id: source.id,
      documentId: typeof source.documentId === 'string' ? source.documentId : undefined,
      ...source.attributes,
    }
  }

  return source as RawEntity
}

function normalizeArticle(
  article: RawEntity,
  strapiUrl: string,
  authorsByArticleKey: Map<string, BlogAuthor>,
): BlogArticle {
  const author = extractDirectAuthor(article) ?? findAuthorFromIndex(article, authorsByArticleKey)

  return {
    id: article.id ?? '',
    documentId: typeof article.documentId === 'string' ? article.documentId : undefined,
    title: typeof article.title === 'string' ? article.title : 'Sans titre',
    content: typeof article.content === 'string' ? article.content.trim() : '',
    cover: normalizeCover(article.cover, strapiUrl),
    author,
    categories: normalizeCategories(article.categories),
  }
}

function normalizeCover(input: unknown, strapiUrl: string): BlogCover | null {
  const media = unwrapOne(input)

  if (!media) {
    return null
  }

  const formats = isRecord(media.formats) ? media.formats : null
  const preferredSource = unwrapFormat(formats?.medium)
    ?? unwrapFormat(formats?.small)
    ?? unwrapFormat(formats?.thumbnail)
    ?? media

  const url = typeof preferredSource.url === 'string'
    ? preferredSource.url
    : typeof media.url === 'string'
      ? media.url
      : null

  if (!url) {
    return null
  }

  return {
    url: toAbsoluteUrl(url, strapiUrl),
    alternativeText:
      typeof media.alternativeText === 'string' && media.alternativeText.trim().length > 0
        ? media.alternativeText
        : null,
    width: toNumber(preferredSource.width) ?? toNumber(media.width),
    height: toNumber(preferredSource.height) ?? toNumber(media.height),
  }
}

function normalizeCategories(input: unknown): BlogCategory[] {
  return unwrapMany(input).map((category) => ({
    name: typeof category.name === 'string' ? category.name : 'Sans catégorie',
    slug: typeof category.slug === 'string' ? category.slug : null,
  }))
}

function extractDirectAuthor(article: RawEntity): BlogAuthor | null {
  return normalizeAuthor(article.author) ?? normalizeAuthor(article.authors)
}

function normalizeAuthor(input: unknown): BlogAuthor | null {
  const author = unwrapOne(input)

  if (!author) {
    return null
  }

  const name = typeof author.name === 'string' ? author.name : null

  if (!name) {
    return null
  }

  return {
    name,
    bio: typeof author.bio === 'string' ? author.bio : null,
    email: typeof author.email === 'string' ? author.email : null,
  }
}

function buildAuthorsByArticleIndex(authors: RawEntity[]): Map<string, BlogAuthor> {
  const index = new Map<string, BlogAuthor>()

  for (const author of authors) {
    const normalizedAuthor = normalizeAuthor(author)

    if (!normalizedAuthor) {
      continue
    }

    for (const relatedArticle of unwrapMany(author.articles)) {
      for (const key of getEntityKeys(relatedArticle)) {
        index.set(key, normalizedAuthor)
      }
    }
  }

  return index
}

function findAuthorFromIndex(article: RawEntity, authorsByArticleKey: Map<string, BlogAuthor>): BlogAuthor | null {
  for (const key of getEntityKeys(article)) {
    const author = authorsByArticleKey.get(key)

    if (author) {
      return author
    }
  }

  return null
}

function getEntityKeys(entity: RawEntity): string[] {
  const keys: string[] = []

  if (typeof entity.documentId === 'string') {
    keys.push(`document:${entity.documentId}`)
  }

  if (typeof entity.id === 'string' || typeof entity.id === 'number') {
    keys.push(`id:${entity.id}`)
  }

  return keys
}

function unwrapFormat(input: unknown): RawEntity | null {
  if (!isRecord(input)) {
    return null
  }

  return input as RawEntity
}

function toAbsoluteUrl(url: string, strapiUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return `${strapiUrl}${url.startsWith('/') ? url : `/${url}`}`
}

function toNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
