import { prisma } from "@/lib/prisma";
import randomstring from "randomstring";
import * as z from "zod";
import Content from "./components/MainPageContent";

type URLBanData = {
  banned: boolean;
  note?: string | null | undefined;
};

/**
 * Main Page.
 * @returns JSX.Element containing NavBar & Content.
 */
export default function Home() {
  /**
   * Check if URL is in blacklist
   * @param url - URL to check against blacklist
   * @returns true if URL is blacklisted, false otherwise
   */
  async function isBlacklisted(url: string): Promise<URLBanData> {
    "use server";
    let banNote: string | null | undefined = "";
    const entries = await prisma.urlBlacklist.findMany({
      select: { pattern: true, note: true },
    });

    if (!entries.length) return { banned: false };

    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const targetUrl = url.toLowerCase();

    if (
      entries.some(({ pattern, note }) => {
        const p = pattern.trim().toLowerCase();
        if (!p) return false;
        if (domain.includes(p) || targetUrl.includes(p)) {
          banNote = note;
          return true;
        } else {
          return false;
        }
      })
    ) {
      return {
        banned: true,
        note: banNote,
      };
    } else {
      return { banned: false };
    }
  }

  /**
   * Generate shortened URL and create database entries
   * @param state - Previous form state
   * @param formData - Form data containing the URL to shorten
   * @returns Form state with errors or success data
   */
  async function genURL(state: { message: string }, formData: FormData) {
    "use server";
    const URLSchema = z.object({
      url: z.url(),
    });

    const validatedFields = URLSchema.safeParse({
      url: formData.get("url"),
    });

    if (!validatedFields.success) {
      const flatErrors = z.flattenError(validatedFields.error);
      return {
        message: "URL is invalid",
        errors: {
          errors: flatErrors.formErrors,
          properties: flatErrors.fieldErrors as unknown as {
            url?: {
              errors: string[];
            };
          },
        },
      };
    }

    const banData = await isBlacklisted(validatedFields.data.url);
    // 블랙리스트 체크
    if (banData.banned) {
      return {
        success: false,
        message: "This URL is not allowed (blacklisted)",
        errors: {
          errors: [banData.note ?? "URL이 차단 목록에 포함되어 있습니다"],
          properties: {},
        },
      };
    }

    const generatedId = randomstring.generate({
      length: 16,
      charset: "alphanumeric",
    });
    const managePage = randomstring.generate({
      length: 30,
      charset: "alphanumeric",
    });
    await prisma.links.create({
      data: {
        id: generatedId,
        redirect_url: validatedFields.data.url,
      },
    });
    await prisma.urlManagePage.create({
      data: {
        id: generatedId,
        managePage: managePage,
      },
    });
    return {
      message: "URL generated successfully.",
      success: true,
      generatedId,
      managePage,
    };
  }

  return <Content genURL={genURL} />;
}
