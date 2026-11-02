export function resolvedBrandChecks(config, brand) {
  const scheme = Array.isArray(config.scheme) && config.scheme.length === 1 ? config.scheme[0] : config.scheme;
  return { name: config.name === brand.name, slug: config.slug === brand.slug, scheme: scheme === brand.scheme };
}

export function remainingDemoFiles(files) {
  return files.filter((file) => {
    const normalized = file.replaceAll('\\', '/');
    if (/(?:^|\/)modules\/notes\//.test(normalized)) return true;
    const route = normalized.replace(/^(?:src\/)?app\//, '').replace(/\([^/]+\)\//g, '').replace(/\.[jt]sx?$/, '');
    return /^(?:src\/)?app\//.test(normalized) && /^(?:explore|modal|notes?|note\/.*)$/.test(route);
  });
}
