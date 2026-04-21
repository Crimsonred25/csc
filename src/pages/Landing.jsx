import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft, User, Lock, Mail, Hash, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';

const INTERNAL_ID_REGEX = /^[A-Za-z]{2}\\d{5}$/;

export default function Landing() {
  const [view, setView] = useState('main'); // 'main' | 'services' | 'pending'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { completeProfile } = useAuth();

  const { completeProfile } = useAuth();\n\n  const [signupForm, setSignupForm] = useState({ full_name: '', email: '', password: '', id_number: '' });\n\n  const handleSignIn = () => {\n    // Firebase handles in AuthContext\n  };\n\n  const handleSignup = async (e) => {\n    e.preventDefault();\n    setLoading(true);\n    try {\n      const userCredential = await createUserWithEmailAndPassword(auth, signupForm.email, signupForm.password);\n      await completeProfile({\n        full_name: signupForm.full_name,\n        id_number: signupForm.id_number.trim(),\n      });\n    } catch (err) {\n      toast({\n        title: 'Registration Failed',\n        description: err.message,\n        variant: 'destructive',\n      });\n    }\n    setLoading(false);\n  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6 lg:p-10 bg-gradient-to-br from-slate-100 to-slate-200 font-sans">
      <div className="h-screen md:h-auto w-full max-w-[1300px] flex flex-col md:flex-row bg-white md:rounded-2xl shadow-2xl overflow-hidden border border-slate-200/60 md:min-h-[600px]">

        {/* Left Panel - Hero */}
        <div className="hidden md:flex flex-col md:w-1/2 lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-[#0b3d91] via-[#1a56b8] to-[#0f3a7d]">
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b3d91] via-transparent to-transparent" />
          <div className="relative z-10 w-full h-full flex flex-col justify-end p-10 lg:p-16 text-white">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Department_of_Transportation_%28Philippines%29.svg/330px-Department_of_Transportation_%28Philippines%29.svg.png"
                alt="DOTr Logo"
                className="w-16 h-16 object-contain mb-6"
              />
              <h1 className="text-4xl lg:text-5xl font-extrabold font-display leading-tight tracking-tight mb-4">
                Welcome to the<br /><span className="text-blue-300">CSC Review Hub</span>
              </h1>
              <p className="text-white/80 text-lg font-light leading-relaxed max-w-xl mb-8">
                A comprehensive learning portal for Civil Service Examination preparation, featuring flashcards, practice exams, and review guides for DOTr employees.
              </p>
              <button
                onClick={() => setView('services')}
                className="group bg-white text-[#0b3d91] hover:bg-gray-50 font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3 w-max"
              >
                Explore Services
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col flex-1 relative overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* MAIN VIEW - Combined Sign In + Registration */}
{view === 'login' && (
  <motion.div
    key="login"
    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="w-full max-w-md mx-auto flex flex-col justify-center flex-1 px-8 md:px-12 py-10"
  >
    <div className="text-center space-y-1 mb-7">
      <div className="w-20 h-20 mx-auto flex items-center justify-center mb-3">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Department_of_Transportation_%28Philippines%29.svg/330px-Department_of_Transportation_%28Philippines%29.svg.png"
          alt="DOTr Logo"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold font-display text-[#0f172a] tracking-tight">CSC Review Hub</h2>
      <p className="text-slate-500 text-sm font-medium">Welcome back</p>
    </div>

    <form onSubmit={handleSignIn} className="space-y-3" autoComplete="off">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Mail className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="email" required placeholder="Email Address"
          value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
          className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#1a56b8] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 text-gray-900 text-sm font-medium"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type={showPass ? 'text' : 'password'} required placeholder="Password" minLength={8}
          value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
          className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#1a56b8] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 text-gray-900 text-sm font-medium"
        />
        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full bg-[#0b3d91] hover:bg-[#1a56b8] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base flex justify-center items-center gap-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          <>Sign In <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </form>

    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={() => setView('register')}
        className="text-sm text-[#1a56b8] hover:text-[#0b3d91] font-medium underline"
      >
        Don't have an account? Create one
      </button>
    </div>
  </motion.div>)

  {view === 'register' && (
    <motion.div
      key="register"
      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto flex flex-col justify-center flex-1 px-8 md:px-12 py-10"
    >
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md mx-auto flex flex-col justify-center flex-1 px-8 md:px-12 py-10"
              >
                {/* Logo + Title */}
                <div className="text-center space-y-1 mb-7">
                  <div className="w-20 h-20 mx-auto flex items-center justify-center mb-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Department_of_Transportation_%28Philippines%29.svg/330px-Department_of_Transportation_%28Philippines%29.svg.png"
                      alt="DOTr Logo"
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-display text-[#0f172a] tracking-tight">CSC Review Hub</h2>
                  <p className="text-slate-500 text-sm font-medium">Sign in or create an account to get started</p>
                </div>

                {/* Sign In */}
                <div className="mb-5">\n                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Existing User</p>\n                  <button\n                    type="button"
                    onClick={() => window.location.reload()}
                    className="w-full bg-[#0b3d91] hover:bg-[#1a56b8] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base flex justify-center items-center gap-2"\n                  >\n                    Sign In <ArrowRight className="w-4 h-4" />\n                  </button>\n                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400 font-medium">NEW HERE? CREATE AN ACCOUNT</span></div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSignup} className="space-y-3" autoComplete="off">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text" required placeholder="Full Name"
                      value={signupForm.full_name} onChange={e => setSignupForm({ ...signupForm, full_name: e.target.value })}
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#1a56b8] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 text-gray-900 text-sm font-medium"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email" required placeholder="Email Address"
                      value={signupForm.email} onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#1a56b8] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 text-gray-900 text-sm font-medium"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text" required placeholder="ID Number (e.g. AB12345)"
                      value={signupForm.id_number} onChange={e => setSignupForm({ ...signupForm, id_number: e.target.value })}
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#1a56b8] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 text-gray-900 text-sm font-medium"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'} required placeholder="Password (min. 8 characters)" minLength={8}
                      value={signupForm.password} onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#1a56b8] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 text-gray-900 text-sm font-medium"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full border-2 border-[#0b3d91] text-[#0b3d91] hover:bg-[#0b3d91] hover:text-white disabled:opacity-70 font-bold py-3.5 px-6 rounded-xl transition-all text-sm flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-[#0b3d91] text-sm mb-1">📋 About Account Approval</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    DOTr employees (ID format: XX#####) are automatically verified. External applicants require manual admin approval.
                  </p>
                </div>
              </motion.div>
            )}

            {/* SERVICES VIEW */}
            {view === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col justify-center min-h-full p-8 md:p-12 lg:p-14 bg-white"
              >
                <div className="w-full max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <h2 className="text-2xl font-extrabold font-display text-gray-900">Portal Services</h2>
                    <button onClick={() => setView('main')} className="text-sm font-bold text-[#1a56b8] hover:text-[#0b3d91] bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'CSC Review Hub', desc: 'Comprehensive review materials, flashcards, and simulated exams for Civil Service Examination preparation.' },
                      { label: 'IPAR', desc: 'A performance management module for documenting, tracking, and assessing individual accomplishments.' },
                      { label: 'PNPKI Application', desc: 'A secure gateway for managing PNPKI digital certificates and trusted authentication.' },
                      { label: 'ISSP', desc: 'A strategic tool for planning, implementing, and monitoring IT projects and compliance initiatives.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-5 p-5 border border-slate-200 hover:border-[#1a56b8] hover:shadow-md bg-white rounded-2xl transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#1a56b8] flex-shrink-0 group-hover:bg-[#1a56b8] group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold font-display text-gray-900 text-base">{item.label}</h4>
                          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PENDING VIEW */}
            {view === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-full p-8 text-center flex-1"
              >
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Account Pending Review</h2>
                <p className="text-gray-500 max-w-sm mb-2">
                  Your account has been created and is awaiting administrator approval. You'll be notified once your account is activated.
                </p>
                <p className="text-sm text-gray-400 mb-6">Account registered: <span className="font-semibold text-gray-600">{signupForm.email}</span></p>
                <button
                  onClick={() => { setView('main'); setSignupForm({ full_name: '', email: '', password: '', id_number: '' }); }}
                  className="flex items-center gap-2 text-[#1a56b8] font-semibold hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}