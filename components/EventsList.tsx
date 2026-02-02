
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import { ClubEvent, User } from '../types';
import { getEvents, toggleJoinEvent, subscribeToEvents, deleteEvent } from '../services/dataService';
import { supabase } from '../services/supabaseClient';
import { mapSessionUser } from '../services/authService';
import EventModal from './EventModal';
import ConfirmDialog from './ConfirmDialog';

const EventsList: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | undefined>();
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const fetchEvents = async () => {
    const data = await getEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setCurrentUser(mapSessionUser(session.user));
      fetchEvents();
    };
    init();
    const unsubscribe = subscribeToEvents(() => fetchEvents());
    return () => unsubscribe();
  }, []);

  const handleJoin = async (id: string) => {
    if (!currentUser) return;
    await toggleJoinEvent(id, currentUser.id);
    fetchEvents();
  };

  const handleDelete = async () => {
    if (eventToDelete) {
      await deleteEvent(eventToDelete);
      setEventToDelete(null);
      fetchEvents();
    }
  };

  const getMonthName = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    } catch { return 'EVENT'; }
  };

  const getDay = (dateStr: string) => {
    try { return new Date(dateStr).getDate(); } catch { return '??'; }
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
      <div className="bg-surface rounded-xl p-5 shadow-lg border border-border mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-text">
            Club Events
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Upcoming</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">Activities planned for the community.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingEvent(undefined); setShowModal(true); }}
            className="bg-primary text-white p-3 rounded-full shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all"
            title="Add New Event"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {events.map(event => {
          const isJoined = currentUser ? event.attendees.includes(currentUser.id) : false;
          return (
            <div key={event.id} className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col group transition-all hover:shadow-2xl">
              <div className="w-full h-48 relative overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
                <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md rounded-xl p-2 flex flex-col items-center shadow-2xl min-w-[50px] border border-border">
                  <span className="text-[10px] font-black text-primary uppercase leading-none">{getMonthName(event.date)}</span>
                  <span className="text-xl font-bold text-text leading-tight">{getDay(event.date)}</span>
                </div>
              </div>

              <div className="flex-1 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-text leading-tight group-hover:text-primary transition-colors">{event.title}</h3>
                  {isAdmin && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setEditingEvent(event); setShowModal(true); }}
                        className="p-2 text-text-secondary hover:bg-bg active:scale-90 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setEventToDelete(event.id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 active:scale-90 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-text-secondary line-clamp-2 mb-5 leading-relaxed">{event.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-xs font-bold text-text-secondary uppercase tracking-widest bg-bg/50 px-3 py-2 rounded-lg border border-border">
                    <Clock size={16} className="text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-text-secondary uppercase tracking-widest bg-bg/50 px-3 py-2 rounded-lg border border-border overflow-hidden">
                    <MapPin size={16} className="text-primary shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex -space-x-2">
                    {event.attendees.slice(0, 3).map((id, i) => (
                      <div key={id} className="w-8 h-8 rounded-full border-2 border-surface overflow-hidden bg-bg">
                        <img src={`https://ui-avatars.com/api/?name=User&background=random`} alt="Attendee" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {event.attendees.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-surface bg-bg flex items-center justify-center text-[10px] font-bold text-text-secondary">
                        +{event.attendees.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleJoin(event.id)}
                    className={`flex-1 max-w-[180px] py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                      isJoined ? 'bg-bg text-text-secondary hover:bg-border border border-border' : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join Event'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="bg-surface rounded-2xl p-20 text-center border-2 border-dashed border-border shadow-inner">
            <Calendar className="mx-auto mb-4 opacity-10 text-text" size={64} />
            <h3 className="font-bold text-xl text-text-secondary">No Events Scheduled</h3>
          </div>
        )}
      </div>

      {showModal && (
        <EventModal 
          event={editingEvent}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchEvents(); }}
        />
      )}

      <ConfirmDialog 
        isOpen={!!eventToDelete}
        title="Delete Event?"
        message="Are you sure you want to permanently delete this event?"
        onConfirm={handleDelete}
        onCancel={() => setEventToDelete(null)}
      />
    </div>
  );
};

export default EventsList;
