import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import {ProcessAlertValue} from "../components/ProcessAlert"; // Changed to navigate out of assumed src/Components
import {useThemeContext} from "./ThemeContext";
import {fetchReasons, ReasonType, ReasonValue,} from "../Assets/Reasons";
import {useTranslation} from "react-i18next";
import {UpdateLineParameters, UpdateLineReturnValue} from "../Assets/Common";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming this is the correct path
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface ProcessCancelRef {
    show: (show: boolean) => void;
}

// Define a type for the Dialog's ref if needed, though shadcn Dialog doesn't typically use a direct ref for show/hide
// For controlling visibility, we'll use the `open` prop and `onOpenChange` callback.
// The `show` method in useImperativeHandle will manage an internal state for this.

export interface ProcessCancelProps {
    id: number;
    alert: ProcessAlertValue | null;
    supervisorPassword?: boolean;
    reasonType: ReasonType;
    onAccept: (comment: string, cancel: boolean) => void;
    updateLine: (parameters: UpdateLineParameters) => Promise<UpdateLineReturnValue>;
    updateComplete?: () => void;
}

const ProcessCancel = forwardRef((props: ProcessCancelProps, ref) => {
    const {t} = useTranslation();
    const {setLoading, setError} = useThemeContext();
    const [comment, setComment] = useState(props.alert?.comment || "");
    const [userName, setUserName] = useState("");
    const [reason, setReason] = useState<ReasonValue | null>(null);
    const [reasons, setReasons] = useState<ReasonValue[]>([]);
    const usernameRef = useRef<HTMLInputElement>(null); // Changed to HTMLInputElement
    const [isOpen, setIsOpen] = useState(false); // State to control dialog visibility

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        props.updateLine({
            id: props.id,
            lineID: props.alert?.lineID ?? -1,
            comment: comment,
            userName: userName,
            reason: reason?.value ?? -1,
        })
            .then((value) => {
                let message: string | null = null;
                switch (value) {
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
                }
                if (message !== null) {
                    setError(message);
                    setUserName("");
                    setLoading(false);
                    setTimeout(() => usernameRef.current?.focus(), 100);
                    return;
                }
                props.onAccept(comment, true);
                setIsOpen(false); // Close dialog
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
            if (showFlag) {
                setComment(props.alert?.comment || ""); // Reset comment based on alert
                setReason(null);
                setUserName("");
                setLoading(true);
                fetchReasons(props.reasonType)
                    .then((fetchedReasons) => {
                        setReasons(fetchedReasons);
                        setIsOpen(true); // Open dialog
                    })
                    .catch((error) => {
                        setError(error);
                    })
                    .finally(() => setLoading(false));
            } else {
                setIsOpen(false); // Close dialog
            }
        }
    }));

    const handleReasonChange = (value: string) => {
        const selectedReason = reasons.find(r => r.value.toString() === value);
        setReason(selectedReason || null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("cancel")}</DialogTitle>
                    {props.alert?.barcode &&
                        <DialogDescription>
                            <strong>{t("barcode")}: </strong>{props.alert?.barcode}
                        </DialogDescription>
                    }
                    <DialogDescription>
                        <strong>{t("item")}: </strong>{props.alert?.itemCode}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="comment">{t("comment")}</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                            rows={3}
                            className="w-full"
                        />
                    </div>
                    {(props.supervisorPassword??false) &&
                        <div className="space-y-2">
                            <Label htmlFor="supervisorCode">{t("supervisorCode")}</Label>
                            <Input
                                required
                                id="supervisorCode"
                                name="username"
                                ref={usernameRef}
                                type="password"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    }
                    <div className="space-y-2">
                        <Label htmlFor="reason">{t("reason")}</Label>
                        <Select
                            value={reason?.value?.toString() || ""}
                            onValueChange={handleReasonChange}
                        >
                            <SelectTrigger id="reason" className="w-full">
                                <SelectValue placeholder={t("selectReason")} />
                            </SelectTrigger>
                            <SelectContent>
                                {reasons.map((r) => (
                                    <SelectItem key={r.value} value={r.value.toString()}>
                                        {r.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
export default ProcessCancel;
