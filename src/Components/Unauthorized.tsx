import logo from "../logo.svg";
import React from "react";
import { Link } from 'react-router-dom';
import ContentTheme from "@/components/ContentTheme";
import { AlertCircle } from "lucide-react"; // For an icon

export default function Unauthorized() {
    return (
        <ContentTheme title="Unauthorized">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md flex flex-col items-center text-center" role="alert">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <img src={logo} className="App-logo h-20 w-20 mb-4" alt="logo"/> {/* Adjusted size */}
                <p className="font-semibold text-lg mb-2">
                    Oops! You're not authorized to view this page.
                </p>
                <Link className="App-link text-red-700 hover:text-red-900 font-medium underline" to="/">Return to Home</Link>
            </div>
        </ContentTheme>
    )
}
