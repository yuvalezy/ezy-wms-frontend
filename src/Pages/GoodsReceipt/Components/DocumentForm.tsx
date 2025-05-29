import React, {useEffect, useRef, useState} from "react";
import {createDocument, GoodsReceiptType} from "@/pages/GoodsReceipt/data/Document";
import {useThemeContext} from "@/components/ThemeContext";
import DocumentList, {DocumentListRef} from "@/pages/GoodsReceipt/components/DocumentList";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {PlusCircle} from "lucide-react"; // Icon for create button

import {useObjectName} from "@/assets/ObjectName";
import {Document, DocumentItem} from "@/assets/Document";
import {BusinessPartner, fetchVendors} from "@/assets/Data";
import {StringFormat} from "@/assets/Functions";
import {Card} from "@/components";

interface DocumentFormProps {
  onNewDocument: (document: Document) => void,
  confirm: boolean
}

const DocumentForm: React.FC<DocumentFormProps> = ({onNewDocument, confirm}) => {
  const {t} = useTranslation();
  const o = useObjectName();
  const {setLoading, setError} = useThemeContext();
  const documentListRef = useRef<DocumentListRef>(null); // Keep as is for DocumentList

  // Use string values for TabsTrigger, matching GoodsReceiptType enum keys for clarity
  const TAB_AUTOCONFIRM = GoodsReceiptType.AutoConfirm.toString();
  const TAB_SPECIFICORDERS = GoodsReceiptType.SpecificOrders.toString();

  const [activeTab, setActiveTab] = useState<string>(TAB_SPECIFICORDERS);
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [cardCodeInput, setCardCodeInput] = useState<string>("");
  const [docNameInput, setDocNameInput] = useState<string>("");
  const [vendors, setVendors] = useState<BusinessPartner[]>([]);

  useEffect(() => {
    fetchVendors()
      .then((data) => setVendors(data))
      .catch((error) => setError(error));
  }, [setError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedType = activeTab === TAB_AUTOCONFIRM ? GoodsReceiptType.AutoConfirm :
      !confirm ? GoodsReceiptType.SpecificOrders : GoodsReceiptType.SpecificReceipts;

    // Validation logic (can be enhanced with react-hook-form later if needed)
    // if (docNameInput.trim() === "") {
    //     setError(t("idRequired")); // Example: use setError for alerts
    //     return;
    // }
    switch (selectedType) {
      case GoodsReceiptType.AutoConfirm:
        // if (cardCodeInput.trim() === "") {
        //     setError(t("vendorRequired"));
        //     return;
        // }
        break;
      case GoodsReceiptType.SpecificOrders:
      case GoodsReceiptType.SpecificReceipts:
        if (items.length === 0) {
          setError(t("documentRequired"));
          return;
        }
        break;
    }

    setLoading(true);
    createDocument(selectedType, cardCodeInput, docNameInput, items)
      .then((response) => {
        if (!response.error) {
          onNewDocument(response);
          setDocNameInput("");
          setCardCodeInput(""); // Reset vendor selection
          documentListRef.current?.clearItems();
          // Potentially switch back to the first tab or clear specific orders items
          setItems([]);
        } else {
          let errorMessage: string = t("unknownError");
          // Error handling logic (remains largely the same)
          switch (response.errorCode) {
            case -1:
              try {
                let errorParameters = response.errorParameters;
                if (errorParameters != null && errorParameters.length >= 3) {
                  let errorObjType: number = errorParameters[0];
                  let errorDocNum: number = errorParameters[1];
                  let errorType: string;
                  switch (errorParameters[2]) {
                    case "E":
                      errorType = t("doesNotExists");
                      break;
                    case "R":
                      errorType = "Not Reserved";
                      break; // Consider translating
                    case "W":
                      errorType = "No lines for warehouse";
                      break; // Consider translating
                    default:
                      errorType = t("isNotOpen");
                      break;
                  }
                  errorMessage = StringFormat(t("badDocumentError"), o(errorObjType), errorDocNum, errorType);
                }
              } catch {
              }
              break;
          }
          setError(errorMessage);
        }
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  const renderSpecificOrders = () => {
    return <form onSubmit={handleSubmit} className="space-y-4 pl-4 pr-4">
      <div className="space-y-2">
        <Label htmlFor="docNameSpecific">{t("id")}</Label>
        <Input
          id="docNameSpecific"
          value={docNameInput}
          onChange={(e) => setDocNameInput(e.target.value)}
          maxLength={50}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("documentsList")}</Label>
        <DocumentList ref={documentListRef} confirm={confirm} onItemsUpdate={setItems}/>
      </div>
      <div>
        <Button type="submit">
          <PlusCircle className="mr-2 h-4 w-4"/> {t("create")}
        </Button>
      </div>
    </form>
  }

  if (confirm)
    return <Card>
      {renderSpecificOrders()}
    </Card>;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value={TAB_SPECIFICORDERS}>{t("specificDocuments")}</TabsTrigger>
        <TabsTrigger value={TAB_AUTOCONFIRM}>{t("automatic")}</TabsTrigger>
      </TabsList>

      <TabsContent value={TAB_AUTOCONFIRM}>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="docNameAuto">{t("id")}</Label>
            <Input
              id="docNameAuto"
              value={docNameInput}
              onChange={(e) => setDocNameInput(e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendorSelect">{t("selectVendor")}</Label>
            <Select value={cardCodeInput} onValueChange={setCardCodeInput}>
              <SelectTrigger id="vendorSelect">
                <SelectValue placeholder={t("selectVendorPlaceholder")}/>
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.code} value={vendor.code}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button type="submit">
              <PlusCircle className="mr-2 h-4 w-4"/> {t("create")}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value={TAB_SPECIFICORDERS}>
        {renderSpecificOrders()}
      </TabsContent>
    </Tabs>
  );
};

export default DocumentForm;
