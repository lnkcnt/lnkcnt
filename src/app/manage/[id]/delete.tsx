import axios from "axios";

/**
 * Delete a URL based on Management Page ID.
 * @param id Management Page ID
 * @returns true when success, false when failed.
 */
export async function DeleteURL(id: string) {
    try {
        await axios.post("/api/url/delete", JSON.stringify({ id: id }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error deleting link:", error);
        return false;
    }
}
