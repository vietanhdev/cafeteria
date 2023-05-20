"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n/client";
import { GetOrders } from "@/lib/requests/orders";
import {
  ORDER_STATUS_TO_BG_COLOR,
  ORDER_STATUS_TO_TEXT,
} from "@/lib/order_status";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    <main className="flex justify-center p-2 pb-[100px]">
      <div className="w-full max-w-[600px] md:w-[600px] mx-auto font-mono text-sm">
        <p className="flex w-full justify-between border-b-2 border-gray-800 pb-3 pt-2 text-2xl px-2 mb-2">
          {t("Order History")}
          <a href={`/${lng}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </a>
        </p>
        {orderItems && orderItems.length > 0 ? (
          orderItems.map((order, orderId) => {
            const status = order.status;
            const totalPrice = order.totalPrice;
            const timestamp = order.timestamp;
            const orderTime = new Date(timestamp).toLocaleString();
            const itemsWithPrice = order.items;
            const tax = order.tax;
            const orderStatusBg = ORDER_STATUS_TO_BG_COLOR[status];
            const itemStatusText = ORDER_STATUS_TO_TEXT[status];
            const translatedStatus = t(itemStatusText);

            return (
              <Link href={`/${lng}/order-details/${order.id}`}>
                <div
                  key={orderId}
                  className={
                    "flex flex-col items-center justify-center w-full p-4 min-h-[100px] mx-1 border-b-2 hover:bg-gray-200" +
                    (orderId % 2 === 0 ? " bg-gray-100" : "")
                  }
                >
                  <div className="flex flex-col items-begin justify-center w-full relative">
                    <p className="text-sm font-bold mb-2">
                      <span
                        className="p-1 rounded-md"
                        style={{ background: orderStatusBg }}
                      >
                        {translatedStatus}
                      </span>
                    </p>
                    <p className="text-sm">{orderTime}</p>
                    <p className="text-sm">
                      {t("Number of items")}: {itemsWithPrice.length}
                    </p>
                    {itemsWithPrice.map((item, itemId) => {
                      const price = item.price;
                      const name = item.name;
                      const quantity = item.quantity;
                      const itemTotalPrice = price * quantity;

                      return (
                        <div
                          key={itemId}
                          className="flex flex-row items-center justify-between w-full"
                        >
                          <p className="text-sm">{t(name)}</p>
                          <p className="text-sm">
                            {quantity} x ${price.toFixed(2)} = $
                            {itemTotalPrice.toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                    <div className="flex flex-row items-center justify-between w-full">
                      <p className="text-sm font-bold">{t("Tax")}</p>
                      <p className="text-sm">${tax.toFixed(2)}</p>
                    </div>
                    <p className="absolute right-0 top-0 text-sm float-right font-bold">
                      {t("Total")}: ${totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : orderItems === null ? (
          <p className="text-md">{t("Loading...")}</p>
        ) : (
          <p className="text-sm">
            {t("You have no order. Please go to Home to pick something.")}
          </p>
        )}
      </div>
    </main>
  );
}