import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f0f4f4] to-white p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-amber-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-[#0B2E2A] mb-2">404</h1>
        <h2 className="text-2xl font-bold text-[#0B2E2A] mb-2">Page Not Found</h2>
        <p className="text-[#0B2E2A]/50 mb-6">
          The page you're looking for could not be found in this application.
        </p>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}