import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff, Building, Users } from 'lucide-react';

export default function Signup() {
  const [role, setRole] = useState<'owner' | 'employee'>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  
  // Owner specific
  const [orgName, setOrgName] = useState('');
  
  // Employee specific
  const [orgId, setOrgId] = useState('');
  const [organizations, setOrganizations] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'employee') {
      fetchOrganizations();
    }
  }, [role]);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase.from('organizations').select('id, name');
    if (!error) {
      setOrganizations(data || []);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (role === 'employee' && !orgId) {
        toast.error("Please select an organization");
        return;
    }
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            organization_name: role === 'owner' ? orgName : undefined,
            organization_id: role === 'employee' ? orgId : undefined,
          },
        },
      });
      
      if (error) throw error;
      
      toast.success('Account created! Please check your email to confirm.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join Stockpilot today</p>
        </div>

        {/* Role Selection */}
        <div className="flex rounded-md shadow-sm">
           <button
             type="button"
             onClick={() => setRole('owner')}
             className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-l-md ${
               role === 'owner' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
             }`}
           >
             <Building className="h-4 w-4" /> Owner
           </button>
           <button
             type="button"
             onClick={() => setRole('employee')}
             className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-r-md border-l-0 ${
               role === 'employee' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
             }`}
           >
             <Users className="h-4 w-4" /> Employee
           </button>
        </div>

        <form className="space-y-6" onSubmit={handleSignup}>
          
          {role === 'owner' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. My Retail Store"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Organization</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
              >
                <option value="">Select a company...</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
             <label className="block text-sm font-medium text-gray-700">Full Name</label>
             <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Email Address</label>
             <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Password</label>
             <div className="relative mt-1">
               <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
               >
                 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
               </button>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
             <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
             />
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign up
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
