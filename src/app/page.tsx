import { prisma } from "@/lib/prisma";
import randomstring from "randomstring";
import * as z from "zod";
import Content from "./components/Content";

/**
 * Main Page.
 * @returns JSX.Element containing NavBar & Content.
 */
export default function Home() {
  /**
   * Navigation bar for mainpage.
   * @returns JSX.Element containing div.
   */
  function NavBar() {
    return (
      <div className="navbar bg-base-100 shadow-sm">
        <a className="btn btn-ghost text-xl">LnkCnt</a>
      </div>
    );
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

    const generatedId = randomstring.generate({
      length: 16,
      charset: "alphanumeric",
    });
    const newLinksEntry = await prisma.links.create({
      data: {
        id: generatedId,
        redirect_url: validatedFields.data.url,
      },
    });
    const managePage = randomstring.generate({
      length: 30,
      charset: "alphanumeric",
    });
    const newManagePage = await prisma.urlManagePage.create({
      data: {
        id: generatedId,
        managePage,
      },
    });
    return {
      message: "URL generated successfully.",
      success: true,
      generatedId,
      managePage,
    };
  }

  return (
    <>
      {NavBar()}
      <Content genURL={genURL} />
    </>
  );
}
