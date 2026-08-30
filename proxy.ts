import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'triad_session';

const protectedRoutes = ['/dashboard', '/labs', '/cases', '/shipping', '/profile'];
const authRoutes = ['/login', '/signup'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = req.cookies.get(SESSION_COOKIE)?.value;

  // The landing page '/' is always public
  if (path === '/') {
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some((r) => path.startsWith(r));
  const isAuth = authRoutes.some((r) => path.startsWith(r));

  // If trying to access protected routes without session -> redirect to login
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // If already logged in and visiting login/signup -> redirect to dashboard
  if (isAuth && session) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher:
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|next.svg|vercel.svg|file.svg|globe.svg|window.svg|icons|.*\\..*).*)',
};
