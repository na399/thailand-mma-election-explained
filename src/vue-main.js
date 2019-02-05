import Vue from 'vue';
import App from './App.vue';
import Element from 'element-ui';
import locale from 'element-ui/lib/locale/lang/th';
import 'element-ui/lib/theme-chalk/index.css';
import PartyParams from './components/PartyParams.vue';

// Services
Vue.use(Element, { locale });

// Components
Vue.component('PartyParams', PartyParams);

var app = new Vue({
  el: '#app',
  render: h => h(App)
});
