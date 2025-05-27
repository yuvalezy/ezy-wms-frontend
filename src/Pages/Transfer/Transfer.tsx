import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "../../Components/ThemeContext";
import React, {useEffect, useRef, useState} from "react";
import {fetchTransfers, TransferDocument} from "./Data/TransferDocument";
import {Status} from "../../Assets/Common";
import TransferCard from "./Components/TransferCard";

export default function Transfer() {
    const {setLoading, setError} = useThemeContext();
    const {t} = useTranslation();
    const [transfers, setTransfers] = useState<TransferDocument[]>([]);

    useEffect(() => {
        setLoading(true);
        fetchTransfers({statuses: [Status.Open, Status.InProgress]})
            .then((data) => setTransfers(data))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, [setError, setLoading]);

    return (
        <ContentTheme title={t("transfer")}>
            <div className="my-4">
                {transfers.map((transfer, index) => (
                    <TransferCard key={transfer.id} doc={transfer}/>
                ))}
            </div>
        </ContentTheme>
    );

}
