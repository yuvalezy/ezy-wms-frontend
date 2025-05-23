import React, {useEffect, useState} from "react";
import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "../../Components/ThemeContext";
import {fetchCountings} from "./Data/Counting";
import {Counting} from "../../Assets/Counting";
import CountingCard from "./Components/CountingCard";

export default function CountingList() {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const [data, setData] = useState<Counting[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchCountings()
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [setError, setLoading]);

  return (
    <ContentTheme title={t("counting")} icon="product">
      {data.map((doc) => (
        <CountingCard key={doc.id} doc={doc}/>
      ))}
    </ContentTheme>
  );
}
