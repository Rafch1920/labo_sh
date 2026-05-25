import { redirectBasedOnRole } from "@/lib/auth/helpers";

export default async function HomePage() {
  await redirectBasedOnRole();
}
