import {CircularProgress} from "@mui/material";
import * as React from "react";

export default function CircularProgressOverlay() {
    return (
        <div style={{
            position: 'fixed',   // Changed from relative to fixed
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,       // High z-index to ensure it's on top
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent black
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <CircularProgress/>
        </div>
    )
}
