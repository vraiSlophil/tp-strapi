import { fetchArticles } from '~~/server/utils/strapi-articles'

export default defineEventHandler(async () => {
  try {
    return await fetchArticles(useRuntimeConfig())
  }
  catch (error) {
    console.error('Article fetch failed:', error)

    throw createError({
      statusCode: 502,
      statusMessage: 'Impossible de récupérer les articles depuis Strapi.',
    })
  }
})
