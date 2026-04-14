import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { Card } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { 
  Wallet,
  CreditCard,
  QrCode,
  Edit2,
  Trash2,
  Save,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { format, startOfMonth, endOfMonth, startOfYear, isWithinInterval } from 'date-fns';
import { useState } from 'react';
import type { Invoice } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportsPage() {
  const { invoices, employees, attendance, deleteInvoice, updateInvoice, settings } = useAppStore();
  const { updateStock } = useProductStore();
  
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editFormData, setEditFormData] = useState<Invoice | null>(null);
  const [exportType, setExportType] = useState<'Monthly' | 'Yearly'>('Monthly');

  const now = new Date();
  const monthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
  const yearInterval = { start: startOfYear(now), end: endOfMonth(now) }; // Currently current year up to now

  const filteredInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return isWithinInterval(invDate, exportType === 'Monthly' ? monthInterval : yearInterval);
  });

  const totalRevenue = filteredInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  
  // Separated Totals
  const cashTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'Cash').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const upiTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'UPI').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const cardTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'Card').reduce((acc, inv) => acc + inv.totalAmount, 0);

  const recentSalesData = invoices.map(inv => ({
    id: inv.id,
    no: inv.invoiceNumber,
    date: new Date(inv.date).toLocaleDateString(),
    customer: inv.customerName || 'Cash Customer',
    amount: inv.totalAmount,
    method: inv.paymentMethod,
    raw: inv
  }));

  const handleDeleteBill = (inv: Invoice) => {
    if (window.confirm(`Are you sure you want to delete Bill ${inv.invoiceNumber}? Stock will be reverted.`)) {
      inv.items.forEach(item => {
        if (!item.productId.startsWith('manual-')) {
          updateStock(item.productId, item.quantity);
        }
      });
      deleteInvoice(inv.id);
    }
  };

  const handleEditClick = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditFormData({ ...inv });
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      updateInvoice(editFormData.id, editFormData);
      setEditingInvoice(null);
      setEditFormData(null);
      alert('Bill updated successfully!');
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredInvoices.map(inv => ({
      'Bill No': inv.invoiceNumber,
      'Date': format(new Date(inv.date), 'dd-MM-yyyy'),
      'Customer': inv.customerName || 'Cash Customer',
      'Phone': inv.customerPhone || '-',
      'Subtotal': inv.subTotal,
      'Tax': inv.tax,
      'Discount': inv.discount,
      'Total Amount': inv.totalAmount,
      'Payment Method': inv.paymentMethod
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `Sales_Report_${exportType}_${format(now, 'yyyy-MM-dd')}.xlsx`);
  };

  // Export to PDF
  const exportToPdf = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237); // Primary color
    doc.text(settings.shopName, 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`${exportType} Sales Report - ${format(now, exportType === 'Monthly' ? 'MMMM yyyy' : 'yyyy')}`, 105, 22, { align: 'center' });
    
    // Summary
    doc.setFontSize(10);
    doc.text(`Total Cash: Rs. ${cashTotal.toLocaleString()}`, 14, 35);
    doc.text(`Total UPI: Rs. ${upiTotal.toLocaleString()}`, 14, 40);
    doc.text(`Total Card: Rs. ${cardTotal.toLocaleString()}`, 14, 45);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Revenue: Rs. ${totalRevenue.toLocaleString()}`, 14, 55);

    // Table
    const tableData = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      format(new Date(inv.date), 'dd-MM-yyyy'),
      inv.customerName || 'Cash',
      inv.paymentMethod,
      `Rs. ${inv.totalAmount.toLocaleString()}`
    ]);

    (doc as any).autoTable({
      startY: 65,
      head: [['Bill No', 'Date', 'Customer', 'Mode', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: [124, 58, 237] }
    });

    doc.save(`Sales_Report_${exportType}_${format(now, 'yyyy-MM-dd')}.pdf`);
  };

  // Leave Tracking Logic
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const leaveSummary = employees.map(emp => {
    const empAttendance = attendance.filter(a => 
      a.employeeId === emp.id && 
      new Date(a.date) >= monthStart && 
      new Date(a.date) <= monthEnd
    );

    const absentCount = empAttendance.filter(a => a.status === 'Absent').length;
    const leaveCount = empAttendance.filter(a => a.status === 'Leave').length;
    const halfDayCount = empAttendance.filter(a => a.status === 'Half Day').length;

    return {
      name: emp.name,
      absent: absentCount,
      leave: leaveCount,
      halfDay: halfDayCount,
      totalDeductionDays: absentCount + leaveCount + (halfDayCount * 0.5)
    };
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Business <span className="text-primary-600">Intelligence</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <select 
              value={exportType} 
              onChange={(e) => setExportType(e.target.value as any)}
              className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border-none focus:ring-0 cursor-pointer"
            >
              <option value="Monthly">This Month</option>
              <option value="Yearly">This Year</option>
            </select>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Collections</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-xl font-black uppercase text-xs border-2" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl font-black uppercase text-xs border-2" onClick={exportToPdf}>
            <FileText className="h-4 w-4 text-rose-600" /> PDF Report
          </Button>
        </div>
      </div>

      {/* Collection Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-slate-100 group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-emerald-600">
            <Wallet className="h-16 w-16" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Collection</p>
          <h3 className="text-3xl font-black text-emerald-600 tracking-tighter mt-1">₹{cashTotal.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Physical Cash</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-slate-100 group text-primary-600">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <QrCode className="h-16 w-16" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI / PhonePe</p>
          <h3 className="text-3xl font-black text-primary-600 tracking-tighter mt-1">₹{upiTotal.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Online Total</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-slate-100 group text-blue-600">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard className="h-16 w-16" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Payments</p>
          <h3 className="text-3xl font-black text-blue-600 tracking-tighter mt-1">₹{cardTotal.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">POS machine</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Staff Leaves" description={`${format(new Date(), 'MMMM')} Attendance Summary`}>
          <Table headers={['Employee', 'Absent', 'Leave', 'Half', 'LOP Days']}>
            {leaveSummary.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-bold text-slate-900 uppercase text-xs">{row.name}</TableCell>
                <TableCell className="text-red-600 font-black">{row.absent}</TableCell>
                <TableCell className="text-orange-600 font-black">{row.leave}</TableCell>
                <TableCell className="text-yellow-600 font-black">{row.halfDay}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-700 uppercase">
                    {row.totalDeductionDays} Days
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>

        <Card title="Sales Trend" description="Revenue performance graph">
          <div className="h-[250px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredInvoices.slice(-10).map(inv => ({ name: inv.invoiceNumber.split('-')[1], amount: inv.totalAmount }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Sales Management" description="Review or correct any generated bills">
        <Table headers={['Bill No', 'Customer', 'Amount', 'Mode', 'Actions']}>
          {recentSalesData.slice().reverse().map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-black text-primary-600 tracking-tighter">{row.no}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 uppercase text-[11px]">{row.customer}</span>
                  <span className="text-[9px] font-bold text-slate-400">{row.date}</span>
                </div>
              </TableCell>
              <TableCell className="font-black text-slate-900">₹{row.amount.toLocaleString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest 
                  ${row.method === 'Cash' ? 'bg-emerald-50 text-emerald-700' : 
                    row.method === 'UPI' ? 'bg-primary-50 text-primary-700' : 
                    'bg-blue-50 text-blue-700'}`}>
                  {row.method}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600" title="Edit Bill" onClick={() => handleEditClick(row.raw)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" title="Delete Bill" onClick={() => handleDeleteBill(row.raw)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      {/* Edit Bill Modal */}
      <Modal 
        isOpen={!!editingInvoice} 
        onClose={() => setEditingInvoice(null)} 
        title={`Correction: ${editingInvoice?.invoiceNumber}`}
        size="lg"
      >
        {editFormData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Customer Name" 
                value={editFormData.customerName}
                onChange={e => setEditFormData({...editFormData, customerName: e.target.value})}
              />
              <Input 
                label="Customer Phone" 
                value={editFormData.customerPhone}
                onChange={e => setEditFormData({...editFormData, customerPhone: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Mode</label>
                <select 
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
                  value={editFormData.paymentMethod}
                  onChange={e => setEditFormData({...editFormData, paymentMethod: e.target.value as any})}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / Online</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <Input 
                label="Discount Adjusted (₹)" 
                type="number"
                value={editFormData.discount}
                onChange={e => {
                  const newDisc = Number(e.target.value);
                  const newTotal = editFormData.subTotal + editFormData.tax - newDisc;
                  setEditFormData({...editFormData, discount: newDisc, totalAmount: newTotal});
                }}
              />
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Final Calculation</p>
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Subtotal</p>
                  <p className="font-bold text-slate-900">₹{editFormData.subTotal.toFixed(2)}</p>
                </div>
                <div className="text-primary-600 font-black">+</div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Tax (GST)</p>
                  <p className="font-bold text-slate-900">₹{editFormData.tax.toFixed(2)}</p>
                </div>
                <div className="text-rose-600 font-black">-</div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Discount</p>
                  <p className="font-bold text-rose-600">₹{editFormData.discount.toFixed(2)}</p>
                </div>
                <div className="text-slate-400 font-black">=</div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-primary-600 uppercase">Net Payable</p>
                  <p className="text-xl font-black text-primary-600 tracking-tighter">₹{editFormData.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-xl uppercase font-black tracking-widest text-xs" onClick={() => setEditingInvoice(null)}>Cancel</Button>
              <Button className="flex-1 rounded-xl uppercase font-black tracking-widest text-xs gap-2 shadow-lg shadow-primary-100" onClick={handleSaveEdit}>
                <Save className="h-4 w-4" /> Save Corrections
              </Button>
            </div>
            
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase leading-relaxed">
              Note: To change items in the bill, please delete this bill and create a new one from the billing panel to keep stock accurate.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
