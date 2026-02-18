import { redirect } from "next/navigation"

export default async function SellerPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/categories`)
}
