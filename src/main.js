/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2024-07-15 16:15:30
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2024-07-15 16:29:03
 * @FilePath: /xwy-commontool/src/main.js
 * @Description: 
 * 
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved. 
 */
import Vue from 'vue'
import uView from "uview-ui";

import App from './App'
import './uni.promisify.adaptor'
import pageShareMixin from '@/mixins/pageShare.js'

Vue.use(uView);
Vue.mixin(pageShareMixin);
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
