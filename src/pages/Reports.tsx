import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { Card } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { 
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Save
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, isWithinInterval } from 'date-fns';
import { useState } from 'react';
import type { Invoice } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SALESMEN: Record<string, string> = {
  '1': 'Sunil Patil',
  '2': 'Mukesh Patil',
  '3': 'Ankush Dada',
  '4': 'Dipak Mahajan'
};

export default function ReportsPage() {
  const { invoices, employees, attendance, deleteInvoice, updateInvoice, settings } = useAppStore();
  const { updateStock } = useProductStore();
  
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editFormData, setEditFormData] = useState<Invoice | null>(null);
  const [exportType, setExportType] = useState<'Monthly' | 'Yearly'>('Monthly');

  const now = new Date();
  const monthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
  const yearInterval = { start: startOfYear(now), end: endOfMonth(now) };

  const filteredInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return isWithinInterval(invDate, exportType === 'Monthly' ? monthInterval : yearInterval);
  });

  // Separated Totals
  const cashTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'Cash').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const upiTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'UPI').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const cardTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'Card').reduce((acc, inv) => acc + inv.totalAmount, 0);

  // Salesman Performance Logic
  const salesmanReport = Object.entries(SALESMEN).map(([id, name]) => {
    const sInvoices = filteredInvoices.filter(inv => inv.salesmanId === id);
    const sTotal = sInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const sCommission = sTotal * 0.01; // 1% Commission example
    return { id, name, total: sTotal, count: sInvoices.length, commission: sCommission };
  });

  const recentSalesData = invoices.map(inv => ({
    id: inv.id,
    no: inv.invoiceNumber,
    date: new Date(inv.date).toLocaleDateString(),
    customer: inv.customerName || 'Cash Customer',
    amount: inv.totalAmount,
    method: inv.paymentMethod,
    salesman: inv.salesmanName || 'N/A',
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
      'Salesman': inv.salesmanName || '-',
      'Total Amount': inv.totalAmount,
      'Mode': inv.paymentMethod
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `Sales_${exportType}_${format(now, 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237);
    doc.text(settings.shopName, 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`${exportType} Report - ${format(now, 'MMM yyyy')}`, 105, 22, { align: 'center' });
    
    (doc as any).autoTable({
      startY: 35,
      head: [['Bill No', 'Customer', 'Salesman', 'Mode', 'Amount']],
      body: filteredInvoices.map(inv => [inv.invoiceNumber, inv.customerName || 'Cash', inv.salesmanName || '-', inv.paymentMethod, inv.totalAmount]),
      theme: 'grid',
      headStyles: { fillStyle: [124, 58, 237] }
    });
    doc.save(`Report_${exportType}.pdf`);
  };

  // Leave Tracking Logic
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const leaveSummary = employees.map(emp => {
    const empAttendance = attendance.filter(a => a.employeeId === emp.id && new Date(a.date) >= monthStart && new Date(a.date) <= monthEnd);
    const absentCount = empAttendance.filter(a => a.status === 'Absent').length;
    const leaveCount = empAttendance.filter(a => a.status === 'Leave').length;
    const halfDayCount = empAttendance.filter(a => a.status === 'Half Day').length;
    return { name: emp.name, absent: absentCount, leave: leaveCount, halfDay: halfDayCount, totalDeductionDays: absentCount + leaveCount + (halfDayCount * 0.5) };
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Business <span className="text-primary-600">Intelligence</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <select value={exportType} onChange={(e) => setExportType(e.target.value as any)} className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border-none focus:ring-0 cursor-pointer">
              <option value="Monthly">This Month</option>
              <option value="Yearly">This Year</option>
            </select>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Collections</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-xl font-black uppercase text-xs border-2" onClick={exportToExcel}><FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel</Button>
          <Button variant="outline" className="gap-2 rounded-xl font-black uppercase text-xs border-2" onClick={exportToPdf}><FileText className="h-4 w-4 text-rose-600" /> PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash</p><h3 className="text-3xl font-black text-emerald-600 mt-1">₹{cashTotal.toLocaleString()}</h3></div>
        <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI</p><h3 className="text-3xl font-black text-primary-600 mt-1">₹{upiTotal.toLocaleString()}</h3></div>
        <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card</p><h3 className="text-3xl font-black text-blue-600 mt-1">₹{cardTotal.toLocaleString()}</h3></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salesman Performance Report */}
        <Card title="Salesman Report" description={`${exportType} Performance & Commission (1%)`}>
          <Table headers={['Salesman', 'Total Sales', 'Bills', 'Commission']}>
            {salesmanReport.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-bold text-slate-900 uppercase text-xs">{row.name}</TableCell>
                <TableCell className="font-black text-primary-600 tracking-tight">₹{row.total.toLocaleString()}</TableCell>
                <TableCell className="font-bold text-slate-500">{row.count}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 uppercase">
                    <IndianRupee className="h-3 w-3" /> {row.commission.toFixed(0)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>

        <Card title="Staff Leaves" description="Monthly Summary">
          <Table headers={['Employee', 'Abs', 'Leave', 'LOP']}>
            {leaveSummary.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-bold text-slate-900 uppercase text-[10px]">{row.name}</TableCell>
                <TableCell className="text-red-600 font-bold">{row.absent}</TableCell>
                <TableCell className="text-orange-600 font-bold">{row.leave}</TableCell>
                <TableCell><span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black text-red-700 uppercase">{row.totalDeductionDays} D</span></TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      </div>

      <Card title="Sales Management">
        <Table headers={['Bill No', 'Customer', 'Amount', 'Salesman', 'Actions']}>
          {recentSalesData.slice().reverse().map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-black text-primary-600">{row.no}</TableCell>
              <TableCell className="font-bold text-slate-900 uppercase text-[10px]">{row.customer}</TableCell>
              <TableCell className="font-black text-slate-900">₹{row.amount}</TableCell>
              <TableCell className="text-xs font-bold text-slate-500">{row.salesman}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-600" onClick={() => handleEditClick(row.raw)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400" onClick={() => handleDeleteBill(row.raw)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal isOpen={!!editingInvoice} onClose={() => setEditingInvoice(null)} title={`Correction: ${editingInvoice?.invoiceNumber}`} size="lg">
        {editFormData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Customer Name" value={editFormData.customerName} onChange={e => setEditFormData({...editFormData, customerName: e.target.value})} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Salesman</label>
                <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold" value={editFormData.salesmanId} onChange={e => setEditFormData({...editFormData, salesmanId: e.target.value, salesmanName: SALESMEN[e.target.value]})}>
                  {Object.entries(SALESMEN).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Mode</label>
                <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold" value={editFormData.paymentMethod} onChange={e => setEditFormData({...editFormData, paymentMethod: e.target.value as any})}>
                  <option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Card">Card</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Disc (%)" type="number" value={(editFormData.discount / editFormData.subTotal * 100).toFixed(0)} onChange={e => {
                  const perc = Number(e.target.value);
                  const amt = editFormData.subTotal * (perc / 100);
                  const tax = editFormData.tax > 0 ? (editFormData.subTotal - amt) * 0.12 : 0;
                  setEditFormData({...editFormData, discount: amt, tax, totalAmount: editFormData.subTotal - amt + tax + editFormData.rounding});
                }} />
                <Input label="Round (+/-)" type="number" value={editFormData.rounding} onChange={e => {
                  const rnd = Number(e.target.value);
                  setEditFormData({...editFormData, rounding: rnd, totalAmount: editFormData.subTotal - editFormData.discount + editFormData.tax + rnd});
                }} />
              </div>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Settlement Amount</p>
              <p className="text-3xl font-black text-primary-400 tracking-tighter italic">₹{editFormData.totalAmount.toFixed(0)}</p>
            </div>
            <Button className="w-full uppercase font-black tracking-widest text-xs h-14 rounded-2xl gap-2 shadow-lg" onClick={handleSaveEdit}>
              <Save className="h-5 w-5" /> Save Corrections
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
