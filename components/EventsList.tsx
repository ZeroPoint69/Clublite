
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Info, Plus, Loader2, Edit2, Trash2, AlertCircle } from 'lucide-react';
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
      if (session?.user) {
        setCurrentUser(mapSessionUser(session.user));
      }
      fetchEvents();
    };
    init();

    const unsubscribe = subscribeToEvents(() => {
      fetchEvents();
    });

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
    } catch {
      return 'EVENT';
    }
  };

  const getDay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.getDate();
    } catch {
      return '??';
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
      <div className="bg-surface rounded-xl p-4 shadow-sm border border-gray-200 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Club Events
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Upcoming
            </span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">Activities planned for the community.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingEvent(undefined); setShowModal(true); }}
            className="bg-primary text-white p-2.5 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            title="Add New Event"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {events.map(event => {
          const isJoined = currentUser ? event.attendees.includes(currentUser.id) : false;
          
          return (
            <div key={event.id} className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row group transition-all hover:shadow-md">
              {/* Left: Image */}
              <div className="w-full sm:w-44 h-44 sm:h-auto relative shrink-0">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg p-1.5 flex flex-col items-center shadow-md min-w-[44px]">
                  <span className="text-[10px] font-black text-primary uppercase leading-none">{getMonthName(event.date)}</span>
                  <span className="text-lg font-bold text-text leading-tight">{getDay(event.date)}</span>
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-text leading-tight group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingEvent(event); setShowModal(true); }}
                        className="p-1.5 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setEventToDelete(event.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">
                  {event.description}
                </p>
                
                <div className="space-y-1 mt-auto">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                    <Clock size={12} className="text-gray-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                    <Users size={12} className="text-gray-400" />
                    <span>{event.attendees.length} attending</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button 
                    onClick={() => handleJoin(event.id)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      isJoined 
                        ? 'bg-gray-100 text-text-secondary hover:bg-gray-200' 
                        : 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10 active:scale-95'
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
          <div className="bg-surface rounded-xl p-16 text-center border-2 border-dashed border-gray-200">
            <Calendar className="mx-auto mb-3 opacity-20 text-gray-400" size={56} />
            <h3 className="font-bold text-lg text-text">No Events Scheduled</h3>
            <p className="text-text-secondary text-sm mt-1 max-w-[200px] mx-auto">
              Check back later or contact an admin for club activities.
            </p>
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
        message="Are you sure you want to permanently delete this event? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setEventToDelete(null)}
      />
    </div>
  );
};

export default EventsList;
