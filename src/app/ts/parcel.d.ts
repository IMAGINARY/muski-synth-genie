declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module 'bundle-text:*' {
  const bundleText: string;
  export default bundleText;
}
