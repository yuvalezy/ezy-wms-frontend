import {AlertActionType, ProcessAlertValue} from "@/components/ProcessAlert";
import ProcessCancel, {ProcessCancelRef} from "@/components/ProcessCancel";
import ProcessQuantity, {ProcessQuantityRef} from "@/components/ProcessQuantity";
import ProcessComment, {ProcessCommentRef} from "@/components/ProcessComment";
import React, {forwardRef, useImperativeHandle, useRef} from "react";
import {ReasonType, UpdateLineParameters, UpdateLineReturnValue} from "@/assets";

export interface ProcessesRef {
    open: (type: AlertActionType) => void;
}

export interface ProcessesProps {
    id: string;
    alert: ProcessAlertValue | null;
    reasonType: ReasonType
    supervisorPassword?: boolean;
    onCancel?: (comment: string, cancel: boolean) => void;
    onCommentsChanged?: (comment: string) => void;
    onQuantityChanged?: (quantity: number) => void;
    onUpdateLine: (parameters: UpdateLineParameters) => Promise<{returnValue: UpdateLineReturnValue, errorMessage?: string}>;
    onUpdateComplete?: () => void;
}

const Processes = forwardRef((props: ProcessesProps, ref) => {
    const processCancelRef = useRef<ProcessCancelRef>(null);
    const processQuantityRef = useRef<ProcessQuantityRef>(null);
    const processCommentRef = useRef<ProcessCommentRef>(null);

    useImperativeHandle(ref, () => ({
        open: (type: AlertActionType) => {
            switch (type) {
                case AlertActionType.Cancel:
                    processCancelRef?.current?.show(true);
                    break;
                case AlertActionType.Quantity:
                    processQuantityRef?.current?.show(true);
                    break;
                case AlertActionType.Comments:
                    processCommentRef?.current?.show(true);
                    break;
            }
        }
    }));

    return <>
        {props.onCancel && <ProcessCancel id={props.id} alert={props.alert} ref={processCancelRef} supervisorPassword={props.supervisorPassword} onAccept={props.onCancel} reasonType={props.reasonType} updateLine={props.onUpdateLine} updateComplete={props.onUpdateComplete}/> }
        {props.onQuantityChanged && <ProcessQuantity id={props.id} alert={props.alert} ref={processQuantityRef} supervisorPassword={props.supervisorPassword} onAccept={props.onQuantityChanged} updateLine={props.onUpdateLine} updateComplete={props.onUpdateComplete}/>}
        {props.onCommentsChanged && <ProcessComment id={props.id} alert={props.alert} ref={processCommentRef} onAccept={props.onCommentsChanged} updateLine={props.onUpdateLine} updateComplete={props.onUpdateComplete}/>}
    </>
})

export default Processes;
