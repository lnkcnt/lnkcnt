import { Decoder, TimeUnit } from "@valkey/valkey-glide";
import { getValkey } from "./valkey";

export async function isRateLimited(): Promise<boolean> {
    const valkey = await getValkey();

    const key = await valkey.get("rl:count", { decoder: Decoder.String });

    if (Number(key) > 10) {
        return true;
    } else {
        await valkey.set("rl:count", String(Number(key) + 1), {
            expiry: { type: TimeUnit.Seconds, count: 3600 },
        });
        return false;
    }
}
