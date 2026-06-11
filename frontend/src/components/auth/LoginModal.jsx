import { useState, useRef, useEffect } from 'react';
import { X, Phone, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'name'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) { setStep('phone'); setPhone(''); setOtp(['', '', '', '', '', '']); setName(''); }
  }, [isOpen]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setStep('otp');
      setCountdown(60);
      toast.success('OTP sent!');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      setTimeout(() => verifyOTP(newOtp.join('')), 100);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (otpValue) => {
    const otpStr = otpValue || otp.join('');
    if (otpStr.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: otpStr, name: name || undefined });
      login(res.data.token, res.data.user);
      toast.success(res.data.message);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-cinema-card border border-cinema-border rounded-2xl p-8 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">B</span>
          </div>
          <div>
            <p className="font-display font-bold text-lg text-white">BollywoodReal</p>
            <p className="text-gray-500 text-xs">Sign in to rate & review</p>
          </div>
        </div>

        {step === 'phone' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-1">Welcome!</h2>
              <p className="text-gray-400 text-sm">Enter your mobile number to continue</p>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-gray-400 text-sm font-medium">🇮🇳 +91</span>
                <div className="w-px h-5 bg-cinema-border" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => e.key === 'Enter' && sendOTP()}
                placeholder="Mobile Number"
                className="input pl-24 text-lg tracking-widest"
                autoFocus
              />
            </div>
            <button onClick={sendOTP} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
            </button>
            <p className="text-center text-gray-500 text-xs">OTP via SMS • Indian numbers only</p>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-1">Enter OTP</h2>
              <p className="text-gray-400 text-sm">Sent to +91 {phone} <button onClick={() => setStep('phone')} className="text-brand-400 hover:underline">Change</button></p>
            </div>
            <div className="flex gap-2 justify-between">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="tel"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-cinema-muted border border-cinema-border rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                  maxLength={1}
                />
              ))}
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Your name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="input"
              />
            </div>
            <button onClick={() => verifyOTP()} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Shield size={16} /><span>Verify & Login</span></>}
            </button>
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-gray-500 text-sm">Resend in {countdown}s</p>
              ) : (
                <button onClick={sendOTP} className="text-brand-400 text-sm hover:underline">Resend OTP</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
