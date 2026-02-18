import { redirect } from 'next/navigation';

export default async function Wishlist({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/user/orders`);
}
