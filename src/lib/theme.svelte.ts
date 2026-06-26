/**
 * 라이트/다크 테마 토글.
 * 기본값은 라이트. 선택은 localStorage('theme')에 저장하고
 * <html data-theme="..."> 로 적용한다 (실제 색은 app.css의 토큰이 결정).
 * 초기 깜빡임(FOUC) 방지는 app.html의 인라인 스크립트가 먼저 처리한다.
 */
type Theme = 'light' | 'dark';

function stored(): Theme {
	if (typeof localStorage !== 'undefined') {
		const t = localStorage.getItem('theme');
		if (t === 'light' || t === 'dark') return t;
	}
	return 'light';
}

class ThemeStore {
	current = $state<Theme>('light');

	init() {
		this.current = stored();
		this.apply();
	}

	private apply() {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', this.current);
		}
	}

	toggle() {
		this.current = this.current === 'light' ? 'dark' : 'light';
		if (typeof localStorage !== 'undefined') localStorage.setItem('theme', this.current);
		this.apply();
	}
}

export const theme = new ThemeStore();
