
import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Calendar, Clock, MapPin, Type, AlignLeft, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';
import { ClubEvent } from '../types';
import { createEvent, updateEvent } from '../services/dataService';

interface EventModalProps {
  event?: ClubEvent;
  onClose: () => void;
  onSuccess: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    time: event?.time || '',
    location: event?.location || '',
    image: event?.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=2070&auto=format&fit=crop'
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (event) {
        await updateEvent(event.id, formData);
      } else {
        await createEvent({ ...formData, attendees: [] });
      }
      onSuccess();
    } catch (err) {
      console.error("Event operation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg/90 backdrop-blur-md" onClick={onClose} />
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 border border-border">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-bg/30">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <Calendar className="text-primary" size={24} />
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:bg-bg p-1.5 rounded-full transition-colors active:scale-90">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* Image Preview & Upload Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1">
              <ImageIcon size={14} /> Event Cover Photo
            </label>
            <div className="relative group rounded-xl overflow-hidden border border-border bg-bg aspect-video shadow-inner">
              <img 
                src={formData.image} 
                alt="Event cover" 
                className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-bg/40 backdrop-blur-[2px]">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-surface border border-border text-text px-4 py-2 rounded-lg font-bold shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
                >
                  <Upload size={18} /> Change Photo
                </button>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="flex gap-2">
               <input
                type="url"
                value={formData.image.startsWith('data:') ? '' : formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                className="flex-1 bg-bg border border-border rounded-xl px-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-all"
                placeholder="Or paste image URL here..."
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-bg text-text-secondary px-3 py-2 rounded-xl text-xs font-bold hover:text-text border border-border transition-colors active:scale-95"
              >
                Upload Device
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1">
              <Type size={14} /> Event Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-text"
              placeholder="e.g. Monthly Club Social"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1">
              <AlignLeft size={14} /> Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-text resize-none"
              placeholder="Tell members more about the event..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1">
                <Calendar size={14} /> Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-text"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1">
                <Clock size={14} /> Time
              </label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-text"
                placeholder="07:00 PM"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1">
              <MapPin size={14} /> Location
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-text"
              placeholder="e.g. City Park, Room 402"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 rounded-xl font-bold text-text-secondary bg-bg border border-border hover:bg-surface transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3.5 rounded-xl font-bold text-bg bg-primary hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : (event ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
