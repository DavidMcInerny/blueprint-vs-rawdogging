import Head from 'expo-router/head';
import { brand } from '@/config/app';
import { env } from '@/config/env';
import type { ScreenMetadataProps } from './ScreenMetadata';

export function ScreenMetadata({ title, description, publicPath, dark }: ScreenMetadataProps) {
  return (
    <Head>
      <title>
        {title} · {brand.name}
      </title>
      <meta name="description" content={description ?? brand.description} />
      <meta
        name="robots"
        content={
          publicPath && env.name === 'production' && env.siteUrl
            ? 'index,follow'
            : 'noindex,nofollow'
        }
      />
      {publicPath && env.siteUrl ? (
        <link rel="canonical" href={`${env.siteUrl}${publicPath}`} />
      ) : null}
      <meta name="theme-color" content={dark ? brand.dark.background : brand.light.background} />
    </Head>
  );
}
