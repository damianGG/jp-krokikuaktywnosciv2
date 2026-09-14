/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['@vercel/blob', 'undici', 'sanitize-html'],
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '1337',
            },
            {
                protocol: 'https',
                hostname: 'aktywnekobiety.pl',
            },
            {
                protocol: 'https',
                hostname: 'jpmcg.up.railway.app',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'github.com',
            },
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
                ],
            },
        ];
    },
};

export default nextConfig;
