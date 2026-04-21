import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Progress } from "@libi/shared-ui/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@libi/shared-ui/components/ui/tabs";
import { Calendar, CheckCircle2, Clock, CreditCard, Download, TrendingUp } from "lucide-react";
import { useApp } from "../contexts/AppContext";

export default function Payments() {
  const { payments, totalEarnings, pendingEarnings, bookings, services } = useApp();

  const paidPayments = payments.filter((p) => p.status === "paid");
  const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "processing");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="payment-badge paid"><CheckCircle2 className="w-3 h-3" />שולם</Badge>;
      case "pending":
        return <Badge className="payment-badge pending"><Clock className="w-3 h-3" />ממתין</Badge>;
      case "processing":
        return <Badge className="payment-badge processing"><Clock className="w-3 h-3" />בעיבוד</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate monthly breakdown
  const monthlyEarnings = paidPayments.reduce((acc, payment) => {
    const month = new Date(payment.paidAt || payment.createdAt).toLocaleDateString("he-IL", {
      month: "long",
      year: "numeric"
    });
    acc[month] = (acc[month] || 0) + payment.netAmount;
    return acc;
  }, {} as Record<string, number>);

  const totalPlatformFees = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.platformFee, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">תשלומים</h1>
          <p className="text-gray-500 mt-1">ניהול הכנסות ותשלומים</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          ייצוא דוח
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
              <p className="text-sm text-gray-500">סה"כ הכנסות</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+15% מהחודש הקודם</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingEarnings)}</p>
              <p className="text-sm text-gray-500">ממתין לתשלום</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {pendingPayments.length} תשלומים בהמתנה
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{paidPayments.length}</p>
              <p className="text-sm text-gray-500">תשלומים שהתקבלו</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            עמלות פלטפורמה: {formatCurrency(totalPlatformFees)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payments List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">הכל ({payments.length})</TabsTrigger>
              <TabsTrigger value="pending">
                ממתינים ({pendingPayments.length})
              </TabsTrigger>
              <TabsTrigger value="paid">שולמו ({paidPayments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="vendor-card">
              <div className="space-y-3">
                {payments
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((payment) => {
                    const booking = bookings.find((b) => b.id === payment.bookingId);

                    return (
                      <div
                        key={payment.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            {booking?.serviceName || "שירות"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                        <div className="text-left">
                          {getStatusBadge(payment.status)}
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {formatCurrency(payment.netAmount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="vendor-card">
              <div className="space-y-3">
                {pendingPayments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">אין תשלומים ממתינים</p>
                ) : (
                  pendingPayments.map((payment) => {
                    const booking = bookings.find((b) => b.id === payment.bookingId);

                    return (
                      <div
                        key={payment.id}
                        className="flex items-center gap-4 p-4 bg-amber-50/50 rounded-lg border border-amber-100"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white border border-amber-200 flex flex-col items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            {booking?.serviceName || "שירות"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                        <div className="text-left">
                          {getStatusBadge(payment.status)}
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {formatCurrency(payment.netAmount)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="paid" className="vendor-card">
              <div className="space-y-3">
                {paidPayments.map((payment) => {
                  const booking = bookings.find((b) => b.id === payment.bookingId);

                  return (
                    <div
                      key={payment.id}
                      className="flex items-center gap-4 p-4 bg-green-50/50 rounded-lg border border-green-100"
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border border-green-200 flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {booking?.serviceName || "שירות"}
                        </p>
                        <p className="text-sm text-gray-500">
                          שולם: {payment.paidAt ? formatDate(payment.paidAt) : "-"}
                        </p>
                      </div>
                      <div className="text-left">
                        {getStatusBadge(payment.status)}
                        <p className="text-lg font-bold text-green-600 mt-1">
                          {formatCurrency(payment.netAmount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Monthly Breakdown */}
          <div className="vendor-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">הכנסות לפי חודש</h3>
            <div className="space-y-3">
              {Object.entries(monthlyEarnings).slice(0, 6).map(([month, amount]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="vendor-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">פירוט עמלות</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">סה"כ ברוטו</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(totalEarnings + totalPlatformFees)}
                  </span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">עמלת פלטפורמה (7%)</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(totalPlatformFees)}
                  </span>
                </div>
                <Progress value={7} className="h-2 bg-red-100" />
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">נטו לקבל</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(totalEarnings)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="vendor-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">פרטי חשבון בנק</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">בנק</span>
                <span className="text-gray-900">לאומי</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">סניף</span>
                <span className="text-gray-900">123</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">חשבון</span>
                <span className="text-gray-900">****4567</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              עדכון פרטי בנק
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
