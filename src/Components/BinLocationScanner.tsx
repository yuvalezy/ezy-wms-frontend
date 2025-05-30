import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "./ThemeContext";
import {BinLocation, scanBinLocation, StringFormat} from "@/assets";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons';

export interface BinLocationScannerProps {
  label?: string | boolean;
  showLabel?: boolean
  onScan?: (bin: BinLocation) => void;
  onChanged?: (bin: BinLocation) => void;
  onClear?: () => void;
}

export interface BinLocationScannerRef {
  focus: () => void;
  clear: () => void;
  getBin: () => string;
}

const BinLocationScanner = forwardRef<BinLocationScannerRef, BinLocationScannerProps>((
  {
    onScan,
    onChanged,
    onClear,
    label,
    showLabel = true
  }, ref) => {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const binRef = useRef<HTMLInputElement>(null);
  const [binInput, setBinInput] = useState('');
  const [binLocation, setBinLocation] = useState<BinLocation | null>(null);

  useImperativeHandle(ref, () => ({
    focus() {
      binRef?.current?.focus();
    },
    clear() {
      clear();
    },
    getBin() {
      return binInput;
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (binInput.length === 0) {
      return;
    }
    setLoading(true);
    try {
      scanBinLocation(binInput)
        .then((v) => {
          if (v == null) {
            setError(StringFormat(t(`binLocationNotFound`), binInput));
            setBinInput('');
            setLoading(false);
            return;
          }
          if (onChanged) {
            setBinLocation(v);
            onChanged(v);
          }
          if (onScan) {
            onScan(v);
          }
        })
        .catch((e) => {
          setError(e);
          setLoading(false);
        })
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  };

  function clear() {
    setBinInput('');
    setBinLocation(null);
    if (onClear)
      onClear();
    binRef?.current?.focus();
  }

  return (
    <div>
      {binLocation &&
        // Responsive layout for displaying selected bin and change button
          <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-300 truncate">
                      {t("bin")}: {binLocation.code}
                  </span>
              <Button variant="outline" size="sm" onClick={clear} className="w-full sm:w-auto shrink-0">
                {t("changeBinLocation")}
              </Button>
          </div>
      }
      {!binLocation &&
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                {showLabel && <Label htmlFor="bin-input">{label ?? t("bin")}</Label>}
                  <Input
                      id="bin-input"
                      value={binInput}
                      ref={binRef}
                      onChange={(e) => setBinInput(e.target.value)}
                      placeholder={t("scanBinLocation")} maxLength={255}
                  />
              </div>
              <Button type="submit" className="w-full">
                  <FontAwesomeIcon icon={faCheck} className="mr-2"/>
                {t("accept")}
              </Button>
          </form>
      }
    </div>
  );
});

export default BinLocationScanner;
