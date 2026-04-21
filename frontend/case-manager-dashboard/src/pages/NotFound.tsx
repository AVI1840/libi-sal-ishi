import { Button } from "@libi/shared-ui/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">הדף שחיפשת לא נמצא</p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            חזרה לדף הבית
          </Button>
        </Link>
      </div>
    </div>
  );
}
