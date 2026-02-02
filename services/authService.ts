
import { supabase } from './supabaseClient';
import { User } from '../types';

export const signUp = async (email: string, password: string, firstName: string, surname: string) => {
  const fullName = `${firstName} ${surname}`;
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        avatar_url: avatar,
        role: 'member',
      },
    },
  });

  if (!error && data.user) {
    // Insert into public profiles table
    await supabase.from('profiles').insert({
      id: data.user.id,
      name: fullName,
      avatar: avatar,
      role: 'member'
    });
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const updateProfile = async (updates: { name?: string; avatar?: string }) => {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: updates.name,
      avatar_url: updates.avatar,
    }
  });

  if (!error && data.user) {
    await supabase.from('profiles').update({
      name: updates.name,
      avatar: updates.avatar
    }).eq('id', data.user.id);
  }

  return { data, error };
};

export const mapSessionUser = (sessionUser: any): User | null => {
  if (!sessionUser) return null;
  const metadata = sessionUser.user_metadata || {};
  return {
    id: sessionUser.id,
    name: metadata.full_name || sessionUser.email?.split('@')[0] || 'Unknown',
    avatar: metadata.avatar_url || 'https://via.placeholder.com/100',
    role: metadata.role || 'member',
  };
};
