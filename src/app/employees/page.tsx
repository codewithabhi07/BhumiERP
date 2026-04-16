'use client';

import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { 
  Search, 
  UserPlus, 
  CalendarDays,
  Trash2,
  Users,
  Clock,
  UserCheck
} from 'lucide-react';
import type { Employee, Attendance } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';

export default function EmployeesPage() {
  const { employees, addEmployee, deleteEmployee, attendance, markAttendance } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '', phone: '', position: '', salary: 0, joinDate: today, status: 'Active'
  });

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.phone.includes(searchTerm)
  );

  const getAttendanceForToday = (employeeId: string) => {
    return attendance.find(a => a.employeeId === employeeId && a.date === today);
  };

  const handleMarkAttendance = (employeeId: string, status: Attendance['status']) => {
    markAttendance({ id: `${employeeId}-${today}`, employeeId, date: today, status });
  };

  const handleSaveEmployee = () => {
    if (!newEmployee.name || !newEmployee.phone) return alert('Name & Phone required');
    addEmployee({ ...newEmployee, id: `emp-${Date.now()}` } as Employee);
    setIsModalOpen(false);
    setNewEmployee({ name: '', phone: '', position: '', salary: 0, joinDate: today, status: 'Active' });
  };

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
            <span className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <Users className="h-6 w-6 text-white" />
            </span>
            Staff <span className="text-indigo-600">Force</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Employee & Attendance Terminal</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 h-12 px-6 rounded-2xl font-black uppercase text-xs border-2 border-indigo-100 text-indigo-600 bg-white hover:bg-indigo-50" onClick={() => setIsAttendanceModalOpen(true)}>
            <CalendarDays className="h-4 w-4" /> Attendance
          </Button>
          <Button className="gap-2 h-12 px-6 rounded-2xl font-black uppercase text-xs shadow-xl bg-indigo-600 shadow-indigo-100" onClick={() => setIsModalOpen(true)}>
            <UserPlus className="h-4 w-4" /> Add Staff
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-2xl border-none rounded-[2.5rem] p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-white">
            <div className="relative group max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500" />
              <Input placeholder="Search staff members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 h-11 bg-slate-50 border-none rounded-xl text-sm font-bold focus:bg-white" />
            </div>
          </div>

          <Table headers={['Staff Information', 'Position', 'Today', 'Actions']}>
            {filteredEmployees.map((emp) => {
              const todayAtt = getAttendanceForToday(emp.id);
              return (
                <TableRow key={emp.id} className="group hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-primary-400 flex items-center justify-center text-white font-black shadow-md uppercase">{emp.name[0]}</div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{emp.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-lg text-slate-600 tracking-tighter">{emp.position}</span></TableCell>
                  <TableCell>
                    {!todayAtt ? <span className="text-slate-300 text-[10px] font-black uppercase tracking-tighter italic flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span> : (
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border",
                        todayAtt.status === 'Full Day' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        todayAtt.status === 'Half Day' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      )}>
                        {todayAtt.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleMarkAttendance(emp.id, 'Full Day')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white font-black text-[9px]">FULL</button>
                      <button onClick={() => handleMarkAttendance(emp.id, 'Half Day')} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white font-black text-[9px]">HALF</button>
                      <button onClick={() => deleteEmployee(emp.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-2xl rounded-[2.5rem] p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><UserCheck className="h-32 w-32" /></div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">Live Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                  <span className="text-[10px] font-black uppercase text-indigo-100">Staff Count</span>
                  <span className="text-xl font-black">{employees.length}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-2xl backdrop-blur-md border-l-4 border-l-emerald-400">
                  <span className="text-[10px] font-black uppercase text-indigo-100">Present Today</span>
                  <span className="text-xl font-black">{attendance.filter(a => a.date === today && a.status === 'Full Day').length}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Staff">
        <div className="space-y-4">
          <Input label="Staff Member Name" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className="bg-slate-50 border-none h-11 uppercase" />
          <Input label="Contact Mobile" value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} className="bg-slate-50 border-none h-11" />
          <Input label="Work Position" value={newEmployee.position} onChange={e => setNewEmployee({...newEmployee, position: e.target.value})} className="bg-slate-50 border-none h-11" />
          <Input label="Monthly Wage (₹)" type="number" value={newEmployee.salary || ''} onChange={e => setNewEmployee({...newEmployee, salary: Number(e.target.value)})} className="bg-slate-50 border-none h-11 font-bold text-primary-600" />
          <Button className="w-full h-14 rounded-2xl uppercase font-black tracking-widest text-[10px] bg-indigo-600 shadow-xl shadow-indigo-100 mt-4" onClick={handleSaveEmployee}>Finalize Registration</Button>
        </div>
      </Modal>

      <Modal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title={`Attendance Terminal - ${today}`} size="lg">
        <div className="space-y-3">
          {employees.map(emp => {
            const att = getAttendanceForToday(emp.id);
            return (
              <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm">{emp.name[0]}</div>
                  <div>
                    <p className="font-black text-slate-900 uppercase text-xs tracking-tight leading-none">{emp.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{emp.position}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleMarkAttendance(emp.id, 'Full Day')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", att?.status === 'Full Day' ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200")}>FULL</button>
                  <button onClick={() => handleMarkAttendance(emp.id, 'Half Day')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", att?.status === 'Half Day' ? "bg-amber-500 border-amber-500 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-amber-200")}>HALF</button>
                  <button onClick={() => handleMarkAttendance(emp.id, 'Absent')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", att?.status === 'Absent' ? "bg-rose-500 border-rose-500 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-rose-200")}>ABS</button>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
