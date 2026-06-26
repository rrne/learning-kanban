// 이 앱의 상태는 전부 브라우저 localStorage에 있다 → 서버 렌더링은 불필요.
// SSR을 끄면 하이드레이션 불일치(서버엔 저장값이 없음) 걱정 없이 순수 SPA로 동작한다.
export const ssr = false;
export const prerender = true;
