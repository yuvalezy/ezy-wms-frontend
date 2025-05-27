import React, {useEffect} from "react";
import ContentThemeSapUI5 from "../../components/ContentThemeSapUI5";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "../../Components/ThemeContext";
import {fetchPickings, PickingDocument, PickStatus} from "./Data/PickingDocument";
import PickingCard from "./Components/PickingCard";

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
    <ContentThemeSapUI5 title={t("picking")} icon="cause">
      {pickings.map((pick) => (
        <PickingCard key={pick.entry} picking={pick}/>
      ))}
    </ContentThemeSapUI5>
  );

}
