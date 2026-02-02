
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getMembers, removeMember, updateMemberRole, subscribeToMembers } from '../services/dataService';
import { supabase } from '../services/supabaseClient';
import { mapSessionUser } from '../services/authService';
import Avatar from './Avatar';
import ConfirmDialog from './ConfirmDialog';
import { Loader2, Search, UserPlus, Shield, UserMinus, ShieldAlert, ShieldCheck } from 'lucide-react';

const MembersList: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Admin action states
  const [memberToKick, setMemberToKick] = useState<User | null>(null);
  const [memberToPromote, setMemberToPromote] = useState<User | null>(null);

  const fetchMembers = async () => {
    const data = await getMembers();
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(mapSessionUser(session.user));
      }
      fetchMembers();
    };
    init();

    const unsubscribe = subscribeToMembers(() => {
      fetchMembers();
    });

    return () => unsubscribe();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = currentUser?.role === 'admin';

  const onConfirmKick = async () => {
    if (memberToKick) {
      await removeMember(memberToKick.id);
      setMemberToKick(null);
      fetchMembers();
    }
  };

  const onConfirmRoleChange = async () => {
    if (memberToPromote) {
      const newRole = memberToPromote.role === 'admin' ? 'member' : 'admin';
      await updateMemberRole(memberToPromote.id, newRole);
      setMemberToPromote(null);
      fetchMembers();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-20 pt-4 px-2">
      <div className="bg-surface rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Club Members
          <span className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full font-medium">
            {members.length} Total
          </span>
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredMembers.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredMembers.map(member => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={member.avatar} alt={member.name} />
                    {member.role === 'admin' && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                        <ShieldCheck size={14} className="text-primary fill-primary/10" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-text leading-tight flex items-center gap-1">
                      {member.name}
                      {member.id === currentUser?.id && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-black">You</span>}
                    </h3>
                    <p className={`text-[10px] uppercase font-black tracking-widest ${member.role === 'admin' ? 'text-primary' : 'text-text-secondary'}`}>
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && member.id !== currentUser?.id && (
                    <>
                      <button 
                        onClick={() => setMemberToPromote(member)}
                        className={`p-2 rounded-full transition-colors ${
                          member.role === 'admin' 
                            ? 'text-primary bg-primary/5 hover:bg-primary/10' 
                            : 'text-text-secondary hover:bg-gray-100'
                        }`}
                        title={member.role === 'admin' ? "Demote to Member" : "Promote to Admin"}
                      >
                        <Shield size={18} />
                      </button>
                      <button 
                        onClick={() => setMemberToKick(member)}
                        className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove from Club"
                      >
                        <UserMinus size={18} />
                      </button>
                    </>
                  )}
                  {!isAdmin && member.id !== currentUser?.id && (
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-text-secondary transition-colors">
                      <UserPlus size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-text-secondary">
            <p>No members found matching "{search}"</p>
          </div>
        )}
      </div>

      {/* Admin Action Confirmation Dialogs */}
      <ConfirmDialog 
        isOpen={!!memberToKick}
        title="Remove Member?"
        message={`Are you sure you want to remove ${memberToKick?.name} from the club? All their posts and comments will also be deleted.`}
        confirmLabel="Remove"
        onConfirm={onConfirmKick}
        onCancel={() => setMemberToKick(null)}
      />

      <ConfirmDialog 
        isOpen={!!memberToPromote}
        title={memberToPromote?.role === 'admin' ? "Demote Member?" : "Promote to Admin?"}
        message={
          memberToPromote?.role === 'admin' 
            ? `Do you want to demote ${memberToPromote?.name} to a regular member? They will lose all administrative privileges.`
            : `Are you sure you want to make ${memberToPromote?.name} an admin? They will have full control over the club.`
        }
        confirmLabel={memberToPromote?.role === 'admin' ? "Demote" : "Promote"}
        variant={memberToPromote?.role === 'admin' ? 'danger' : 'primary'}
        onConfirm={onConfirmRoleChange}
        onCancel={() => setMemberToPromote(null)}
      />
    </div>
  );
};

export default MembersList;
