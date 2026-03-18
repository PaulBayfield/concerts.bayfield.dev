import { redirect } from "@/i18n/routing";

export default function NotFoundPage() {
    redirect({ href: '/404', locale: 'fr' });
}
