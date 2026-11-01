const nextConfig = {
  serverExternalPackages: ['pg', '@huggingface/transformers'],
  // Lets Turbopack run Tailwind on our CSS (from the original create-next-app config)
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};
export default nextConfig;
