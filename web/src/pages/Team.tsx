import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Mail, Plus, Clock, Trash2 } from 'lucide-react';

export default function Team() {
  const [role, setRole] = useState('employee');
  const [email, setEmail] = useState('');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    checkRole();
    fetchInvitations();
  }, []);

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (data) setRole(data.role);
    }
  };

  const fetchInvitations = async () => {
    setLoading(true);
    const { data } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });
    setInvitations(data || []);
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('invitations').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Invitation removed');
      setDeleteId(null);
      fetchInvitations();
    } catch (error: any) {
      toast.error("Error removing invitation: " + error.message);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get Org ID
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
      
      if (!profile?.organization_id) throw new Error("No organization found");

      const { error } = await supabase.from('invitations').insert({
        email,
        organization_id: profile.organization_id,
        role: 'employee'
      });

      if (error) throw error;
      
      toast.success('Invitation sent successfully!');
      setEmail('');
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (role !== 'owner') {
    return <div className="p-8 text-center text-gray-500">Only owners can manage teams.</div>;
  }

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
       
       {/* Invite Form */}
       <div className="bg-white p-6 rounded-lg shadow-sm border">
         <h2 className="text-lg font-medium text-gray-900 mb-4">Invite New Member</h2>
         <form onSubmit={handleInvite} className="flex gap-4">
           <div className="flex-1 relative">
             <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
             <input
               type="email"
               required
               placeholder="Enter employee email address"
               className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
             />
           </div>
           <button
             type="submit"
             className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 flex items-center gap-2"
           >
             <Plus className="h-4 w-4" /> Send Invite
           </button>
         </form>
         <p className="mt-2 text-xs text-gray-500">
           Note: This adds the user to the pending list.
         </p>
       </div>

       {/* List */}
       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
         <div className="px-6 py-4 border-b bg-gray-50">
           <h3 className="text-sm font-medium text-gray-700">Pending Invitations</h3>
         </div>
         {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
         ) : invitations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No pending invitations.</div>
         ) : (
           <ul className="divide-y divide-gray-200">
             {invitations.map((invite) => (
               <li key={invite.id} className="px-6 py-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="bg-gray-100 p-2 rounded-full">
                     <Clock className="h-5 w-5 text-gray-500" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-900">{invite.email}</p>
                     <p className="text-xs text-gray-500">Role: {invite.role} • Status: {invite.status}</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => setDeleteId(invite.id)}
                   className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors" 
                   title="Cancel Invite"
                 >
                   <Trash2 className="h-4 w-4" />
                 </button>
               </li>
             ))}
           </ul>
         )}
       </div>

       {/* Delete Confirmation Modal */}
       {deleteId && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
             <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Removal</h3>
             <p className="text-gray-600 mb-6">Are you sure you want to remove this invitation? This action cannot be undone.</p>
             <div className="flex justify-end gap-3">
               <button 
                 onClick={() => setDeleteId(null)} 
                 className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={confirmDelete} 
                 className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
               >
                 Remove
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
