
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ChevronRight, Info } from 'lucide-react';

interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  attendees: number;
  image: string;
}

const mockEvents: ClubEvent[] = [
  {
    id: '1',
    title: 'Weekend Morning Hiking',
    description: 'Join us for a refreshing morning hike through the valley. Open to all skill levels.',
    date: 'March 15, 2026',
    month: 'MAR',
    day: '15',
    time: '07:30 AM',
    location: 'Valley National Park Gate',
    attendees: 24,
    image: 'https://images.unsplash.com/photo-1551632432-c735e7a03021?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Monthly Club Dinner',
    description: 'Our regular monthly social gathering. Great food and even better company.',
    date: 'March 22, 2026',
    month: 'MAR',
    day: '22',
    time: '07:00 PM',
    location: 'Downtown Bistro & Grill',
    attendees: 12,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'AI & Future Workshop',
    description: 'Learn how to use generative AI for productivity in this hands-on club workshop.',
    date: 'April 05, 2026',
    month: 'APR',
    day: '05',
    time: '02:00 PM',
    location: 'Club Community Center',
    attendees: 45,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop'
  }
];

const EventsList: React.FC = () => {
  const [joined, setJoined] = useState<string[]>([]);

  const toggleJoin = (id: string) => {
    if (joined.includes(id)) {
      setJoined(joined.filter(eventId => eventId !== id));
    } else {
      setJoined([...joined, id]);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-20 pt-4 px-2">
      <div className="bg-surface rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Upcoming Events
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Active
          </span>
        </h2>
        <p className="text-sm text-text-secondary mt-1">Don't miss out on our upcoming club activities.</p>
      </div>

      <div className="space-y-4">
        {mockEvents.map(event => (
          <div key={event.id} className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row">
            {/* Left: Image (on desktop) / Top: Image (on mobile) */}
            <div className="w-full sm:w-40 h-40 sm:h-auto relative shrink-0">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg p-1.5 flex flex-col items-center shadow-md min-w-[44px]">
                <span className="text-[10px] font-black text-primary uppercase leading-none">{event.month}</span>
                <span className="text-lg font-bold text-text leading-tight">{event.day}</span>
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg text-text leading-tight hover:text-primary cursor-pointer transition-colors">
                  {event.title}
                </h3>
              </div>
              
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Clock size={14} className="text-text-secondary" />
                  <span>{event.date} • {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <MapPin size={14} className="text-text-secondary" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Users size={14} className="text-text-secondary" />
                  <span>{event.attendees + (joined.includes(event.id) ? 1 : 0)} members attending</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => toggleJoin(event.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    joined.includes(event.id) 
                      ? 'bg-gray-100 text-text-secondary hover:bg-gray-200' 
                      : 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10'
                  }`}
                >
                  {joined.includes(event.id) ? 'Joined' : 'Join Event'}
                </button>
                <button className="p-2 bg-gray-50 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors border border-gray-100">
                  <Info size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {mockEvents.length === 0 && (
          <div className="bg-surface rounded-xl p-10 text-center border border-dashed border-gray-300">
            <Calendar className="mx-auto mb-2 opacity-20" size={48} />
            <p className="text-text-secondary">No upcoming events scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
