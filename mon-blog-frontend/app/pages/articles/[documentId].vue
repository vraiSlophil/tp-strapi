<script setup lang="ts">
import type { BlogArticle } from '~~/types/blog'
import { getArticlePreview, renderArticleMarkdown } from '~~/utils/article-content'

const route = useRoute()
const documentId = Array.isArray(route.params.documentId) ? route.params.documentId[0] : route.params.documentId

if (!documentId) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Identifiant d’article invalide.',
  })
}

const { data, status, error, refresh } = await useFetch<BlogArticle>(`/api/articles/${documentId}`, {
  key: `blog-article-${documentId}`,
})

const article = computed(() => data.value ?? null)

const renderedContent = computed(() => {
  if (!article.value) {
    return ''
  }

  return renderArticleMarkdown(article.value.content)
})

useSeoMeta({
  title: () => (article.value ? `${article.value.title} | Blog Tech Headless` : 'Article | Blog Tech Headless'),
  description: () => (article.value ? getArticlePreview(article.value.content) : 'Lecture d’un article du blog technique.'),
})
</script>

<template>
  <div class="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
    <NuxtLink to="/" class="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950">
      <span class="material-symbols-rounded !text-base">arrow_back</span>
      Retour aux articles
    </NuxtLink>

    <section v-if="status === 'pending'" class="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-sm">
      <div class="space-y-5">
        <div class="skeleton h-6 w-32" />
        <div class="skeleton h-12 w-3/4" />
        <div class="skeleton h-72 w-full rounded-[1.5rem]" />
        <div class="skeleton h-32 w-full" />
      </div>
    </section>

    <section v-else-if="error || !article" class="alert border border-red-200 bg-red-50 text-red-900 shadow-sm">
      <span class="material-symbols-rounded text-red-700">error</span>
      <div class="space-y-1">
        <p class="font-semibold">Impossible d’afficher cet article.</p>
        <p class="text-sm">
          Vérifie que Strapi tourne bien sur <code>http://localhost:1337</code> et que la permission publique
          <code>findOne</code> est active pour <code>Article</code>.
        </p>
      </div>
      <button class="btn btn-sm btn-outline border-red-300 text-red-900" type="button" @click="refresh()">
        Réessayer
      </button>
    </section>

    <article v-else class="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur">
      <figure v-if="article.cover" class="border-b border-slate-200/70 bg-slate-100">
        <img
          :src="article.cover.url"
          :alt="article.cover.alternativeText || article.title"
          class="h-80 w-full object-cover sm:h-[26rem]"
        >
      </figure>

      <div class="space-y-8 px-6 py-8 sm:px-10">
        <header class="space-y-5">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="category in article.categories"
              :key="category.slug || category.name"
              class="badge badge-soft badge-primary border-none px-3 py-3 text-xs font-semibold tracking-[0.22em] uppercase"
            >
              {{ category.name }}
            </span>
            <span
              v-if="article.categories.length === 0"
              class="badge badge-soft border-none px-3 py-3 text-xs font-semibold tracking-[0.22em] uppercase"
            >
              Non classé
            </span>
          </div>

          <div class="space-y-3">
            <p class="text-xs font-semibold tracking-[0.28em] text-slate-500 uppercase">
              Lecture détaillée
            </p>
            <h1 class="text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              {{ article.title }}
            </h1>
          </div>
        </header>

        <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div class="rounded-[1.75rem] border border-slate-200/80 bg-slate-50/60 p-6 sm:p-8">
            <div
              v-if="renderedContent"
              class="markdown-content"
              v-html="renderedContent"
            />
            <p v-else class="text-slate-500">
              Aucun contenu à afficher.
            </p>
          </div>

          <aside class="h-fit rounded-[1.75rem] border border-slate-200/80 bg-slate-50/90 p-5">
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm text-slate-500">
                  <span class="material-symbols-rounded !text-base text-amber-600">person</span>
                  <span class="font-medium uppercase tracking-[0.2em]">Auteur</span>
                </div>
                <p class="text-lg font-semibold text-slate-900">
                  {{ article.author?.name || 'Auteur non renseigné' }}
                </p>
                <p v-if="article.author?.bio" class="text-sm leading-6 text-slate-600">
                  {{ article.author.bio }}
                </p>
                <a
                  v-if="article.author?.email"
                  :href="`mailto:${article.author.email}`"
                  class="text-sm font-medium text-sky-700 transition hover:text-sky-900"
                >
                  {{ article.author.email }}
                </a>
              </div>

              <div class="divider my-0" />

              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm text-slate-500">
                  <span class="material-symbols-rounded !text-base text-sky-700">category</span>
                  <span class="font-medium uppercase tracking-[0.2em]">Catégories</span>
                </div>
                <ul class="space-y-2 text-sm text-slate-700">
                  <li v-for="category in article.categories" :key="category.slug || category.name">
                    {{ category.name }}
                  </li>
                  <li v-if="article.categories.length === 0">
                    Non classé
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </article>
  </div>
</template>
