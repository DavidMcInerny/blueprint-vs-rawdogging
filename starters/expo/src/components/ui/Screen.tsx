import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Animated, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';
import { ScreenScaffold, ScreenHeader } from '@/foundation/blueprint-shell/components/product-ui';
import { useTheme } from '@/theme/ThemeProvider';
import { ScreenMetadata } from './ScreenMetadata';
export function Screen({
  children,
  title,
  description,
  publicPath,
}: PropsWithChildren<{ title: string; description?: string; publicPath?: string }>) {
  const { dark, reducedMotion } = useTheme();
  const [opacity] = useState(() => new Animated.Value(1));
  const previousTitle = useRef<string | null>(null);
  useEffect(() => {
    opacity.stopAnimation();
    const changed = previousTitle.current !== title;
    previousTitle.current = title;
    opacity.setValue(reducedMotion || !changed ? 1 : 0.88);
    if (!reducedMotion && changed)
      Animated.timing(opacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    return () => opacity.stopAnimation();
  }, [title, reducedMotion, opacity]);
  const insets = useSafeAreaInsets();
  const hostOwnsInsets = useSegments().some((segment) => String(segment) === '(tabs)');
  return (
    <>
      <ScreenMetadata title={title} description={description} publicPath={publicPath} dark={dark} />
      <View role={hostOwnsInsets ? undefined : 'main'} style={{ flex: 1 }}>
        <ScreenScaffold
          header={<ScreenHeader title={title} description={description} />}
          insets={{ top: 0, bottom: insets.bottom }}
          bottomInsetHandledByHost={hostOwnsInsets}
        >
          <Animated.View style={{ gap: 24, opacity }}>{children}</Animated.View>
        </ScreenScaffold>
      </View>
    </>
  );
}
