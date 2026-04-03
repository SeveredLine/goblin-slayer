import { createPinia } from 'pinia';
import { createApp, type Component } from 'vue';

import App from './App.vue';

const rootStyle = document.documentElement.style;
rootStyle.setProperty('--wood-dark', '#2c1e16');
rootStyle.setProperty('--wood-light', '#4a3219');
rootStyle.setProperty('--brass-gold', '#c5a059');
rootStyle.setProperty('--paper-bg', '#efe6d5');
rootStyle.setProperty('--paper-ink', '#2b231d');
rootStyle.setProperty('--paper-shadow', '#d4c5ab');
rootStyle.setProperty('--ribbon-red', '#8b2525');
rootStyle.setProperty('--ribbon-dark', '#3a2b25');

const app = createApp(App as Component);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');

window.addEventListener('load', () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.addEventListener(
      'transitionend',
      () => {
        loader.remove();
      },
      { once: true },
    );
    loader.style.opacity = '0';
  }
});
