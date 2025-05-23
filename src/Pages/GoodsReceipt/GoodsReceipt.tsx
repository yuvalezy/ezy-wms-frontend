import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import ContentTheme from "../../Components/ContentTheme";
import {fetchDocuments,} from "./Data/Document";
import {useTranslation} from "react-i18next";
import {InputDomRef} from "@ui5/webcomponents-react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useDocumentStatusToString} from "../../Assets/DocumentStatusString";
import {ObjectAction, Status} from "../../Assets/Common";
import {Document} from "../../Assets/Document";
import DocumentCard from "./Components/DocumentCard";
import DocumentListDialog, {DocumentListDialogRef} from "./Components/DocumentListDialog";

export default function GoodsReceipt() {
  const {setLoading, setAlert, setError} = useThemeContext();
  const [scanCodeInput, setScanCodeInput] = React.useState("");
  const {t} = useTranslation();
  const documentStatusToString = useDocumentStatusToString();
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const scanCodeInputRef = useRef<InputDomRef>(null);
  const [documents, setDocuments] = useState<Document[] | null>(null);

  useEffect(() => {
    setTimeout(() => scanCodeInputRef?.current?.focus(), 1);
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchDocuments({status: [Status.Open, Status.InProgress]})
      .then((data) => setDocuments(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, []);

  // function handleSubmit(e: React.FormEvent) {
  //     e.preventDefault();
  //     if (scanCodeInput.length === 0) {
  //         setAlert({message: t("scanCodeRequired"), type: MessageStripDesign.Warning});
  //         return;
  //     }
  //     let checkScan = scanCodeInput.split("_");
  //     if (
  //         checkScan.length !== 2 ||
  //         (checkScan[0] !== "GRPO" && checkScan[0] !== "$GRPO") ||
  //         !IsNumeric(checkScan[1])
  //     ) {
  //         setAlert({message: t("invalidScanCode"), type: MessageStripDesign.Warning});
  //         return;
  //     }
  //     const id = parseInt(checkScan[1]);
  //     setLoading(true);
  //     fetchDocuments({id, status: []})
  //         .then((doc) => {
  //             if (doc.length === 0) {
  //                 setAlert({message: StringFormat(t("goodsReceiptNotFound"), id), type: MessageStripDesign.Warning});
  //                 return;
  //             }
  //             const status = doc[0].status;
  //
  //             if (status !== Status.Open && status !== Status.InProgress) {
  //                 setAlert({message: StringFormat(
  //                     t("goodsReceiptStatusError"),
  //                     id,
  //                     documentStatusToString(status)
  //                   ), type: MessageStripDesign.Warning});
  //                 return;
  //             }
  //             navigate(`/goodsReceipt/${id}`);
  //         })
  //         .catch((error) => setError(error))
  //         .finally(() => setLoading(false));
  // }
  const handleAction = (docId: number, action: ObjectAction) => {
    // setSelectedDocumentId(docId);
    // setActionType(action);
    // if (action !== "qrcode") {
    //   setDialogOpen(true);
    // } else {
    //   qrRef?.current?.show(true);
    // }
  };
  function handleDocDetails(doc: Document) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  return (
    <ContentTheme title={t("goodsReceipt")} icon="cause">
      {documents?.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} action={handleAction} docDetails={handleDocDetails}/>
      ))}
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentTheme>
  );

  // function ScanForm() {
  //     return (
  //         <Form onSubmit={handleSubmit}>
  //             <FormItem label={t("code")}>
  //                 <Input
  //                     value={scanCodeInput}
  //                     type="Password"
  //                     ref={scanCodeInputRef}
  //                     required
  //                     onInput={(e) => setScanCodeInput(e.target.value as string)}
  //                 />
  //             </FormItem>
  //             <FormItem>
  //                 <Button type="Submit" icon="accept">
  //                     {t("accept")}
  //                 </Button>
  //             </FormItem>
  //         </Form>
  //     )
  // }
}
