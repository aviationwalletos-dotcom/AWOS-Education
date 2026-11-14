import { Link } from 'react-router-dom'

import { PanelHeader } from '../shell/PanelHeader'

export default function NotFoundPage() {
  return (
    <>
      <PanelHeader title="없는 화면이에요" desc="주소가 바뀌었거나 없는 화면입니다." />
      <Link to="/" className="awos-btn-line inline-flex items-center">
        홈으로
      </Link>
    </>
  )
}
