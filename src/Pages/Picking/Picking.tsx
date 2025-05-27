import React, {useEffect} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "../../components/ThemeContext";
import {fetchPickings, PickingDocument, PickStatus} from "./Data/PickingDocument";
import PickingCard from "./components/PickingCard";

export default function Picking() {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const [pickings, setPickings] = React.useState<PickingDocument[]>([]);


  useEffect(() => {
    setLoading(true);
    fetchPickings({status: [PickStatus.Released]})
      .then((data) => setPickings(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [setError, setLoading]);


    return (
        <ContentTheme title={t("picking")}>
            <div className="my-4">
                {pickings.map((pick) => (
                    <PickingCard key={pick.entry} picking={pick}/>
                ))}
            </div>
        </ContentTheme>
    );

}
