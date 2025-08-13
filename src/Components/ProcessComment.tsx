import React, {useState, forwardRef, useImperativeHandle} from "react";
import {ProcessAlertValue} from "@/components/ProcessAlert";
import {useThemeContext} from "./ThemeContext";
import {useTranslation} from "react-i18next";
import {UpdateLineParameters, UpdateLineReturnValue} from "@/features/shared/data";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ProcessCommentSkeleton from "@/components/skeletons/ProcessCommentSkeleton";

export interface ProcessCommentRef {
    show: (show: boolean) => void;
}

export interface ProcessCommentProps {
    id: string;
    alert?: ProcessAlertValue | null;
    onAccept: (comment: string) => void;
    updateLine: (parameters: UpdateLineParameters) => Promise<{returnValue: UpdateLineReturnValue, errorMessage?: string}>;
    updateComplete?: () => void;
}

const ProcessComment = forwardRef((props: ProcessCommentProps, ref) => {
    const {t} = useTranslation();
    const {setError} =  useThemeContext();
    const [comment, setComment] = useState(props.alert?.comment || "");
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        if (props.alert?.lineId == null) {
            throw new Error("Line ID is not defined");
        }
        props.updateLine({
            id: props.id,
            lineId: props.alert.lineId,
            comment: comment,
        })
            .then((_) => {
                props.onAccept(comment);
                setIsOpen(false);
                if (props.updateComplete == null) {
                    setIsSaving(false);
                } else {
                    props.updateComplete();
                }
            })
            .catch((error) => {
                setError(error);
                setIsSaving(false);
            });
    };

    useImperativeHandle(ref, () => ({
        show(showFlag: boolean) {
            setComment(props.alert?.comment || ""); // Reset comment based on alert
            setIsOpen(showFlag);
        }
    }));

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("comment")}</DialogTitle>
                    {props.alert?.barcode &&
                        <DialogDescription>
                            <strong>{t("barcode")}: </strong>{props.alert?.barcode}
                        </DialogDescription>
                    }
                </DialogHeader>
                
                {isSaving ? (
                    <ProcessCommentSkeleton />
                ) : (
                    <>
                        <div className="space-y-2 py-4">
                            <Label htmlFor="commentArea">{t("comment")}</Label>
                            <Textarea
                                id="commentArea"
                                value={comment}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                                rows={5}
                                className="w-full"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                {t("cancel")}
                            </Button>
                            <Button type="button" onClick={handleSave}>
                                {t("accept")}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
});
export default ProcessComment;
