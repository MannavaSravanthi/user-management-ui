import '../styles/globals.css';
import type { AppProps } from 'next/app';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import { useRouter } from 'next/router';
import { UserProvider } from '../context/user-context';

// Define a list of public routes
const PUBLIC_ROUTES = ['/login', '/signup'];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname);

  return (
    <UserProvider>
      {isPublicRoute ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedLayout>
          <Component {...pageProps} />
        </ProtectedLayout>
      )}
    </UserProvider>
  );
}

export default MyApp;
