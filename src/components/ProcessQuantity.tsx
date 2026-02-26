import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import {ProcessAlertValue} from "@/components/ProcessAlert";
import {useTranslation} from "react-i18next";
import {UnitType, UpdateLineParameters, UpdateLineReturnValue} from "@/features/shared/data/shared";
import {useThemeContext} from "./ThemeContext";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {useAuth} from "@/components";
import {parseQuantity, getQuantityStep} from "@/utils/quantity-utils";

export interface ProcessQuantityRef {
  show: (show: boolean) => void;
}

export interface ProcessQuantityProps {
  id: string;
  alert: ProcessAlertValue | null;
  supervisorPassword?: boolean;
  onAccept: (quantity: number) => void;
  updateLine: (parameters: UpdateLineParameters) => Promise<{returnValue: UpdateLineReturnValue, errorMessage?: string}>;
  updateComplete?: () => void;
}

const ProcessQuantity = forwardRef((props: ProcessQuantityProps, ref) => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const {user} = useAuth();
  const [userName, setUserName] = useState("");
  const [quantity, setQuantity] = useState<number>(props.alert?.quantity ?? 1);
  const quantityRef = useRef<HTMLInputElement>(null); // Changed to HTMLInputElement
  const [isOpen, setIsOpen] = useState(false);
  const enableDecimals = user?.settings?.enableDecimalQuantities ?? false;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (props.alert?.lineId == null) {
      throw new Error("Line ID is not defined");
    }
    props.updateLine({
      id: props.id,
      lineId: props.alert.lineId,
      quantity: quantity,
      userName: userName,
    })
      .then((value) => {
        let message: string | null = null;
        switch (value.returnValue) {
          case UpdateLineReturnValue.Status:
            message = t("updateLineStatusError");
            break;
          case UpdateLineReturnValue.LineStatus:
            message = t("updateLineLineStatusError");
            break;
          case UpdateLineReturnValue.CloseReason:
            message = t("updateLineReason");
            break;
          case UpdateLineReturnValue.SupervisorPassword:
            message = t("updateLineWrongSupervisorPassword");
            break;
          case UpdateLineReturnValue.NotSupervisor:
            message = t("updateLineNotSupervisorError");
            break;
          case UpdateLineReturnValue.QuantityMoreThenAvailable:
            message = t("updateLineQuantityMoreThenAvailableError");
            break;
        }
        if (message !== null) {
          setError(message);
          setUserName("");
          setLoading(false);
          setTimeout(() => quantityRef.current?.focus(), 100);
          return;
        }

        props.onAccept(quantity);
        setIsOpen(false);
        if (props.updateComplete == null) {
          setLoading(false);
        } else {
          props.updateComplete();
        }
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }

  useImperativeHandle(ref, () => ({
    show(showFlag: boolean) {
      setQuantity(props.alert?.quantity ?? 1);
      setUserName(""); // Reset supervisor code
      setIsOpen(showFlag);
      if (showFlag) {
        setTimeout(() => quantityRef.current?.focus(), 0);
      }
    }
  }));
  const displayUnit = props.alert?.unit === UnitType.Unit ? t('unit') :
    props.alert?.unit === UnitType.Dozen ? (props.alert?.buyUnitMsr || t("qtyInUn")) :
      (props.alert?.purPackMsr || t('packUn'));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("quantity")}</DialogTitle>
        </DialogHeader>
        <SecondaryInfoBox>
          {props.alert?.barcode && <InfoBoxValue label={t("barcode")} value={props.alert?.barcode}/>}
          <InfoBoxValue label={t("item")} value={props.alert?.itemCode}/>
          {props.alert?.unit && <InfoBoxValue label={t("unit")} value={displayUnit}/>}
        </SecondaryInfoBox>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {props.supervisorPassword &&
              <div className="space-y-2">
                  <Label htmlFor="supervisorCodeQty">{t("supervisorCode")}</Label>
                  <Input
                      required
                      id="supervisorCodeQty"
                      name="username"
                      type="password"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full"
                  />
              </div>
          }
          <div className="space-y-2">
            <Label htmlFor="quantityInput">{t("quantity")}</Label>
            <Input
              required
              id="quantityInput"
              name="quantity"
              ref={quantityRef}
              type="number"
              step={getQuantityStep(enableDecimals)}
              min="0"
              value={quantity?.toString()}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val === "" ? 0 : parseQuantity(val, enableDecimals));
              }}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit">
              {t("accept")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
export default ProcessQuantity;
