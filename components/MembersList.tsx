
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getMembers } from '../services/dataService';
import Avatar from './Avatar';
import { Loader2, Search, UserPlus } from 'lucide-react';

const MembersList: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      const data = await getMembers();
      setMembers(data);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

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
        <h2 className="text-xl font-bold mb-4">Club Members</h2>
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
                  <Avatar src={member.avatar} alt={member.name} />
                  <div>
                    <h3 className="font-bold text-text leading-tight">{member.name}</h3>
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-tighter">
                      {member.role}
                    </p>
                  </div>
                </div>
                <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-text-secondary transition-colors">
                  <UserPlus size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-text-secondary">
            <p>No members found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersList;
