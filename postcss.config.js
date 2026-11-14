import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

import uiScale from './tools/postcss-ui-scale.js'

export default {
  // AWOS 와 같은 화면 배율 — 큰 모니터에서 px 값을 배율(--us)만큼 키운다(tools/postcss-ui-scale.js)
  plugins: [tailwindcss(), uiScale(), autoprefixer()],
}
