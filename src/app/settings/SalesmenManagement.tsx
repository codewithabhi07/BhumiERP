'use client';

import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { UserPlus, Trash2, Edit2, Save, X, Plus } from 'lucide-react';
import type { Salesman } from '../../types';

export function SalesmenManagement() {
  const { salesmen, addSalesman, updateSalesman, deleteSalesman } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Salesman>({
    id: '',
    name: '',
    phone: '',
    commissionRate: 1
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ id: (salesmen.length + 1).toString(), name: '', phone: '', commissionRate: 1 });
    setIsModalOpen(true);
  };

  const handleEdit = (s: Salesman) => {
    setEditingId(s.id);
    setFormData({ ...s });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.id || !formData.name) return alert('ID and Name are required');
    
    if (editingId) {
      await updateSalesman(editingId, formData);
    } else {
      if (salesmen.find(s => s.id === formData.id)) {
        return alert('Salesman with this Number already exists!');
      }
      await addSalesman(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this staff member?')) {
      await deleteSalesman(id);
    }
  };

  return (
    <Card title="Staff & Commission Management" description="Manage salesman numbers, names and their commission percentages.">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleOpenAdd} className="gap-2 rounded-xl bg-primary-600">
            <UserPlus className="h-4 w-4" /> Add Staff Member
          </Button>
        </div>

        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <Table headers={['S.No', 'Name', 'Phone', 'Comm. %', 'Actions']}>
            {salesmen.map((s) => (
              <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-black text-primary-600 italic">#{s.id}</TableCell>
                <TableCell className="font-bold text-slate-900 uppercase">{s.name}</TableCell>
                <TableCell className="text-slate-500 font-medium">{s.phone || 'N/A'}</TableCell>
                <TableCell className="font-black text-emerald-600">{s.commissionRate}%</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(s)} className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Staff Member" : "Add New Staff Member"}>
        <div className="space-y-4">
          <Input 
            label="Salesman Number (Use for Billing)" 
            value={formData.id} 
            onChange={e => setFormData({ ...formData, id: e.target.value })}
            placeholder="e.g. 1"
            disabled={!!editingId}
            className="font-black"
          />
          <Input 
            label="Full Name" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter Name"
            className="uppercase font-bold"
          />
          <Input 
            label="Phone Number" 
            value={formData.phone} 
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="WhatsApp Number"
          />
          <Input 
            label="Commission Rate (%)" 
            type="number"
            value={formData.commissionRate} 
            onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
            placeholder="e.g. 1"
            className="font-black text-emerald-600"
          />
          
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 h-12 rounded-xl bg-primary-600" onClick={handleSave}>
              {editingId ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {editingId ? 'Update Member' : 'Add Member'}
            </Button>
            <Button variant="outline" className="h-12 rounded-xl" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
