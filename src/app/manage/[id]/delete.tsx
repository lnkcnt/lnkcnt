import ky from "ky";

/**
 * Delete a URL based on Management Page ID.
 * @param id Management Page ID
 * @returns true when success, false when failed.
 */
export async function DeleteURL(id: string) {
    try {
        await ky.post("/api/url/delete", {
            body: JSON.stringify({ id: id }),
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return false;
    }
}
