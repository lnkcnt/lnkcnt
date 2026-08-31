import { GlideClient } from "@valkey/valkey-glide";

const clientPromise = GlideClient.createClient({
    addresses: [
        {
            host: process.env.VALKEY_HOST ?? "localhost",
            port: Number(process.env.VALKEY_PORT ?? 6379),
        },
    ],
    credentials: {
        username: process.env.VALKEY_USERNAME,
        password: process.env.VALKEY_PASSWORD ?? "",
    },
});

export function getValkey() {
    return clientPromise;
}
