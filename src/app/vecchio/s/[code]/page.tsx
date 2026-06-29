import { redirect } from "next/navigation";
import { vecchioPath } from "@vecchio/lib/paths";
import { normalizeSessionCode } from "@vecchio/lib/session-code";

type Props = {
  params: Promise<{ code: string }>;
};

/** Legacy /vecchio/s/CODE URLs → /vecchio/CODE */
export default async function LegacySessionRedirect({ params }: Props) {
  const { code } = await params;
  redirect(vecchioPath(`/${normalizeSessionCode(code)}`));
}
