import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { 
  Plus, 
  Search, 
  Calendar, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  CalendarDays,
  Trash2
} from 'lucide-react';
import type { Employee, Attendance } from '../types';
import { format } from 'date-fns';

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, attendance, markAttendance } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    phone: '',
    position: '',
    salary: 0,
    joinDate: today,
    status: 'Active'
  });

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.phone.includes(searchTerm)
  );

  const getAttendanceForToday = (employeeId: string) => {
    return attendance.find(a => a.employeeId === employeeId && a.date === today);
  };

  const handleMarkAttendance = (employeeId: string, status: Attendance['status']) => {
    markAttendance({
      id: `${employeeId}-${today}`,
      employeeId,
      date: today,
      status
    });
  };

  const handleSaveEmployee = () => {
    if (!newEmployee.name || !newEmployee.phone) {
      alert('Please fill in name and phone');
      return;
    }
    addEmployee({
      ...newEmployee,
      id: `emp-${Date.now()}`,
    } as Employee);
    setIsModalOpen(false);
    setNewEmployee({
      name: '',
      phone: '',
      position: '',
      salary: 0,
      joinDate: today,
      status: 'Active'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-500">Manage employees, daily attendance, and leaves.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsAttendanceModalOpen(true)}>
            <CalendarDays className="h-4 w-4" /> Today's Attendance
          </Button>
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <UserPlus className="h-4 w-4" /> Add Employee
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="mb-6 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search employees..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Table headers={['Employee', 'Position', 'Salary', 'Today Status', 'Actions']}>
            {filteredEmployees.map((emp) => {
              const todayAtt = getAttendanceForToday(emp.id);
              return (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{emp.name}</span>
                      <span className="text-xs text-slate-500">{emp.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>₹{emp.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    {!todayAtt ? (
                      <span className="text-slate-400 text-xs italic">Not Marked</span>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium 
                        ${todayAtt.status === 'Full Day' ? 'bg-green-50 text-green-700' : 
                          todayAtt.status === 'Half Day' ? 'bg-yellow-50 text-yellow-700' : 
                          'bg-red-50 text-red-700'}`}>
                        {todayAtt.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" title="Full Day" onClick={() => handleMarkAttendance(emp.id, 'Full Day')}>F</Button>
                      <Button variant="outline" size="sm" title="Half Day" onClick={() => handleMarkAttendance(emp.id, 'Half Day')}>H</Button>
                      <Button variant="outline" size="sm" title="Leave" className="text-orange-600 border-orange-100" onClick={() => handleMarkAttendance(emp.id, 'Leave')}>L</Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteEmployee(emp.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </Card>

        <div className="space-y-6">
          <Card title="Attendance Summary" description={today}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Staff</span>
                <span className="font-bold text-slate-900">{employees.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Present (Full Day)</span>
                <span className="font-bold text-green-600">
                  {attendance.filter(a => a.date === today && a.status === 'Full Day').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Half Day</span>
                <span className="font-bold text-yellow-600">
                  {attendance.filter(a => a.date === today && a.status === 'Half Day').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Absent / Leave</span>
                <span className="font-bold text-red-600">
                  {attendance.filter(a => a.date === today && (a.status === 'Absent' || a.status === 'Leave')).length}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Quick Stats">
            <p className="text-xs text-slate-500 mb-4">Staff performance indicators</p>
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="text-xs text-primary-600 font-bold uppercase tracking-wider">Top Employee</p>
                <p className="text-sm font-bold text-primary-900">
                  {employees.length > 0 ? employees[0].name : 'N/A'}
                </p>
                <p className="text-xs text-primary-700">Good Attendance this month</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Employee"
      >
        <div className="space-y-4">
          <Input 
            label="Full Name" 
            placeholder="e.g. Rahul Patil" 
            value={newEmployee.name}
            onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
          />
          <Input 
            label="Phone Number" 
            placeholder="10-digit mobile" 
            value={newEmployee.phone}
            onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})}
          />
          <Input 
            label="Position" 
            placeholder="e.g. Sales Executive" 
            value={newEmployee.position}
            onChange={e => setNewEmployee({...newEmployee, position: e.target.value})}
          />
          <Input 
            label="Monthly Salary (₹)" 
            type="number" 
            placeholder="0" 
            value={newEmployee.salary || ''}
            onChange={e => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
          />
          <Input 
            label="Joining Date" 
            type="date" 
            value={newEmployee.joinDate} 
            onChange={e => setNewEmployee({...newEmployee, joinDate: e.target.value})}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveEmployee}>Save Employee</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title={`Attendance - ${today}`}
        size="lg"
      >
        <div className="space-y-4">
          {employees.map(emp => {
            const att = getAttendanceForToday(emp.id);
            return (
              <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-bold text-slate-900">{emp.name}</p>
                  <p className="text-xs text-slate-500">{emp.position}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={att?.status === 'Full Day' ? 'primary' : 'outline'} 
                    size="sm"
                    onClick={() => handleMarkAttendance(emp.id, 'Full Day')}
                  >Full</Button>
                  <Button 
                    variant={att?.status === 'Half Day' ? 'primary' : 'outline'} 
                    size="sm"
                    onClick={() => handleMarkAttendance(emp.id, 'Half Day')}
                  >Half</Button>
                  <Button 
                    variant={att?.status === 'Absent' ? 'danger' : 'outline'} 
                    size="sm"
                    onClick={() => handleMarkAttendance(emp.id, 'Absent')}
                  >Absent</Button>
                </div>
              </div>
            );
          })}
          {employees.length === 0 && (
            <p className="text-center text-slate-500 py-4 italic">No employees found to mark attendance.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
