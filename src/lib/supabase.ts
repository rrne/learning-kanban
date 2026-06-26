import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// 브라우저 전용 Supabase 클라이언트.
// flowType 'pkce' = OAuth 콜백을 안전하게 교환(서버 비밀키 없이도 안전).
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		flowType: 'pkce',
		detectSessionInUrl: true,
		persistSession: true,
		autoRefreshToken: true
	}
});
