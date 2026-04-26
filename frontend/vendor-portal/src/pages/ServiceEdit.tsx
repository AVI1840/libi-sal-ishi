import { ArrowRight, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { VendorLayout } from "../components/VendorLayout";
import { useApp } from "../contexts/AppContext";

const CATEGORIES = [
  { value: "physiotherapy", label: "פיזיותרפיה" },
  { value: "nursing",       label: "סיעוד" },
  { value: "social",        label: "פעילות חברתית" },
  { value: "wellness",      label: "רווחה" },
  { value: "medical",       label: "שירותי רפואה" },
  { value: "other",         label: "אחר" },
];

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label}{required && <span className="text-destructive mr-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

export default function ServiceEdit() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { services, addService, updateService, vendor } = useApp();

  const existing = serviceId ? services.find((s) => s.id === serviceId) : null;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    title:           existing?.title           || "",
    description:     existing?.description     || "",
    category:        existing?.category        || "wellness",
    unitCost:        existing?.unitCost        || 2,
    durationMinutes: existing?.durationMinutes || 60,
    minNursingLevel: existing?.minNursingLevel || 1,
    maxNursingLevel: existing?.maxNursingLevel || 6,
    isOptimalAging:  existing?.isOptimalAging  || false,
    isActive:        existing?.isActive        ?? true,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("נא להזין שם שירות"); return; }
    if (isEdit) {
      updateService(serviceId!, form);
      toast.success("השירות עודכן בהצלחה");
    } else {
      addService({ ...form, vendorId: vendor.id, vendorName: vendor.name });
      toast.success("השירות נוצר בהצלחה");
    }
    navigate("/services");
  };

  return (
    <VendorLayout
      title={isEdit ? "עריכת שירות" : "שירות חדש"}
      subtitle={isEdit ? "עדכן את פרטי השירות" : "הוסף שירות חדש לקטלוג"}
      actions={
        <button onClick={() => navigate("/services")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-4 h-4" /> חזרה
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

        {/* Basic info */}
        <div className="libi-card p-6 space-y-5">
          <h3 className="text-base font-semibold text-foreground">פרטי השירות</h3>
          <Field label="שם השירות" required>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="לדוגמה: פיזיותרפיה בבית" className={inputCls} />
          </Field>
          <Field label="תיאור">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="תאר את השירות…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none transition-colors"
            />
          </Field>
          <Field label="קטגוריה">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={selectCls}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
        </div>

        {/* Pricing */}
        <div className="libi-card p-6 space-y-5">
          <h3 className="text-base font-semibold text-foreground">תמחור ומשך</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="עלות ביחידות" required>
              <input type="number" min="1" value={form.unitCost} onChange={(e) => set("unitCost", parseInt(e.target.value) || 1)} className={inputCls} />
              <p className="text-xs text-muted-foreground mt-1">≈ {form.unitCost * 120} ₪</p>
            </Field>
            <Field label="משך (דקות)">
              <input type="number" min="15" step="15" value={form.durationMinutes} onChange={(e) => set("durationMinutes", parseInt(e.target.value) || 60)} className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Eligibility */}
        <div className="libi-card p-6 space-y-5">
          <h3 className="text-base font-semibold text-foreground">זכאות</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="רמת סיעוד מינימלית">
              <select value={form.minNursingLevel} onChange={(e) => set("minNursingLevel", parseInt(e.target.value))} className={selectCls}>
                {[1,2,3,4,5,6].map((l) => <option key={l} value={l}>רמה {l}</option>)}
              </select>
            </Field>
            <Field label="רמת סיעוד מקסימלית">
              <select value={form.maxNursingLevel} onChange={(e) => set("maxNursingLevel", parseInt(e.target.value))} className={selectCls}>
                {[1,2,3,4,5,6].map((l) => <option key={l} value={l}>רמה {l}</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-start gap-3 p-4 rounded-xl bg-success-soft/40 border border-success/20 cursor-pointer hover:bg-success-soft/60 transition-colors">
            <input type="checkbox" checked={form.isOptimalAging} onChange={(e) => set("isOptimalAging", e.target.checked)} className="w-4 h-4 mt-0.5 accent-primary" />
            <div>
              <div className="font-medium text-foreground text-sm">שירות הזדקנות מיטבית</div>
              <div className="text-xs text-muted-foreground mt-0.5">שירות זה עונה על דרישות יחידות הרווחה החובה</div>
            </div>
          </label>
        </div>

        {/* Status */}
        <div className="libi-card p-6">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-medium text-foreground">סטטוס שירות</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {form.isActive ? "השירות מוצג ללקוחות" : "השירות מוסתר מהקטלוג"}
              </div>
            </div>
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-5 h-5 accent-primary" />
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" className="flex items-center gap-2 px-5 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors">
            <Save className="w-4 h-4" />
            {isEdit ? "שמור שינויים" : "צור שירות"}
          </button>
          <button type="button" onClick={() => navigate("/services")} className="px-5 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            ביטול
          </button>
        </div>
      </form>
    </VendorLayout>
  );
}
