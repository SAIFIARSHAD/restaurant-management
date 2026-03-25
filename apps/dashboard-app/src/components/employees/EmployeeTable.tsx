import { useState } from 'react';
import { Pencil, Trash2, Clock, IndianRupee, Calendar } from 'lucide-react';
import { useDeleteEmployee, type IEmployee } from '../../hooks/useEmployees';
import EmployeeModal from './EmployeeModal';
import AttendanceDrawer from './AttendanceDrawer';
import PayrollDrawer from './PayrollDrawer';

interface Props {
  employees: IEmployee[];
}



const ROLE_COLORS: Record<string, string> = {
  manager:  'bg-purple-500/10 text-purple-400 border-purple-500/30',
  cashier:  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  kitchen:  'bg-orange-500/10 text-orange-400 border-orange-500/30',
  waiter:   'bg-green-500/10 text-green-400 border-green-500/30',
  delivery: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};


export default function EmployeeTable({ employees }: Props) {
  const deleteMutation = useDeleteEmployee();
  const [editEmployee,       setEditEmployee]       = useState<IEmployee | null>(null);
  const [attendanceEmployee, setAttendanceEmployee] = useState<IEmployee | null>(null);
  const [confirmId,          setConfirmId]          = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setConfirmId(null);
    
  };
  const [payrollEmployee, setPayrollEmployee] = useState<IEmployee | null>(null);

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Employee</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Salary</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Joined</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">

                
                <td className="px-4 py-3">
                  <p className="text-white font-semibold text-sm">{emp.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{emp.email}</p>
                  <p className="text-zinc-600 text-xs">{emp.phone}</p>
                </td>

                
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border capitalize ${ROLE_COLORS[emp.role]}`}>
                    {emp.role}
                  </span>
                </td>

                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-white text-sm font-semibold">
                    <IndianRupee className="w-3.5 h-3.5 text-orange-400" />
                    {emp.salary.toLocaleString('en-IN')}
                  </div>
                  <p className="text-zinc-500 text-xs capitalize mt-0.5">{emp.salaryType}</p>
                </td>

                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {new Date(emp.joiningDate).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </div>
                </td>

                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAttendanceEmployee(emp)}
                      className="p-1.5 bg-zinc-800 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 rounded-lg transition-colors"
                      title="View Attendance"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>

                    <button
                    onClick={() => setPayrollEmployee(emp)}
                    className="p-1.5 bg-zinc-800 hover:bg-green-500/20 text-zinc-400 hover:text-green-400 rounded-lg transition-colors"
                    title="Payroll"
                    >
                    <IndianRupee className="w-3.5 h-3.5" />
                    </button>

                    
                    <button
                      onClick={() => setEditEmployee(emp)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    
                    {confirmId === emp._id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(emp._id)}
                          className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs rounded-lg font-semibold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(emp._id)}
                        className="p-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editEmployee && (
        <EmployeeModal employee={editEmployee} onClose={() => setEditEmployee(null)} />
      )}
      {attendanceEmployee && (
        <AttendanceDrawer employee={attendanceEmployee} onClose={() => setAttendanceEmployee(null)} />
      )}
      {payrollEmployee && (
  <PayrollDrawer
    employee={payrollEmployee}
    onClose={() => setPayrollEmployee(null)}
  />
)}
    </>
  );
}
