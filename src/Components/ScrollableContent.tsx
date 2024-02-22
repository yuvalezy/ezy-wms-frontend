export const ScrollableContent: React.FC<{ children: React.ReactNode }> = ({children}) => {
    return (
        <div className="themeContentStyle">
            <div className="containerStyle">
                {children}
            </div>
        </div>
    );
}