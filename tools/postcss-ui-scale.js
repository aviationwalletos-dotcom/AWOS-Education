// v801: 큰 화면에서 화면 전체를 비율대로 키우기 — CSS 의 px 값을 calc(px * var(--us, 1)) 로 바꾼다.
// 글자 · 여백 · 상자 폭이 함께 커진다(브라우저 확대와 비슷하지만, 화면 높이(vh) · 지도 · JS 가 재는 값은 그대로라 어긋나지 않는다).
// 배율(--us)은 index.css 에서 화면 폭 · 간편 화면 여부로 정한다. rem 을 쓰는 Tailwind 기본 클래스는 html 글자 크기로 같이 커진다.
// 바꾸지 않는 것: 1px 이하(가는 선), node_modules 의 CSS(지도 등), @property · @font-face, url(), 인쇄(--us 를 1 로 되돌림).
const PX = /(-?\d*\.?\d+)px\b/g

export default function uiScale() {
  return {
    postcssPlugin: 'awos-ui-scale',
    Once(root) {
      const file = (root.source && root.source.input && root.source.input.file) || ''
      if (/node_modules/.test(file)) return
      root.walkDecls((decl) => {
        if (!decl.value.includes('px') || decl.value.includes('url(')) return
        if (decl.prop === 'content' || decl.prop === 'initial-value' || decl.prop === '--us-screen' || decl.prop === '--us-simple') return
        let p = decl.parent
        while (p) {
          if (p.type === 'atrule' && (p.name === 'property' || p.name === 'font-face')) return
          if (p.type === 'rule' && /\.leaflet|\.no-ui-scale-decl/.test(p.selector)) return
          p = p.parent
        }
        decl.value = decl.value.replace(PX, (m, n) => (Math.abs(parseFloat(n)) <= 1 ? m : `calc(${n}px * var(--us, 1))`))
      })
    },
  }
}
uiScale.postcss = true
