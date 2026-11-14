// 빌드 뒤 정리.
//  1) dist/404.html — GitHub Pages 가 없는 주소를 앱으로 돌려보내게(index.html 복사본).
//  2) site/ — 단독으로 올릴 때 쓰는 묶음. dist/ 를 붙는 주소(basePath) 아래에 그대로 담는다.
//     예) basePath 가 /edu/ 이면 site/edu/index.html. AWOS 도메인에 붙었을 때와 주소가 같아진다.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const dist = join(root, 'dist')
const site = join(root, 'site')

if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/index.html 이 없어요. vite build 를 먼저 돌리세요.')
  process.exit(1)
}

const html = readFileSync(join(dist, 'index.html'), 'utf8')
const base = (html.match(/<meta name="awos-module-base" content="([^"]*)"/) || [])[1] || '/'

writeFileSync(join(dist, '404.html'), html)

rmSync(site, { recursive: true, force: true })
const mount = base.replace(/^\/+|\/+$/g, '')
const target = mount ? join(site, mount) : site
mkdirSync(target, { recursive: true })
cpSync(dist, target, { recursive: true })

if (mount) {
  // 맨 위 주소로 들어오면 붙는 주소로 보낸다
  writeFileSync(
    join(site, 'index.html'),
    `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${base}"><link rel="canonical" href="${base}"><title>AWOS</title><a href="${base}">${base}</a>\n`,
  )
}
// Netlify: 화면 주소(/edu/g1000/pfd 등)로 바로 들어와도 앱이 뜨게
writeFileSync(join(site, '_redirects'), `${base}*  ${base}index.html  200\n`)

console.log(`site/ 준비 완료 — 붙는 주소 ${base}`)
