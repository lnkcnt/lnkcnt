export async function hashPassword(password: string) {
    const result = await Bun.password.hash(password, {
        algorithm: "argon2id",
        memoryCost: 65536,
        timeCost: 3,
    });
    return result;
}

export async function verifyPassword(data: { password: string; hash: string }) {
    const { password, hash } = data;
    const result = await Bun.password.verify(password, hash, "argon2id");
    return result;
}
