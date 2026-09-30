-- AddForeignKey
ALTER TABLE "staff_skills" ADD CONSTRAINT "staff_skills_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
