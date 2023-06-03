import { useState, useEffect } from "react";
import { useTranslation } from "@/app/i18n/client";
import { GetStores } from "@/lib/requests/stores";

// Component for picking delivery address
export default function AddressPicker({
  lng,
  addressOptions,
  defaultAddress,
  setAddressCb,
  setStoreIdCb,
}) {
  const { t } = useTranslation(lng, "common");
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress);
  const selectedOption =
    addressOptions.find((option) => option === selectedAddress) || null;

  const [stores, setStores] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    GetStores(
      (data) => {
        setStores(data);
        if (data) {
          setSelectedStore(data[0].id);
          setStoreIdCb(data[0].id);
        }
      },
      (e) => {
        console.log(e);
        alert("Could not get stores");
      }
    );
  }, []);

  if (!stores) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        <div className="text-md clickable">{t("Loading data...")}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="text-md clickable font-bold">{t("Pick a store:")}</div>
      {stores.map((store, index) => (
        <div key={index} className="w-full p-2 border-b-[1px] ">
          <input
            type="radio"
            name="select_store"
            checked={selectedStore === store.id}
            onChange={() => {
              setSelectedStore(store.id);
              setStoreIdCb(store.id);
            }}
          />
          <label className="pl-2 w-100" htmlFor={store.name}>
            {t(store.name)}
          </label>
        </div>
      ))}
      <div className="text-md clickable font-bold">
        {t("Pick a delivery address:")}
      </div>
      {addressOptions.map((option, index) => (
        <div key={index} className="w-full p-2 border-b-[1px] ">
          <input
            type="radio"
            name="select_address"
            checked={selectedAddress === option}
            onChange={() => {
              setSelectedAddress(option);
              setAddressCb(option);
            }}
          />
          <label className="pl-2 w-100" htmlFor={option}>
            {t(option)}
          </label>
        </div>
      ))}
      <div className="w-full p-2 border-b-[1px] ">
        <input
          key={addressOptions.length}
          type="radio"
          name="select_address"
          checked={selectedOption === null}
          onChange={(e) => {
            setSelectedAddress(null);
            setAddressCb(null);
          }}
        />
        <label className="pl-2 w-100">{t("Deliver to my address")}</label>
      </div>
      {/* Input area to type address */}
      {selectedOption === null && (
        <div className="flex flex-col gap-2 mt-4">
          <div className="text-md clickable font-bold">
            {t("Type your address:")}
          </div>
          <input
            type="text"
            className="w-full p-2 border-b-[1px] "
            placeholder={t("Address")}
            defaultValue={defaultAddress}
            onChange={(e) => {
              setSelectedAddress(e.target.value);
              setAddressCb(e.target.value);
            }}
          />
        </div>
      )}
    </div>
  );
}