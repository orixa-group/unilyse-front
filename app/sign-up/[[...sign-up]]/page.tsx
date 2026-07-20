import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

export default function SignUpPage() {
  redirect(ROUTES.SIGN_IN);
}
