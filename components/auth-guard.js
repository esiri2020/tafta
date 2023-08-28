import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
// import { useAuthContext } from '../contexts/auth-context';
import { useSession } from "next-auth/react"

export const AuthGuard = (props) => {
  const { children } = props;
  const router = useRouter();
  const { data: session, status } = useSession();
  const ignore = useRef(false);
  const [checked, setChecked] = useState(false);
  // Only do authentication check on component mount.
  // This flow allows you to manually redirect the user after sign-out, otherwise this will be
  // triggered and will automatically redirect to sign-in page.

  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }

      // Prevent from calling twice in development mode with React.StrictMode enabled
      if (ignore.current) {
        return;
      }
      if (status === 'loading') {
        return;
      }

      ignore.current = true;

      if (!session) {
        console.log('Not authenticated, redirecting');
        router.replace({
            pathname: '/api/auth/signin',
            query: router.asPath !== '/' ? { continueUrl: 'role' } : undefined
          })
          .catch(console.error);
        setChecked(true);
      } else {
        setChecked(true);
      }
    },
    [router.isReady, status]
  );

  if (!checked) {
    return null;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};
