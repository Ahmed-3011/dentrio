import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'triad_session';

const protectedRoutes = ['/dashboard', '/labs', '/cases', '/shipping', '/profile'];
const authRoutes = ['/login', '/signup'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = req.cookies.get(SESSION_COOKIE)?.value;

  if (path === '/') {
    return session
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  const isProtected = protectedRoutes.some((r) => path.startsWith(r));
  const isAuth = authRoutes.some((r) => path.startsWith(r));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
  if (isAuth && session) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher:
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|next.svg|vercel.svg|file.svg|globe.svg|window.svg|icons|.*\\..*).*)',
};
