<script setup lang="ts">
import type { BlogArticle } from '~~/types/blog'

const { data, status, error, refresh } = await useFetch<BlogArticle[]>('/api/articles', {
  key: 'blog-articles',
  default: () => [],
})

const articles = computed(() => data.value ?? [])

const articleCount = computed(() => articles.value.length)

const categoryCount = computed(() => {
  const categoryNames = articles.value.flatMap((article) => article.categories.map((category) => category.name))
  return new Set(categoryNames).size
})

const authorCount = computed(() => {
  const authorNames = articles.value
    .map((article) => article.author?.name)
    .filter((name): name is string => Boolean(name))

  return new Set(authorNames).size
})

useSeoMeta({
  title: 'Blog Tech Headless',
  description: 'Liste SSR des articles Strapi avec aperçu, auteur, catégories et navigation vers une page détail.',
})
</script>

<template>
  <div class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
    <section class="hero overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-sm backdrop-blur">
      <div class="hero-content w-full max-w-none flex-col items-start gap-8 px-6 py-10 sm:px-10">
        <div class="max-w-3xl space-y-5">
          <div class="badge badge-outline gap-2 border-slate-300 bg-white px-4 py-4 text-xs font-semibold tracking-[0.3em] uppercase text-slate-600">
            <span class="material-symbols-rounded !text-base text-sky-700">satellite_alt</span>
            TP CMS Headless
          </div>

          <div class="space-y-4">
            <h1 class="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Blog tech Nuxt connecté à Strapi, chargé côté serveur avec <span class="text-sky-700">useFetch</span>.
            </h1>
            <p class="max-w-2xl text-lg leading-8 text-slate-600">
              Cette page consomme l’API du back-office headless et affiche les articles publiés sous forme d’aperçu.
              Chaque carte donne accès à une page détail qui rend le contenu en markdown avec les catégories et
              l’auteur.
            </p>
          </div>
        </div>

        <div class="grid w-full gap-4 md:grid-cols-3">
          <div class="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Articles publiés</p>
            <p class="mt-3 text-4xl font-semibold text-slate-950">{{ articleCount }}</p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Catégories</p>
            <p class="mt-3 text-4xl font-semibold text-slate-950">{{ categoryCount }}</p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Auteurs visibles</p>
            <p class="mt-3 text-4xl font-semibold text-slate-950">{{ authorCount }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="status === 'pending'" class="grid gap-6 lg:grid-cols-2">
      <div
        v-for="index in 4"
        :key="index"
        class="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm"
      >
        <div class="skeleton h-52 w-full rounded-[1.5rem]" />
        <div class="mt-6 space-y-4">
          <div class="skeleton h-4 w-24" />
          <div class="skeleton h-8 w-3/4" />
          <div class="skeleton h-24 w-full" />
          <div class="skeleton h-12 w-2/3" />
        </div>
      </div>
    </section>

    <section v-else-if="error" class="alert border border-red-200 bg-red-50 text-red-900 shadow-sm">
      <span class="material-symbols-rounded text-red-700">error</span>
      <div class="space-y-1">
        <p class="font-semibold">Impossible de récupérer les articles depuis Strapi.</p>
        <p class="text-sm">
          Vérifie que le backend tourne sur <code>http://localhost:1337</code> et que les permissions publiques
          <code>find</code> / <code>findOne</code> sont bien activées pour <code>Article</code>, <code>Author</code> et
          <code>Category</code>.
        </p>
      </div>
      <button class="btn btn-sm btn-outline border-red-300 text-red-900" type="button" @click="refresh()">
        Réessayer
      </button>
    </section>

    <section v-else-if="articles.length === 0" class="rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-center shadow-sm">
      <div class="mx-auto max-w-xl space-y-4">
        <span class="material-symbols-rounded !text-5xl text-sky-700">newsmode</span>
        <h2 class="text-2xl font-semibold text-slate-950">Aucun article publié</h2>
        <p class="leading-7 text-slate-600">
          Publie d’abord tes contenus dans Strapi puis recharge la page. Le front ne montre que les entrées
          effectivement accessibles via l’API publique.
        </p>
      </div>
    </section>

    <section v-else class="grid gap-6 lg:grid-cols-2">
      <BlogArticleCard
        v-for="article in articles"
        :key="article.documentId || article.id"
        :article="article"
      />
    </section>
  </div>
</template>
