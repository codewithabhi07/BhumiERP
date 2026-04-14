import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Phone, Mail, MapPin, UserPlus } from 'lucide-react';
import type { Customer } from '../types';

export default function CustomersPage() {
  const { customers, addCustomer } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    totalSpent: 0,
    lastVisit: new Date().toISOString()
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleSaveCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Please fill in name and phone');
      return;
    }
    addCustomer({
      ...newCustomer,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
      lastVisit: new Date().toISOString()
    } as Customer);
    setIsModalOpen(false);
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage your customer relationships and history.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <UserPlus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card>
        <div className="mb-6 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Table headers={['Customer', 'Contact Info', 'Last Visit', 'Total Spent', 'Actions']}>
          {filteredCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold">
                    {customer.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-900">{customer.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Phone className="h-3 w-3" /> {customer.phone}
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Mail className="h-3 w-3" /> {customer.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{new Date(customer.lastVisit).toLocaleDateString()}</TableCell>
              <TableCell className="font-semibold text-slate-900">₹{customer.totalSpent.toLocaleString()}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredCustomers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center text-slate-400 italic">
                No customers found.
              </TableCell>
            </TableRow>
          )}
        </Table>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Customer"
      >
        <div className="space-y-4">
          <Input 
            label="Customer Name" 
            placeholder="e.g. Rahul Sharma" 
            value={newCustomer.name}
            onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
          />
          <Input 
            label="Phone Number" 
            placeholder="10-digit mobile" 
            value={newCustomer.phone}
            onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
          />
          <Input 
            label="Email (Optional)" 
            type="email" 
            placeholder="customer@example.com" 
            value={newCustomer.email}
            onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
          />
          <Input 
            label="Address" 
            placeholder="City, Area" 
            value={newCustomer.address}
            onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveCustomer}>Save Customer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
