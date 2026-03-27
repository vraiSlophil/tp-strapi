import { fetchArticleByDocumentId } from '~~/server/utils/strapi-articles'

export default defineEventHandler(async (event) => {
  const documentId = getRouterParam(event, 'documentId')?.trim()

  if (!documentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Identifiant d’article invalide.',
    })
  }

  try {
    const article = await fetchArticleByDocumentId(useRuntimeConfig(), documentId)

    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article introuvable.',
      })
    }

    return article
  }
  catch (error) {
    if (hasStatusCode(error, 404)) {
      throw error
    }

    console.error('Single article fetch failed:', error)

    throw createError({
      statusCode: 502,
      statusMessage: 'Impossible de récupérer cet article depuis Strapi.',
    })
  }
})

function hasStatusCode(error: unknown, statusCode: number): boolean {
  return typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === statusCode
}
