// plugins/sortable.client.js
import Sortable from 'sortablejs';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      sortable: Sortable,
    },
  };
});
