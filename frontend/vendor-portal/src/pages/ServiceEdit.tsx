import { Button } from "@libi/shared-ui/components/ui/button";
import { Input } from "@libi/shared-ui/components/ui/input";
import { ArrowRight, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

export default function ServiceEdit() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { services, addService, updateService, vendor } = useApp();

  const existingService = serviceId ? services.find((s) => s.id === serviceId) : null;
  const isEditing = !!existingService;

  const [form, setForm] = useState({
    title: existingService?.title || "",
    description: existingService?.description || "",
    category: existingService?.category || "wellness",
    unitCost: existingService?.unitCost || 2,
    durationMinutes: existingService?.durationMinutes || 60,
    minNursingLevel: existingService?.minNursingLevel || 1,
    maxNursingLevel: existingService?.maxNursingLevel || 6,
    isOptimalAging: existingService?.isOptimalAging || false,
    isActive: existingService?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("נא להזין שם שירות");
      return;
    }

    if (isEditing) {
      updateService(serviceId!, form);
      toast.success("השירות עודכן בהצלחה");
    } else {
      addService({
        ...form,
        vendorId: vendor.id,
        vendorName: vendor.name,
      });
      toast.success("השירות נוצר בהצלחה");
    }

    navigate("/services");
  };

  const categories = [
    { value: "physiotherapy", label: "פיזיותרפיה" },
    { value: "nursing", label: "סיעוד" },
    { value: "social", label: "פעילות חברתית" },
    { value: "wellness", label: "רווחה" },
    { value: "medical", label: "שירותי רפואה" },
    { value: "other", label: "אחר" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/services")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "עריכת שירות" : "שירות חדש"}
          </h1>
          <p className="text-gray-500">
            {isEditing ? "עדכן את פרטי השירות" : "הוסף שירות חדש לקטלוג"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="vendor-card space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">פרטי השירות</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם השירות *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="לדוגמה: פיזיותרפיה בבית"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="תאר את השירות..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  קטגוריה
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">תמחור ומשך</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  עלות ביחידות *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={form.unitCost}
                  onChange={(e) => setForm({ ...form, unitCost: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ≈ {form.unitCost * 120} ₪
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  משך בדקות
                </label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">זכאות</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  רמת סיעוד מינימלית
                </label>
                <select
                  value={form.minNursingLevel}
                  onChange={(e) => setForm({ ...form, minNursingLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={level}>רמה {level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  רמת סיעוד מקסימלית
                </label>
                <select
                  value={form.maxNursingLevel}
                  onChange={(e) => setForm({ ...form, maxNursingLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={level}>רמה {level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <input
                type="checkbox"
                id="optimalAging"
                checked={form.isOptimalAging}
                onChange={(e) => setForm({ ...form, isOptimalAging: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="optimalAging" className="flex-1">
                <p className="font-medium text-gray-900">שירות הזדקנות מיטבית</p>
                <p className="text-sm text-gray-500">
                  שירות זה עונה על דרישות יחידות הרווחה החובה
                </p>
              </label>
            </div>
          </div>

          {/* Status */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">סטטוס שירות</p>
                <p className="text-sm text-gray-500">
                  {form.isActive ? "השירות מוצג ללקוחות" : "השירות מוסתר מהקטלוג"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <Button type="submit" className="gap-2">
            <Save className="w-4 h-4" />
            {isEditing ? "שמור שינויים" : "צור שירות"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/services")}
          >
            ביטול
          </Button>
        </div>
      </form>
    </div>
  );
}
