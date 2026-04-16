'use client';

import { useAppStore } from '../../store/useAppStore';
import { useProductStore } from '../../store/useProductStore';
import { Card } from '../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { SecurityWrapper } from '../../components/layout/SecurityWrapper';
import { 
  Edit2,
  Trash2,
  FileSpreadsheet,
  Save,
  MessageCircle,
  TrendingUp,
  CreditCard,
  QrCode,
  Wallet,
  IndianRupee,
  ChevronDown
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { useState, useMemo } from 'react';
import type { Invoice } from '../../types';
import * as XLSX from 'xlsx';

const SALESMEN: Record<string, string> = {
  '1': 'Sunil Patil',
  '2': 'Mukesh Patil',
  '3': 'Ankush Dada',
  '4': 'Dipak Mahajan'
};

const CA_WHATSAPP = '8668613369';

export default function ReportsPage() {
  const { invoices, employees, attendance, settings, deleteInvoice, updateInvoice, salesmen } = useAppStore();
  const { updateStock } = useProductStore();
  
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editFormData, setEditFormData] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Range Filters
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSalesman, setSelectedSalesman] = useState<string>('all');

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invDate = new Date(inv.date);
      invDate.setHours(0, 0, 0, 0);
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const dateMatch = invDate >= start && invDate <= end;
      const salesmanMatch = selectedSalesman === 'all' || inv.items.some(item => item.salesmanId === selectedSalesman);
      
      return dateMatch && salesmanMatch;
    });
  }, [invoices, startDate, endDate, selectedSalesman]);

  const cashTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'Cash').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const upiTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'UPI').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const cardTotal = filteredInvoices.filter(inv => inv.paymentMethod === 'Card').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalRevenue = filteredInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  const salesmanReport = salesmen.map((s) => {
    let sTotal = 0;
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.salesmanId === s.id) sTotal += item.total;
      });
    });
    const sCommission = sTotal * (s.commissionRate / 100);
    return { id: s.id, name: s.name, total: sTotal, commission: sCommission };
  });

  const handleDeleteBill = (inv: Invoice) => {
    if (window.confirm(`Delete Bill ${inv.invoiceNumber}? Stock will be returned.`)) {
      inv.items.forEach(item => {
        if (!item.productId.startsWith('manual-')) updateStock(item.productId, item.quantity);
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
      alert('Updated!');
    }
  };

  const CA_WHATSAPP = '9975345692'; // From settings

  const sendToCA = () => {
    const reportText = `*BHUMIKA GARMENTS REPORT*\nRange: ${startDate} to ${endDate}\n\nCash: ₹${cashTotal}\nUPI: ₹${upiTotal}\nCard: ₹${cardTotal}\nTotal: ₹${totalRevenue}`;
    window.open(`https://wa.me/91${CA_WHATSAPP}?text=${encodeURIComponent(reportText)}`, '_blank');
  };

  const exportToExcel = () => {
    const excelData = filteredInvoices.map(inv => ({
      'Bill No': inv.invoiceNumber,
      'Date': format(new Date(inv.date), 'dd-MM-yyyy'),
      'Customer': inv.customerName || 'Guest',
      'Amount': inv.totalAmount,
      'Payment Mode': inv.paymentMethod
    }));

    // Add empty separator row
    excelData.push({
      'Bill No': '', 'Date': '', 'Customer': '', 'Amount': null as any, 'Payment Mode': ''
    });

    // Add Summary Rows
    excelData.push({
      'Bill No': 'SUMMARY REPORT', 'Date': '', 'Customer': 'TOTAL CASH', 'Amount': cashTotal, 'Payment Mode': 'CASH'
    });
    excelData.push({
      'Bill No': '', 'Date': '', 'Customer': 'TOTAL UPI', 'Amount': upiTotal, 'Payment Mode': 'UPI'
    });
    excelData.push({
      'Bill No': '', 'Date': '', 'Customer': 'TOTAL CARD', 'Amount': cardTotal, 'Payment Mode': 'CARD'
    });
    excelData.push({
      'Bill No': '', 'Date': '', 'Customer': 'GROSS TOTAL REVENUE', 'Amount': totalRevenue, 'Payment Mode': 'ALL'
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths for better readability
    const wscols = [
      { wch: 15 }, // Bill No
      { wch: 12 }, // Date
      { wch: 25 }, // Customer
      { wch: 15 }, // Amount
      { wch: 15 }, // Mode
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `Bhumika_Report_${startDate}_to_${endDate}.xlsx`);
  };

  const leaveSummary = employees.map(emp => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const empAttendance = attendance.filter(a => a.employeeId === emp.id && new Date(a.date) >= start && new Date(a.date) <= end);
    const abs = empAttendance.filter(a => a.status === 'Absent').length;
    const lve = empAttendance.filter(a => a.status === 'Leave').length;
    const half = empAttendance.filter(a => a.status === 'Half Day').length;
    return { name: emp.name, lop: abs + lve + (half * 0.5) };
  });

  return (
    <SecurityWrapper>
      <div className="space-y-8 pb-10 animate-slide-up">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
              Business <span className="text-primary-600">Intelligence</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Analytics Control Center</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-50">
            <div className="flex flex-col gap-1 px-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs font-black uppercase bg-slate-50 border-none rounded-xl h-10 px-4 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex flex-col gap-1 px-2 border-l border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs font-black uppercase bg-slate-50 border-none rounded-xl h-10 px-4 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex flex-col gap-1 px-2 border-l border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff</span>
              <div className="relative">
                <select value={selectedSalesman} onChange={(e) => setSelectedSalesman(e.target.value)} className="appearance-none text-xs font-black uppercase bg-slate-50 border-none rounded-xl h-10 pl-4 pr-10 focus:ring-2 focus:ring-primary-500">
                  <option value="all">All Staff</option>{salesmen.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button 
                variant="outline" 
                className="h-10 px-4 rounded-xl border-2 border-primary-100 text-primary-600 bg-primary-50 hover:bg-primary-100 text-[10px] font-black uppercase"
                onClick={() => setIsPreviewOpen(true)}
              >
                Preview Report
              </Button>
              <Button variant="outline" className="h-10 px-4 rounded-xl border-2 border-emerald-100 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-[10px] font-black uppercase gap-2" onClick={sendToCA}><MessageCircle className="h-4 w-4" /> WhatsApp CA</Button>
              <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-2 border-primary-100 text-primary-600 bg-primary-50" onClick={exportToExcel}><FileSpreadsheet className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>

        {/* Report Preview Modal */}
        <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(null as any)} title="Business Intelligence Report Preview" size="lg">
          <div className="space-y-6 p-2">
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{settings?.shopName || 'Bhumika Garments'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{settings?.address}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GST: {settings?.gstNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Report Period</p>
                <p className="text-sm font-black text-slate-900 italic tracking-tight">{format(new Date(startDate), 'dd MMM yyyy')} — {format(new Date(endDate), 'dd MMM yyyy')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cash</p>
                <p className="text-lg font-black text-emerald-600">₹{cashTotal.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">UPI</p>
                <p className="text-lg font-black text-primary-600">₹{upiTotal.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Card</p>
                <p className="text-lg font-black text-blue-600">₹{cardTotal.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                <p className="text-lg font-black text-white">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Salesman Performance</p>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <Table headers={['Staff Member', 'Generated Revenue']}>
                  {salesmanReport.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-bold text-slate-900 uppercase text-[10px]">{row.name}</TableCell>
                      <TableCell className="font-black text-slate-900">₹{row.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                className="flex-1 h-14 rounded-2xl bg-primary-600 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary-100"
                onClick={() => {
                  exportToExcel();
                  setIsPreviewOpen(false);
                }}
              >
                <FileSpreadsheet className="h-5 w-5" /> Download accurate Excel Report
              </Button>
              <Button 
                variant="outline" 
                className="px-8 h-14 rounded-2xl border-2 border-slate-200 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50"
                onClick={() => setIsPreviewOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl border-b-4 border-b-emerald-500 relative group overflow-hidden transition-all hover:scale-105">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Wallet className="h-20 w-20 text-emerald-600" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Collection</p>
            <h3 className="text-3xl font-black text-emerald-600 tracking-tighter mt-1">₹{cashTotal.toLocaleString()}</h3>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-xl border-b-4 border-b-primary-500 relative group overflow-hidden transition-all hover:scale-105">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform"><QrCode className="h-20 w-20 text-primary-600" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI / PhonePe</p>
            <h3 className="text-3xl font-black text-primary-600 tracking-tighter mt-1">₹{upiTotal.toLocaleString()}</h3>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-xl border-b-4 border-b-blue-500 relative group overflow-hidden transition-all hover:scale-105">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform"><CreditCard className="h-20 w-20 text-blue-600" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Payments</p>
            <h3 className="text-3xl font-black text-blue-600 tracking-tighter mt-1">₹{cardTotal.toLocaleString()}</h3>
          </div>
          <div className="rounded-[2rem] bg-slate-900 p-6 shadow-2xl border-none relative group overflow-hidden transition-all hover:scale-105 text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp className="h-20 w-20 text-white" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Gross Revenue</p>
            <h3 className="text-3xl font-black text-white tracking-tighter mt-1">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Staff Incentives" description="Commission share by salesman" className="border-none shadow-2xl rounded-[2.5rem]">
            <Table headers={['Salesman', 'Total Sales', 'Commission']}>
              {salesmanReport.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-bold text-slate-900 uppercase text-xs tracking-tight">{row.name}</TableCell>
                  <TableCell className="font-black text-primary-600 tracking-tighter">₹{row.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1 text-xs font-black text-emerald-700 uppercase tracking-widest">
                      <IndianRupee className="h-3 w-3" /> {row.commission.toFixed(0)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </Card>

          <Card title="Attendance Health" description="Monthly staff deduction status" className="border-none shadow-2xl rounded-[2.5rem]">
            <Table headers={['Staff Member', 'Loss of Pay Days']}>
              {leaveSummary.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-bold text-slate-900 uppercase text-xs tracking-tight">{row.name}</TableCell>
                  <TableCell><span className="rounded-full bg-rose-50 text-rose-600 px-4 py-1 text-xs font-black uppercase tracking-widest">{row.lop} Days</span></TableCell>
                </TableRow>
              ))}
            </Table>
          </Card>
        </div>

        <Card title="Operational Log" description="Advanced bill management terminal" className="border-none shadow-2xl rounded-[2.5rem]">
          <Table headers={['Bill #', 'Customer', 'Amount', 'Date', 'Actions']}>
            {filteredInvoices.slice().reverse().map((inv) => (
              <TableRow key={inv.id} className="hover:bg-slate-50">
                <TableCell className="font-black text-primary-600 italic tracking-tighter">{inv.invoiceNumber}</TableCell>
                <TableCell className="font-bold text-slate-900 uppercase text-[10px] tracking-tight">{inv.customerName}</TableCell>
                <TableCell className="font-black text-slate-900">₹{inv.totalAmount.toFixed(0)}</TableCell>
                <TableCell className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(inv.date), 'dd MMM yy')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-primary-600 bg-primary-50 rounded-xl hover:scale-110" onClick={() => handleEditClick(inv)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-400 bg-rose-50 rounded-xl hover:scale-110" onClick={() => handleDeleteBill(inv)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>

        <Modal isOpen={!!editingInvoice} onClose={() => setEditingInvoice(null)} title="Bill Correction Mode" size="lg">
          {editFormData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Customer Name" value={editFormData.customerName} onChange={e => setEditFormData({...editFormData, customerName: e.target.value})} className="h-12 bg-slate-50 border-none" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Disc (%)" type="number" value={(editFormData.discount / editFormData.subTotal * 100).toFixed(0)} onChange={e => {
                    const perc = Number(e.target.value);
                    const amt = editFormData.subTotal * (perc / 100);
                    const tax = editFormData.tax > 0 ? (editFormData.subTotal - amt) * 0.12 : 0;
                    setEditFormData({...editFormData, discount: amt, tax, totalAmount: editFormData.subTotal - amt + tax + editFormData.rounding});
                  }} className="h-12 bg-slate-50 border-none" />
                  <Input label="Round (+/-)" type="number" value={editFormData.rounding} onChange={e => {
                    const rnd = Number(e.target.value);
                    setEditFormData({...editFormData, rounding: rnd, totalAmount: editFormData.subTotal - editFormData.discount + editFormData.tax + rnd});
                  }} className="h-12 bg-slate-50 border-none" />
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><IndianRupee className="h-32 w-32 text-white" /></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Final Corrected Total</p>
                <p className="text-6xl font-black text-primary-400 tracking-tighter italic">₹{editFormData.totalAmount.toFixed(0)}</p>
              </div>
              <Button className="w-full uppercase font-black tracking-widest text-sm h-16 rounded-[1.5rem] gap-3 bg-primary-600 shadow-2xl shadow-primary-200" onClick={handleSaveEdit}><Save className="h-6 w-6" /> Save All Changes</Button>
            </div>
          )}
        </Modal>
      </div>
    </SecurityWrapper>
  );
}
