ALTER TABLE "urlReport" DROP CONSTRAINT "urlReport_id_links_id_fk";
--> statement-breakpoint
ALTER TABLE "urlReport" ADD CONSTRAINT "urlReport_id_links_id_fk" FOREIGN KEY ("id") REFERENCES "public"."links"("id") ON DELETE set null ON UPDATE cascade;