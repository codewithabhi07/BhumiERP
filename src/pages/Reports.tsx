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
  Save,
  MessageCircle,
  TrendingUp,
  CreditCard,
  QrCode,
  Wallet,
  IndianRupee
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { useState, useMemo } from 'react';
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

const CA_WHATSAPP = '8668613369';

export default function ReportsPage() {
  const { invoices, employees, attendance, deleteInvoice, updateInvoice, settings } = useAppStore();
  const { updateStock } = useProductStore();
  
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editFormData, setEditFormData] = useState<Invoice | null>(null);
  
  // Filters
  const [filterType, setFilterType] = useState<'Daily' | 'Monthly' | 'Yearly'>('Monthly');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSalesman, setSelectedSalesman] = useState<string>('all');

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invDate = new Date(inv.date);
      const now = new Date(selectedDate);
      
      let dateMatch = false;
      if (filterType === 'Daily') {
        dateMatch = isSameDay(invDate, now);
      } else if (filterType === 'Monthly') {
        dateMatch = invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      } else {
        dateMatch = invDate.getFullYear() === now.getFullYear();
      }

      // In item-wise mode, we match if ANY item in the bill belongs to the selected salesman
      const salesmanMatch = selectedSalesman === 'all' || inv.items.some(item => item.salesmanId === selectedSalesman);
      
      return dateMatch && salesmanMatch;
    });
  }, [invoices, filterType, selectedDate, selectedSalesman]);

  // Totals based on filtered data
  const cashTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'Cash').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const upiTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'UPI').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const cardTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'Card').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalRevenue = filteredInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  // Salesman Performance Logic (Sum of totals from items they sold)
  const salesmanReport = Object.entries(SALESMEN).map(([id, name]) => {
    let sTotal = 0;
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.salesmanId === id) {
          sTotal += item.total;
        }
      });
    });
    const sCommission = sTotal * 0.01; // 1% Commission
    return { id, name, total: sTotal, commission: sCommission };
  });

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

  const sendToCA = () => {
    const reportText = `*BHUMIKA GARMENTS - ${filterType} Report*\n` +
      `Date: ${selectedDate}\n\n` +
      `*Collections:*\n` +
      `Cash: ₹${cashTotal.toLocaleString()}\n` +
      `UPI: ₹${upiTotal.toLocaleString()}\n` +
      `Card: ₹${cardTotal.toLocaleString()}\n` +
      `------------------\n` +
      `*Total: ₹${totalRevenue.toLocaleString()}*\n\n` +
      `_Generated via BhumiERP_`;
    
    const url = `https://wa.me/91${CA_WHATSAPP}?text=${encodeURIComponent(reportText)}`;
    window.open(url, '_blank');
  };

  const exportToExcel = () => {
    const data = filteredInvoices.map(inv => ({
      'Bill No': inv.invoiceNumber,
      'Date': format(new Date(inv.date), 'dd-MM-yyyy'),
      'Customer': inv.customerName || 'Cash Customer',
      'Total Amount': inv.totalAmount,
      'Mode': inv.paymentMethod
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `Sales_${filterType}_${selectedDate}.xlsx`);
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237);
    doc.text(settings.shopName, 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`${filterType} Report - ${selectedDate}`, 105, 22, { align: 'center' });
    
    (doc as any).autoTable({
      startY: 35,
      head: [['Bill No', 'Date', 'Customer', 'Mode', 'Amount']],
      body: filteredInvoices.map(inv => [inv.invoiceNumber, format(new Date(inv.date), 'dd-MM-yy'), inv.customerName || 'Cash', inv.paymentMethod, inv.totalAmount]),
      theme: 'grid',
      headStyles: { fillStyle: [124, 58, 237] }
    });
    doc.save(`Report_${filterType}.pdf`);
  };

  // Leave Tracking Logic
  const monthStart = startOfMonth(new Date(selectedDate));
  const monthEnd = endOfMonth(new Date(selectedDate));
  const leaveSummary = employees.map(emp => {
    const empAttendance = attendance.filter(a => a.employeeId === emp.id && new Date(a.date) >= monthStart && new Date(a.date) <= monthEnd);
    const absentCount = empAttendance.filter(a => a.status === 'Absent').length;
    const leaveCount = empAttendance.filter(a => a.status === 'Leave').length;
    const halfDayCount = empAttendance.filter(a => a.status === 'Half Day').length;
    return { name: emp.name, absent: absentCount, leave: leaveCount, halfDay: halfDayCount, totalDeductionDays: absentCount + leaveCount + (halfDayCount * 0.5) };
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase leading-none">
            Business <span className="text-primary-600">Intelligence</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Date & Staff Analytics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[1.5rem] shadow-xl border border-slate-100">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Period</span>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)} 
              className="text-xs font-black uppercase bg-slate-50 border-none rounded-xl h-10 px-3 focus:ring-2 focus:ring-primary-500"
            >
              <option value="Daily">Daily</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Date</span>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-black uppercase bg-slate-50 border-none rounded-xl h-10 px-3 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Staff Filter</span>
            <select 
              value={selectedSalesman} 
              onChange={(e) => setSelectedSalesman(e.target.value)}
              className="text-xs font-black uppercase bg-slate-50 border-none rounded-xl h-10 px-3 focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Staff</option>
              {Object.entries(SALESMEN).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>

          <div className="flex items-end h-10 mt-5">
            <div className="flex gap-2">
              <Button variant="outline" className="h-10 px-3 rounded-xl border-2 border-primary-100 text-primary-600 bg-primary-50 hover:bg-primary-100 font-black text-[10px] uppercase gap-2" onClick={sendToCA}>
                <MessageCircle className="h-4 w-4" /> Send to CA
              </Button>
              <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-2" onClick={exportToExcel} title="Export Excel"><FileSpreadsheet className="h-5 w-5 text-emerald-600" /></Button>
              <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-2" onClick={exportToPdf} title="Export PDF"><FileText className="h-5 w-5 text-rose-600" /></Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-emerald-50 p-6 shadow-xl border-2 border-emerald-100 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Wallet className="h-16 w-16" /></div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cash</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">₹{cashTotal.toLocaleString()}</h3>
        </div>
        <div className="rounded-3xl bg-primary-50 p-6 shadow-xl border-2 border-primary-100 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><QrCode className="h-16 w-16" /></div>
          <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">UPI</p>
          <h3 className="text-2xl font-black text-primary-700 mt-1">₹{upiTotal.toLocaleString()}</h3>
        </div>
        <div className="rounded-3xl bg-blue-50 p-6 shadow-xl border-2 border-blue-100 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><CreditCard className="h-16 w-16" /></div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Card</p>
          <h3 className="text-2xl font-black text-blue-700 mt-1">₹{cardTotal.toLocaleString()}</h3>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 p-6 shadow-xl border-none relative group overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp className="h-16 w-16" /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Grand Total</p>
          <h3 className="text-2xl font-black mt-1">₹{totalRevenue.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Salesman Report" description="Item-wise Commission tracking" className="border-none shadow-2xl">
          <Table headers={['Salesman', 'Sales Share', 'Commission']}>
            {salesmanReport.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-bold text-slate-900 uppercase text-xs">{row.name}</TableCell>
                <TableCell className="font-black text-primary-600 tracking-tight">₹{row.total.toLocaleString()}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 uppercase">
                    <IndianRupee className="h-3 w-3" /> {row.commission.toFixed(0)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>

        <Card title="Staff Leaves" description="Monthly Summary" className="border-none shadow-2xl">
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

      <Card title="Filtered Sales Log" className="border-none shadow-2xl">
        <Table headers={['Bill No', 'Date', 'Customer', 'Amount', 'Actions']}>
          {filteredInvoices.slice().reverse().map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-black text-primary-600">{inv.invoiceNumber}</TableCell>
              <TableCell className="text-xs font-bold text-slate-500">{format(new Date(inv.date), 'dd-MM-yy')}</TableCell>
              <TableCell className="font-bold text-slate-900 uppercase text-[10px]">{inv.customerName}</TableCell>
              <TableCell className="font-black text-slate-900">₹{inv.totalAmount.toFixed(0)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-600 bg-primary-50 rounded-lg" onClick={() => handleEditClick(inv)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 bg-rose-50 rounded-lg" onClick={() => handleDeleteBill(inv)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Mode</label>
                <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold" value={editFormData.paymentMethod} onChange={e => setEditFormData({...editFormData, paymentMethod: e.target.value as any})}>
                  <option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Card">Card</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="p-6 bg-slate-900 rounded-[2rem] text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Settlement Amount</p>
              <p className="text-4xl font-black text-primary-400 tracking-tighter italic">₹{editFormData.totalAmount.toFixed(0)}</p>
            </div>
            <Button className="w-full uppercase font-black tracking-widest text-xs h-14 rounded-2xl gap-2 shadow-lg bg-primary-600" onClick={handleSaveEdit}><Save className="h-5 w-5" /> Save Corrections</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
