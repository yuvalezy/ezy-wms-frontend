import React, {useEffect, useState} from "react";
import ContentTheme from "@/components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {fetchCountings} from "@/pages/Counting/data/Counting";
import {Counting} from "@/assets/Counting";
import CountingCard from "@/pages/Counting/components/CountingCard";
import CountingTable from "@/pages/Counting/components/CountingTable";
import {Alert, AlertDescription} from "@/components";
import {AlertCircle} from "lucide-react";

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
    <ContentTheme title={t("counting")}>
      {data.length ? (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {data.map((doc) => (
              <CountingCard key={doc.id} doc={doc}/>
            ))}
          </div>
          
          {/* Desktop view - Table */}
          <div className="hidden sm:block">
            <CountingTable countings={data} />
          </div>
        </>
      ) : (
        <Alert variant="information">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>
            {t("noCountingData")}
          </AlertDescription>
        </Alert>
      )}
    </ContentTheme>
  );
}
