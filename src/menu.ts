// 교육(종합 교보재) 메뉴 트리. 메뉴를 고치려면 이 파일만 고친다 — 레일 · 홈 · 주소가 함께 바뀐다.
// 화면을 만들면 screens.ts 에 올린다. 올리기 전까지는 plan 이 자리 화면에 보인다.
import { BookOpenCheck, ClipboardCheck, MapPinned, MonitorPlay, Plane, RadioTower } from 'lucide-react'

import type { MenuGroup } from './shell/types'

export const MODULE_DESC = '비행교육원 교관과 학생이 함께 쓰는 교보재'

export const MENU: MenuGroup[] = [
  {
    id: 'g1000',
    label: 'G1000 Trainer',
    desc: 'C172S NAV III 기준 G1000 조작 연습',
    icon: MonitorPlay,
    items: [
      {
        id: 'pfd',
        label: 'PFD 기본 조작',
        desc: '노브와 소프트키로 PFD 를 다룬다',
        plan: ['HDG · CRS · ALT 노브와 소프트키', 'Alt Bug 경고음', 'MFD 는 다음 단계'],
        awos: ['지금 AWOS 연습 탭에 있는 G1000 Trainer(public/trainer/g1000)를 이쪽으로 옮겨 온다'],
      },
      {
        id: 'fix-to-fix',
        label: 'Fix-to-Fix',
        desc: '지금 위치에서 다른 Fix 로 바로 가는 연습',
        plan: ['기준 항행시설과 출발 · 도착 Fix 고르기', '비행 경로와 오차 표시'],
        awos: ['기준 항행시설은 기관 설정에서 받는다(정석은 JDG VOR)'],
      },
      {
        id: 'holding-entry',
        label: 'Holding Entry',
        desc: '체공 진입 방식 고르기와 진입 비행',
        plan: ['Direct · Teardrop · Parallel 판단', '진입부터 한 바퀴까지 비행'],
      },
      {
        id: 'task',
        label: '통합 과제',
        desc: 'Fix-to-Fix 와 Holding 을 이어서 하는 평가',
        plan: ['과제 출제(교관 지정 · 무작위)', '평가 모드와 결과 요약'],
      },
      {
        id: 'history',
        label: '연습 기록',
        desc: '내가 한 연습과 평가 결과',
        plan: ['날짜별 연습 · 평가 목록', '교관이 학생 기록 보기'],
        awos: ['로그인한 계정 · 소속 차수로 기록을 묶는다'],
      },
    ],
  },
  {
    id: 'maneuver',
    label: 'Maneuver',
    desc: '과정별 기동 절차와 수행 기준',
    icon: Plane,
    items: [
      {
        id: 'list',
        label: '기동 목록',
        desc: '과정 · 기종별 기동',
        plan: ['과정(자가용 · 계기 · 사업용 등)과 기종으로 고르기', '기동 찾기'],
        awos: ['과정 · 기종은 기관의 실라버스와 기체 목록에서 받는다'],
      },
      {
        id: 'procedure',
        label: '절차 · 수행 기준',
        desc: '기동 하나의 순서와 기준',
        plan: ['진입 조건 · 순서 · 회복', '수행 기준(고도 · 속도 · 방위 허용 범위)', '그림 · 영상'],
      },
      {
        id: 'errors',
        label: '자주 나오는 오류',
        desc: '기동별 흔한 실수와 교정',
        plan: ['기동별 오류와 교정 방법', '교관 메모'],
      },
      {
        id: 'grade',
        label: '평가표',
        desc: '교관이 기동별로 매기는 평가',
        plan: ['기동별 평가 항목', '평가 결과를 훈련 기록으로 보내기'],
        awos: ['평가 결과를 AWOS 훈련기록부로 넘긴다'],
      },
    ],
  },
  {
    id: 'preflight',
    label: 'Pre-flight',
    desc: '비행 전 확인',
    icon: ClipboardCheck,
    items: [
      {
        id: 'documents',
        label: '서류 · 탑재물',
        desc: '비행 전에 확인할 서류와 탑재물',
        plan: ['기체 서류와 조종사 서류 목록', '확인 순서'],
      },
      {
        id: 'walkaround',
        label: '외부점검',
        desc: '기종별 외부점검 순서',
        plan: ['기종별 점검 순서와 사진', '점검 항목별 확인 요령'],
        awos: ['기종은 기관의 기체 목록에서 받는다'],
      },
      {
        id: 'weight-balance',
        label: '중량 · 균형, 성능',
        desc: '중량 · 균형과 성능 계산 연습',
        plan: ['중량 · 균형 계산 연습', '이착륙 성능 읽기'],
        awos: ['기체별 자중 · 모멘트 값은 AWOS 기체 관리에서 받는다'],
      },
      {
        id: 'checklist',
        label: '체크리스트',
        desc: '단계별 체크리스트 익히기',
        plan: ['단계별 체크리스트', '암기 항목 연습'],
      },
    ],
  },
  {
    id: 'local',
    label: 'Local Procedure',
    desc: '교육원 · 비행장별 절차',
    icon: MapPinned,
    items: [
      {
        id: 'airport',
        label: '비행장 · 장주',
        desc: '정석비행장(RKPD) 3D — 표지를 누르면 뜻과 근거가 나온다',
        plan: ['활주로 · 유도로 · 주기장', '장주 경로와 고도'],
        awos: ['기관 설정으로 교육원마다 다른 내용을 보여 준다'],
      },
      {
        id: 'area',
        label: '훈련 공역',
        desc: '공역 경계와 고도',
        plan: ['공역 경계 · 고도 · 참조점', '공역별 주의 사항'],
        awos: ['AWOS 에 등록된 기관 공역을 지도로 받는다'],
      },
      {
        id: 'departure-arrival',
        label: '출항 · 입항 절차',
        desc: '공역까지 가고 돌아오는 길',
        plan: ['출항 · 입항 경로와 보고 지점', '절차 그림'],
      },
      {
        id: 'radio',
        label: '교신',
        desc: '구간별 표준 교신',
        plan: ['구간별 교신 예문', '따라 말하기 연습'],
      },
    ],
  },
  {
    id: 'navaids',
    label: 'Navaids',
    desc: '항행안전시설 이해와 계기 읽기',
    icon: RadioTower,
    items: [
      {
        id: 'vor',
        label: 'VOR',
        desc: '방위 읽기와 Radial 따라가기',
        plan: ['CDI · TO/FROM 읽기', 'Radial 진입과 추적'],
      },
      {
        id: 'dme',
        label: 'DME',
        desc: '거리 읽기와 DME Arc',
        plan: ['경사 거리 이해', 'DME Arc 비행'],
      },
      {
        id: 'ils',
        label: 'ILS',
        desc: 'Localizer 와 Glide Slope',
        plan: ['Localizer · Glide Slope 읽기', '접근 따라가기'],
      },
      {
        id: 'gnss',
        label: 'GPS · RNAV',
        desc: 'GPS 항법과 RNAV 절차',
        plan: ['Direct-To · 비행계획', 'RNAV 접근 따라가기'],
      },
    ],
  },
  {
    id: 'manage',
    label: '관리',
    desc: '교재 등록과 배포',
    icon: BookOpenCheck,
    items: [
      {
        id: 'materials',
        label: '교재 관리',
        desc: '교재 올리기 · 고치기',
        plan: ['교재 등록 · 수정 · 숨기기', '개정 이력'],
      },
      {
        id: 'assign',
        label: '배포 대상',
        desc: '차수 · 과정별로 교재 열어 주기',
        plan: ['차수 · 과정 · 개인별 배포', '필수 교재 지정'],
        awos: ['구성원 · 차수는 AWOS 에서 받는다'],
      },
      {
        id: 'progress',
        label: '학습 현황',
        desc: '누가 어디까지 봤는지',
        plan: ['학생별 · 교재별 진행', '평가 결과 모아 보기'],
      },
    ],
  },
]
