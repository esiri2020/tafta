import {SessionProvider} from 'next-auth/react';
import './styles.css';
import 'prismjs/themes/prism.css';
import 'react-quill/dist/quill.snow.css';

import type {AppProps} from 'next/app';
import type {Session} from 'next-auth';

import {Fragment} from 'react';
import Head from 'next/head';
import Router from 'next/router';
import {CacheProvider, EmotionCache} from '@emotion/react';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {CssBaseline} from '@mui/material';
import {ThemeProvider} from '@mui/material/styles';
// import { AuthConsumer, AuthProvider } from '../contexts/auth-context';
import {createEmotionCache} from '../utils/create-emotion-cache';
import {registerChartJs} from '../utils/register-chart-js';
import {createTheme} from '../theme';
import {Toaster} from 'react-hot-toast';

// Add React Query imports
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';

import nProgress from 'nprogress';
import type {NextComponentType} from 'next'; //Import Component type

import {Provider} from 'react-redux';
import {store} from '../store';

Router.events.on('routeChangeStart', nProgress.start);
Router.events.on('routeChangeError', nProgress.done);
Router.events.on('routeChangeComplete', nProgress.done);

//Add custom appProp type then use union to add it
interface CustomAppProps extends AppProps {
  Component: NextComponentType & {getLayout?: Function}; // add auth type
  session: Session;
  emotionCache: EmotionCache;
  pageProps: any;
}

registerChartJs();

const clientSideEmotionCache = createEmotionCache();
const queryClient = new QueryClient();

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps: {session, ...pageProps},
}: CustomAppProps) {
  // Initialize React Query client
  const [queryClient] = useState(() => new QueryClient());

  const getLayout = Component.getLayout ?? ((page: any) => page);
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>TAFTA PORTAL</title>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider
          theme={createTheme({
            direction: 'ltr',
            responsiveFontSizes: true,
            theme: 'dark',
          })}>
          <CssBaseline />
          <Toaster position='top-center' />
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <SessionProvider session={session}>
                {getLayout(<Component {...pageProps} />)}
              </SessionProvider>
            </QueryClientProvider>
          </Provider>
        </ThemeProvider>
      </LocalizationProvider>
    </CacheProvider>
  );
}
