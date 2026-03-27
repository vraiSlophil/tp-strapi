<template>
  <div data-theme="light" class="relative min-h-screen overflow-hidden">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_65%)]"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute bottom-12 right-[-5rem] h-56 w-56 rounded-full bg-amber-200/25 blur-3xl"
    />

    <main class="relative">
      <slot />
    </main>
  </div>
</template>
