/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2024-07-15 16:31:26
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2024-07-15 16:31:32
 * @FilePath: /xwy-commontool/vue.config.js
 * @Description: 
 * 
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved. 
 */

module.exports = {
  transpileDependencies: ['uview-ui'],
  // 相对路径：GitHub Pages 子目录与本地 `serve dist/build/h5` 均可加载静态资源
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/'
}