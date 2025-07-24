import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppProvider } from '../context/AppContext'; // Import the AppProvider

export default function App({ Component, pageProps }: AppProps) {
  return (
    // By wrapping everything in AppProvider, every component inside
    // will have access to our shared state.
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}
