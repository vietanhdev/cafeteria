import useSWR, { useSWRConfig } from "swr";

export function useGetCommonSettings(settingSet = "common") {
  let settings = {};
  if (typeof window !== "undefined") {
    settings = JSON.parse(localStorage.getItem("commonSettings", "{}"));
  }

  const { fetcher } = useSWRConfig();
  let { data, error, mutate } = useSWR(`/api/settings/${settingSet}`, fetcher);
  if (data) {
    if (typeof window !== "undefined") {
      localStorage.setItem("commonSettings", JSON.stringify(data.data));
    }
  }
  const mutateSettings = function (settings, options) {
    mutate({ ...data, data: settings }, options);
  };

  return {
    data: data?.data,
    error,
    mutateSettings,
  };
}

export async function UpdateCommonSettings(settingSet, newSettingData) {
  const response = await fetch(`/api/settings/${settingSet}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newSettingData),
  });

  const data = await response.json();
  return data;
}
