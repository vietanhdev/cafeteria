"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n/client";
import { GetOrders } from "@/lib/requests/orders";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import XButton from "@/components/buttons/XButton";
import OrderCard from "@/components/orders/OrderCard";

export default function Cart({ params: { lng } }) {
  const router = useRouter();
  const session = useSession();
  if (session && session.status === "unauthenticated") {
    router.push(`/${lng}/login`);
  }

  const [orderItems, setOrderItems] = useState(null);

  useEffect(() => {
    GetOrders(
      (orders) => {
        setOrderItems(orders);
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
          {t("Order History")}
          <XButton />
        </div>
        {orderItems && orderItems.length > 0 ? (
          orderItems.map((order, orderId) => (
            <OrderCard
              lng={lng}
              order={order}
              orderId={orderId}
              isLoading={false}
            />
          ))
        ) : orderItems === null ? (
          Array.from({ length: 3 }, (e, i) => i).map((i) => (
            <OrderCard order={null} orderId={i} lng={lng} isLoading={true} />
          ))
        ) : (
          <p className="text-sm">
            {t("You have no order. Please go to Home to pick something.")}
          </p>
        )}
      </div>
    </main>
  );
}
