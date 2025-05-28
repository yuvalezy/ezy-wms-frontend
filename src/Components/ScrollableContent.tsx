import React, {CSSProperties} from "react";

export const ScrollableContent: React.FC<{ children: React.ReactNode }> = ({children}) => {
    return (
        <div className="themeContentStyle">
            <div className="containerStyle">
                {children}
            </div>
        </div>
    );
}
export const ScrollableContentBox: React.FC<{ children: React.ReactNode, borderUp?: boolean }> = ({children, borderUp}) => {
    function getContentStyle(): CSSProperties {
        let properties: CSSProperties = {
            borderBottom: '1px solid darkGrey'
        };
        if (borderUp) {
            properties.borderTop = '1px solid darkGrey'
        }
        return properties
    }
    return (
        <div className="contentStyle" style={getContentStyle()}>
            {children}
        </div>
    )
        ;
}
