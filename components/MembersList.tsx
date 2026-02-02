
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getMembers, removeMember, updateMemberRole, subscribeToMembers } from '../services/dataService';
import { supabase } from '../services/supabaseClient';
import { mapSessionUser } from '../services/authService';
import Avatar from './Avatar';
import ConfirmDialog from './ConfirmDialog';
import { Loader2, Search, UserPlus, Shield, UserMinus, ShieldCheck } from 'lucide-react';

const MembersList: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
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
      if (session?.user) setCurrentUser(mapSessionUser(session.user));
      fetchMembers();
    };
    init();
    const unsubscribe = subscribeToMembers(() => fetchMembers());
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-xl mx-auto pb-20 pt-4 px-2">
      <div className="bg-surface rounded-xl p-5 shadow-lg border border-border mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text">
          Club Members
          <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest">{members.length} Total</span>
        </h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
          <input 
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl pl-12 pr-5 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
        {filteredMembers.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredMembers.map(member => (
              <div key={member.id} className="p-5 flex items-center justify-between hover:bg-bg/40 active:bg-bg/60 transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Avatar src={member.avatar} alt={member.name} />
                    {member.role === 'admin' && (
                      <div className="absolute -top-1 -right-1 bg-surface rounded-full p-1 shadow-lg border border-border">
                        <ShieldCheck size={14} className="text-primary fill-primary/10" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-text leading-tight flex items-center gap-2">
                      {member.name}
                      {member.id === currentUser?.id && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase font-black">You</span>}
                    </h3>
                    <p className={`text-[10px] uppercase font-black tracking-[0.15em] ${member.role === 'admin' ? 'text-primary' : 'text-text-secondary'}`}>
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && member.id !== currentUser?.id && (
                    <>
                      <button 
                        onClick={() => setMemberToPromote(member)}
                        className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                          member.role === 'admin' ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-text-secondary hover:bg-bg'
                        }`}
                        title={member.role === 'admin' ? "Demote" : "Promote"}
                      >
                        <Shield size={20} />
                      </button>
                      <button 
                        onClick={() => setMemberToKick(member)}
                        className="p-2.5 rounded-xl text-red-400 hover:bg-red-900/20 active:scale-90 transition-all"
                        title="Remove"
                      >
                        <UserMinus size={20} />
                      </button>
                    </>
                  )}
                  {!isAdmin && member.id !== currentUser?.id && (
                    <button className="bg-bg hover:bg-border active:scale-90 p-2.5 rounded-xl text-text-secondary transition-all border border-border">
                      <UserPlus size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-text-secondary italic">No members found matching "{search}"</div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={!!memberToKick}
        title="Remove Member?"
        message={`Are you sure you want to remove ${memberToKick?.name} from the club?`}
        confirmLabel="Remove"
        onConfirm={onConfirmKick}
        onCancel={() => setMemberToKick(null)}
      />

      <ConfirmDialog 
        isOpen={!!memberToPromote}
        title={memberToPromote?.role === 'admin' ? "Demote Member?" : "Promote to Admin?"}
        message={memberToPromote?.role === 'admin' ? `Demote ${memberToPromote?.name} to regular member?` : `Make ${memberToPromote?.name} an administrator?`}
        confirmLabel={memberToPromote?.role === 'admin' ? "Demote" : "Promote"}
        variant={memberToPromote?.role === 'admin' ? 'danger' : 'primary'}
        onConfirm={onConfirmRoleChange}
        onCancel={() => setMemberToPromote(null)}
      />
    </div>
  );
};

export default MembersList;
