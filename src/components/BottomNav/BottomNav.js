import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { House, Sword, User } from '@phosphor-icons/react';
import styles from './BottomNav.module.css';

export default function BottomNav({ active = 'home' }) {
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/story') || location.pathname.startsWith('/challenge') || location.pathname.startsWith('/freeplay')) return 'play';
    if (location.pathname.startsWith('/settings') || location.pathname.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav className={styles.nav}>
      <NavLink to="/" className={`${styles.tab} ${activeTab === 'home' ? styles.active : ''}`}>
        <House size={24} weight={activeTab === 'home' ? 'fill' : 'regular'} />
        <span>Home</span>
      </NavLink>
      
      <NavLink to="/story" className={`${styles.tab} ${activeTab === 'play' ? styles.active : ''}`}>
        <Sword size={24} weight={activeTab === 'play' ? 'fill' : 'regular'} />
        <span>Jogar</span>
      </NavLink>
      
      <NavLink to="/settings" className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}>
        <User size={24} weight={activeTab === 'profile' ? 'fill' : 'regular'} />
        <span>Perfil</span>
      </NavLink>
    </nav>
  );
}
