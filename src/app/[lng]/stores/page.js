"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n/client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { GetStores } from "@/lib/requests/stores";
import StoreCard from "@/components/stores/StoreCard";

export default function StoreManagement({ params: { lng } }) {
  const router = useRouter();
  const session = useSession();
  if (session && session.status === "unauthenticated") {
    router.push(`/${lng}/login`);
  }

  const [stores, setStores] = useState(null);

  useEffect(() => {
    GetStores(
      (stores) => {
        setStores(stores);
      },
      (e) => {
        console.log(e);
      }
    );
  }, []);

  const { t } = useTranslation(lng, "common");
  return (
    <main className="flex justify-center p-2 pb-[200px]">
      <div className="w-full max-w-[600px] md:w-[600px] mx-auto font-mono text-sm">
        <div className="flex w-full justify-between border-b-2 border-gray-800 pb-3 pt-2 text-2xl px-2 mb-2">
          {t("Stores")}
        </div>
        {stores && stores.length > 0 ? (
          stores.map((params) => (
            params.lng = lng,
            <StoreCard {...params}/>
          ))
        ) : stores === null ? (
          Array.from({ length: 3 }, (e, i) => i).map((i) => (
            <StoreCard order={null} orderId={i} lng={lng} isLoading={true} />
          ))
        ) : (
          <p className="text-sm">
            {t("Add a store by clicking the button below.")}
          </p>
        )}
      </div>
      <div
        className="w-full max-w-[700px] fixed bottom-[90px] md:bottom-[100px] h-[50px] border-t-[1px] md:border-[1px] border-gray-600 p-2 bg-[#A3DE69] md:rounded-md"
        onClick={() => {
          router.push(`/${lng}/stores/new-store`);
        }}
      >
        <span className="text-2xl">+ {t("Add store")}</span>
      </div>
    </main>
  );
}
