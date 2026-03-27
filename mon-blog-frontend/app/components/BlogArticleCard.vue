<script setup lang="ts">
import type { BlogArticle } from '~~/types/blog'
import { getArticlePreview } from '~~/utils/article-content'

const props = defineProps<{
  article: BlogArticle
}>()

const authorInitials = computed(() => {
  const name = props.article.author?.name?.trim()

  if (!name) {
    return '??'
  }

  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const articlePreview = computed(() => getArticlePreview(props.article.content))

const articleHref = computed(() => {
  if (!props.article.documentId) {
    return null
  }

  return `/articles/${props.article.documentId}`
})
</script>

<template>
  <article class="card border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur">
    <figure v-if="article.cover" class="overflow-hidden border-b border-slate-200/70 bg-slate-100">
      <img
        :src="article.cover.url"
        :alt="article.cover.alternativeText || article.title"
        class="h-56 w-full object-cover"
        loading="lazy"
      >
    </figure>

    <div class="card-body gap-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-3">
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

          <div class="space-y-2">
            <p class="text-xs font-semibold tracking-[0.28em] text-slate-500 uppercase">
              Article
            </p>
            <h2 class="text-2xl font-semibold leading-tight text-slate-900">
              {{ article.title }}
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span class="material-symbols-rounded text-sky-700">rss_feed</span>
          <span>Strapi</span>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4">
        <div class="avatar placeholder shrink-0">
          <div class="w-12 rounded-2xl bg-slate-900 text-sm font-semibold text-white">
            <span>{{ authorInitials }}</span>
          </div>
        </div>

        <div class="min-w-0 space-y-1">
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <span class="material-symbols-rounded !text-base text-amber-600">person</span>
            <span class="font-medium uppercase tracking-[0.2em]">Auteur</span>
          </div>
          <p class="truncate text-base font-semibold text-slate-900">
            {{ article.author?.name || 'Auteur non renseigné' }}
          </p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <span class="material-symbols-rounded !text-base text-sky-700">article</span>
          <span class="font-medium uppercase tracking-[0.2em]">Aperçu</span>
        </div>
        <p class="article-excerpt text-[1.02rem] text-slate-700">
          {{ articlePreview }}
        </p>
      </div>

      <div class="card-actions justify-end">
        <NuxtLink
          v-if="articleHref"
          :to="articleHref"
          class="btn btn-primary rounded-full px-5"
        >
          Lire l’article
        </NuxtLink>
        <button
          v-else
          class="btn btn-disabled rounded-full px-5"
          type="button"
        >
          Article indisponible
        </button>
      </div>
    </div>
  </article>
</template>
