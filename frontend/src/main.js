import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueSweetalert2 from "vue-sweetalert2";
import './style.css';
import moment from "moment";
import MarqueeText from "vue-marquee-text-component";
import '@mdi/font/css/materialdesignicons.min.css';


Vue.component("marquee-text", MarqueeText);
import "sweetalert2/dist/sweetalert2.min.css";
Vue.config.productionTip = false;

Vue.filter("formatDate", function (value) {
  if (value) {
    return moment(String(value)).format("MM/DD/YYYY hh:mm ");
  }
});
Vue.filter("formatLocalDate", function (value) {
  if (value) {
    return moment(String(value)).format("MM/DD/YYYY");
  }
});




new Vue({
  router,
  store,
  vuetify,
  VueSweetalert2,
  render: h => h(App)
}).$mount('#app')
