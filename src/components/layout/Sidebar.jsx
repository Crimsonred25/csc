import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Layers, ClipboardCheck, Trophy,
  Clock, LogOut, ChevronLeft, ChevronRight, Users,
  FileText, Shield, Menu, X, BrainCircuit } from
'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

const revieweeNav = [
{ label: 'Dashboard', icon: LayoutDashboard, path: '/' },
{ label: 'Review Guides', icon: BookOpen, path: '/guides' },
{ label: 'Flashcards', icon: Layers, path: '/flashcards' },
{ label: 'Exams', icon: ClipboardCheck, path: '/exams' },
{ label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
{ label: 'My Activity', icon: Clock, path: '/activity' },
{ label: 'Study Coach', icon: BrainCircuit, path: '/study-coach' }];


const adminNav = [
{ label: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin' },
{ label: 'User Management', icon: Users, path: '/admin/users' },
{ label: 'Manage Guides', icon: BookOpen, path: '/admin/guides' },
{ label: 'Manage Flashcards', icon: Layers, path: '/admin/flashcards' },
{ label: 'Manage Exams', icon: ClipboardCheck, path: '/admin/exams' },
{ label: 'Audit Log', icon: Shield, path: '/admin/audit' }];


export default function Sidebar({ user }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNav : revieweeNav;

  const handleLogout = () => {
    logout();
  };

  const NavContent = () =>
  <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="bg-slate-800 text-slate-950 p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed &&
        <div className="min-w-0">
              <h1 className="font-display font-bold text-sidebar-foreground text-sm truncate">CSC Review Hub</h1>
              <p className="text-xs text-sidebar-foreground/60 truncate">{isAdmin ? 'Admin Panel' : 'Learning Portal'}</p>
            </div>
        }
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-slate-800 p-3 flex-1 space-y-1 overflow-y-auto">
        {isAdmin &&
      <>
            <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                ${location.pathname === '/' ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}>
          
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Reviewee View</span>}
            </Link>
            <div className="border-b border-sidebar-border my-2" />
          </>
      }
        {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                ${isActive ?
            'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25' :
            'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`
            }>
            
              <item.icon className="lucide lucide-layout-dashboard w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>);

      })}
      </nav>

      {/* User section */}
      <div className="bg-slate-800 p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-sidebar-primary">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed &&
        <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate capitalize">{user?.role || 'reviewee'}</p>
            </div>
        }
        </div>
        <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all w-full mt-1">
        
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle - desktop only */}
      <div className="bg-slate-800 p-3 hidden lg:block border-t border-sidebar-border">
        <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent transition-all">
        
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>;


  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-md"
        onClick={() => setMobileOpen(true)}>
        
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen &&
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      }

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-sidebar-foreground"
          onClick={() => setMobileOpen(false)}>
          
          <X className="w-5 h-5" />
        </Button>
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col h-screen bg-sidebar sticky top-0 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
        <NavContent />
      </div>
    </>);

}