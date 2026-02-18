import { redirect } from "next/navigation"

export default async function ReturnOrderPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/user/orders`)
}
