import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { BASENAME } from './module'
import GroupPage from './pages/GroupPage'
import HomePage from './pages/HomePage'
import ItemPage from './pages/ItemPage'
import NotFoundPage from './pages/NotFoundPage'
import { AppShell } from './shell/AppShell'

// 주소: /  ·  /묶음  ·  /묶음/화면  (앞에 붙는 주소(BASENAME)가 자동으로 붙는다)
// 메뉴는 menu.ts, 만든 화면은 screens.ts 에서 고친다. 여기는 건드릴 일이 거의 없다.
export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path=":groupId" element={<GroupPage />} />
          <Route path=":groupId/:itemId" element={<ItemPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
