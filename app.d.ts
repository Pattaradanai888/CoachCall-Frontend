// app.d.ts
import type { FetchRequest } from 'ofetch';

declare module '#app' {
  interface NuxtApp {
    $api: typeof $fetch & FetchRequest;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: typeof $fetch & FetchRequest;
  }
}
