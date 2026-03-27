export interface BlogAuthor {
  name: string
  bio: string | null
  email: string | null
}

export interface BlogCategory {
  name: string
  slug: string | null
}

export interface BlogCover {
  url: string
  alternativeText: string | null
  width: number | null
  height: number | null
}

export interface BlogArticle {
  id: number | string
  documentId?: string
  title: string
  content: string
  cover: BlogCover | null
  author: BlogAuthor | null
  categories: BlogCategory[]
}
