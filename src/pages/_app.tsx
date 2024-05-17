import { type AppType } from "next/dist/shared/lib/utils";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

import "~/styles/globals.css";


const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights/>
    </>
  );
};

export default MyApp;
