"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/i18n/client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { GetProducts } from "@/lib/requests/products";
import ProductCard from "@/components/products/ProductCard";

export default function ProductManagement({ params: { lng } }) {
  const router = useRouter();
  const session = useSession();
  if (session && session.status === "unauthenticated") {
    console.log("Not logged in.");
    router.push(`/${lng}/login`);
  }

  const [products, setProducts] = useState(null);

  useEffect(() => {
    GetProducts(
      (products) => {
        setProducts(products);
      },
      (e) => {
        console.log(e);
        alert("Could not get the products.");
      }
    );
  }, []);

  const { t } = useTranslation(lng, "common");
  return (
    <main className="flex justify-center p-2 pb-[200px]">
      <div className="w-full max-w-[600px] md:w-[600px] mx-auto font-mono text-sm">
        <div className="flex w-full justify-between border-b-2 border-gray-800 pb-3 pt-2 text-2xl px-2 mb-2">
          {t("Products")}
        </div>
        {products && products.length > 0 ? (
          products.map(
            (params, key) => (
              (params.lng = lng), (<ProductCard key={key} {...params} />)
            )
          )
        ) : products === null ? (
          Array.from({ length: 3 }, (e, i) => i).map((i) => (
            <ProductCard
              key={i}
              order={null}
              orderId={i}
              lng={lng}
              isLoading={true}
            />
          ))
        ) : (
          <p className="text-sm">
            {t("Add a product by clicking the button below.")}
          </p>
        )}
      </div>
      <div
        className="w-full max-w-[700px] fixed bottom-[90px] md:bottom-[20px] h-[50px] border-t-[1px] md:border-[1px] border-gray-600 p-2 bg-green-700 text-white md:rounded-md"
        onClick={() => {
          router.push(`/${lng}/products/new-product`);
        }}
      >
        <span className="text-2xl">+ {t("Add product")}</span>
      </div>
    </main>
  );
}
