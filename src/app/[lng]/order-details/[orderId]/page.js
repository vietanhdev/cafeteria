"use client";
import { useTranslation } from "@/app/i18n/client";
import { useRouter } from "next/navigation";
import { useGetOrder, CancelOrder } from "@/lib/requests/orders";
import {
  ORDER_STATUS_TO_BG_COLOR,
  ORDER_STATUS_TO_TEXT,
  OrderStatus,
} from "@/lib/order_status";
import { useSession } from "next-auth/react";
import BackButton from "@/components/buttons/BackButton";
import Rating from "@/components/Rating";
import Comment from "@/components/Comment";
import { useGetCommonSettings } from "@/lib/requests/settings";
import { formatPrice } from "@/lib/utils";

export default function ({ params: { lng, orderId } }) {
  const router = useRouter();
  const session = useSession();
  if (session && session.status === "unauthenticated") {
    router.push(`/${lng}/login`);
  }

  const { data: commonSettings } = useGetCommonSettings();

  const { order: orderData, isLoading, error } = useGetOrder(orderId);
  if (error) {
    console.log(error);
    toast.error("Could not get orders");
    router.push(`/${lng}/orders`);
  }

  const { t } = useTranslation(lng, "common");
  const orderStatusBg = ORDER_STATUS_TO_BG_COLOR[orderData?.status];
  const itemStatusText = ORDER_STATUS_TO_TEXT[orderData?.status];
  const translatedStatus = t(itemStatusText);
  const orderTime = new Date(orderData?.timestamp).toLocaleString();
  const price = orderData?.price;
  const tax = orderData?.tax;
  const totalPrice = orderData?.totalPrice;
  const itemsWithPrice = orderData?.items;
  const deliveryAddress = orderData?.deliveryAddress;
  const rating = orderData?.rating;
  const customerComment = orderData?.customerComment;
  const staffComment = orderData?.staffComment;

  function handleCancelOrder() {
    CancelOrder(
      orderId,
      () => {
        router.push(`/${lng}/orders`);
      },
      (e) => {
        console.log(e);
        toast.error("Could not cancel order");
      }
    );
  }

  function handleReorder() {
    const cart = itemsWithPrice.map((item) => {
      const { id, quantity, selectedOptions } = item;
      return {
        id,
        quantity,
        selectedOptions,
      };
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push(`/${lng}/cart`);
  }

  return (
    <main className="flex justify-center p-2 pb-[200px]">
      <div className="w-full max-w-[600px] md:w-[1000px] mx-auto font-mono text-sm">
        <div className="flex w-full border-b-2 border-gray-800 pb-3 pt-2 text-2xl px-2 mb-2">
          <BackButton href={`/${lng}/orders`} />
          {t("Order")}
        </div>
        {orderStatusBg && itemStatusText && (
          <p className="text-sm font-bold mb-2 mt-4">
            <span
              className="p-1 rounded-md mr-2"
              style={{ background: orderStatusBg }}
            >
              {translatedStatus}
            </span>
            <span>{orderTime}</span>
          </p>
        )}
        {itemsWithPrice &&
          itemsWithPrice.map((item, index) => {
            const { name, price, quantity } = item;
            return (
              <div
                className={
                  "p-4 border-b-2" + (index % 2 === 0 ? " bg-gray-100" : "")
                }
                key={index}
              >
                <div className="flex justify-between w-full pb-1 pt-2">
                  <p className="text-sm font-bold">{t(name)}</p>
                  <p className="text-sm font-bold">
                    {quantity} x{" "}
                    {formatPrice(
                      price,
                      commonSettings?.currencyPrefix,
                      commonSettings?.currencySuffix,
                      commonSettings?.currencyDecimal
                    )}
                  </p>
                </div>
                <img src={item.image} className="w-16 h-auto rounded-md mb-4" />
                {Object.keys(item.customizations)
                  .sort(
                    (a, b) =>
                      item.customizations[a].order -
                      item.customizations[b].order
                  )
                  .map((customizationId) => {
                    if (item.selectedOptions[customizationId] === undefined)
                      return;
                    return (
                      <p
                        key={item.customizations[customizationId].order}
                        className="text-sm"
                      >
                        {t(item.customizations[customizationId].name)}:{" "}
                        {t(
                          item.customizations[customizationId].options[
                            item.selectedOptions[customizationId]
                          ]?.name
                        )}
                      </p>
                    );
                  })}
              </div>
            );
          })}
        {price && (
          <>
            <div className="flex justify-between w-full pt-4">
              <p className="text-sm font-bold mb-2">{t("Before Tax")}</p>
              <p className="text-sm font-bold mb-2">
                {formatPrice(
                  price,
                  commonSettings?.currencyPrefix,
                  commonSettings?.currencySuffix,
                  commonSettings?.currencyDecimal
                )}
              </p>
            </div>
            <div className="flex justify-between w-full">
              <p className="text-sm font-bold mb-2">{t("Tax")}</p>
              <p className="text-sm font-bold mb-2">
                {formatPrice(
                  tax,
                  commonSettings?.currencyPrefix,
                  commonSettings?.currencySuffix,
                  commonSettings?.currencyDecimal
                )}
              </p>
            </div>
            <div className="flex justify-between w-full border-b-2 border-gray-800">
              <p className="text-sm font-bold mb-2">{t("Total")}</p>
              <p className="text-sm font-bold mb-2">
                {formatPrice(
                  totalPrice,
                  commonSettings?.currencyPrefix,
                  commonSettings?.currencySuffix,
                  commonSettings?.currencyDecimal
                )}
              </p>
            </div>
          </>
        )}
        {orderData ? (
          <></>
        ) : isLoading ? (
          <p className="text-md">{t("Loading...")}</p>
        ) : (
          <p className="text-sm">{t("No data")}</p>
        )}
        {deliveryAddress && (
          <div className="flex flex-col items-begin justify-center w-full mt-4">
            <p className="text-sm font-bold">{t("Delivery Address")}</p>
            <p className="text-sm">{t(deliveryAddress)}</p>
          </div>
        )}
        {orderData?.status === OrderStatus.COMPLETED &&
          (rating ? (
            <div className="flex flex-col items-begin justify-center w-full mt-4 border-t-2 border-gray-800 py-4">
              <p className="text-sm font-bold">{t("Rating")}</p>
              <div className="my-2">
                <Rating value={rating} />
              </div>
              {customerComment && <Comment comment={customerComment} />}
              {staffComment && <Comment comment={staffComment} />}
            </div>
          ) : orderData === null ? (
            <></>
          ) : (
            <div
              className="flex flex-col items-end justify-center w-full mt-4 border-t-2 border-gray-800 py-4 clickable"
              onClick={() => {
                router.push(`/${lng}/order-details/${orderId}/rating`);
              }}
            >
              <p className="text-sm font-bold text-blue-700">
                {t("+ Add a rating")}
              </p>
            </div>
          ))}
      </div>

      <div className="btn bg-gray-300 hover:bg-orange-500 mb-2 w-full max-w-[700px] fixed bottom-[90px]  md:bottom-[20px]">
        {orderData?.status === OrderStatus.QUEUED && (
          <div onClick={handleCancelOrder}>
            <span className="text-2xl">{t("Cancel order")}</span>
          </div>
        )}
        {[OrderStatus.CANCELLED, OrderStatus.COMPLETED].includes(
          orderData?.status
        ) && (
          <div onClick={handleReorder}>
            <span className="text-2xl">{t("Re-order")}</span>
          </div>
        )}
      </div>
    </main>
  );
}
