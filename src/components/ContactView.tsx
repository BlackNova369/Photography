import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';
import { BABY_IMAGES } from '../data/artworks';

interface ContactViewProps {
  initialSubject?: string;
}

export const ContactView: React.FC<ContactViewProps> = ({ initialSubject = '' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    initialSubject ? `Halo, aku ingin bertanya tentang karya: "${initialSubject}". ` : ''
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);

    try {
      // Mengirim data ke Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: '5dba8133-2dbd-4a67-9081-18cb0db9b6e7', // ACCESS KEY ANDA
          name: name,
          email: email,
          message: message,
          subject: `Pesan Baru dari Website - ${name}`, // Subjek email yang akan Anda terima
        }),
      });

      const result = await response.json();

      if (result.success) {
        sound.playTick(720);
        setIsSubmitted(true);
      } else {
        alert(`Maaf, pesan gagal terkirim: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Terjadi kesalahan jaringan. Silakan periksa koneksi Anda.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 md:px-12 lg:px-16 max-w-[1500px] mx-auto animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Kolom Kiri: Teks & Kontak */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <h1 className="font-condensed text-7xl sm:text-8xl md:text-[110px] leading-[0.84] text-ink-900 tracking-tight mb-6">
            PESAN
          </h1>

          <div className="w-12 h-[1px] bg-neutral-300 mb-8" />

          {/* Paragraf dipecah agar lebih enak dibaca */}
          <div className="space-y-5 text-neutral-600 text-sm sm:text-base leading-relaxed max-w-md mb-8">
            <p>
              Ada sesuatu yang ingin kamu sampaikan? Kirimkan aku pesan. 
              Aku ingin mendengarnya, entah itu sebuah pemikiran kecil, 
              pertanyaan, atau sekadar sesuatu yang ingin kamu ceritakan.
            </p>
            <p>
              Bahkan balasan sekecil apa pun darimu adalah momen yang sangat 
              aku nantikan, lebih dari yang kamu tahu.
            </p>
          </div>

          {/* Tanda Tangan Elegan */}
          <div className="text-[11px] font-mono tracking-[0.16em] text-neutral-400 uppercase mb-8">
            — RANO · DAEVA
          </div>

          {/* Big Email Link */}
          <div className="mb-10">
            <a
              href="mailto:rano.aldinno@gmail.com"
              className="inline-flex items-center gap-1.5 text-2xl sm:text-3xl font-normal text-ink-900 hover:text-neutral-600 transition-colors group"
            >
              <span>rano.aldinno@gmail.com</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Kolom Kanan: Foto & Form */}
        <div className="lg:col-span-7 relative flex items-center justify-center min-h-[500px]">
          
          {/* Bingkai Foto di Belakang */}
          <div
            className="absolute right-0 top-0 w-3/4 max-w-lg aspect-[4/3] rounded-xs overflow-hidden bg-[#EBE7DE] p-2.5 shadow-2xl pointer-events-none hidden sm:block opacity-90"
            style={{
              transform: 'rotate(4deg) scale(0.96)',
              transformOrigin: 'top right',
            }}
          >
            <img
              src={BABY_IMAGES[1]}
              alt="Baby Print"
              className="w-full h-full object-cover rounded-2xs"
            />
          </div>

          {/* Kartu Formulir Kaca */}
          <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 z-10 shadow-2xl border border-white/70">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4 animate-in zoom-in-95 fade-in duration-500">
                <CheckCircle2 className="w-12 h-12 text-ink-900 mx-auto" />
                <h3 className="font-condensed text-3xl tracking-wide text-ink-900">
                  PESAN TERKIRIM
                </h3>
                <p className="text-neutral-600 text-sm max-w-xs mx-auto leading-relaxed">
                  Terima kasih, <span className="font-semibold text-ink-900">{name}</span>. 
                  Pesanmu sudah aku terima. Aku akan segera membalasnya untukmu. ❤️
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="mt-4 px-6 py-2 rounded-full border border-neutral-300 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:bg-neutral-100 transition-colors"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-neutral-500 uppercase">
                    KIRIM PESAN
                  </span>
                  <span className="font-mono text-[11px] tracking-wider text-neutral-400">
                    01 / 01
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase mb-1.5">
                      NAMA
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Siapa namamu?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/70 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-ink-900 transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase mb-1.5">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Alamat emailmu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/70 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-ink-900 transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase mb-1.5">
                    PESAN
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder="Tulis apa pun yang ingin kamu sampaikan di sini..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white/70 border border-neutral-200/80 rounded-xl p-3.5 text-sm text-ink-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-ink-900 resize-none leading-relaxed transition-shadow"
                  />
                </div>

                <div className="pt-2 flex items-center">
                  <button
                    type="submit"
                    disabled={isSending}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-ink-900 text-white text-xs font-semibold tracking-[0.12em] uppercase transition-all shadow-sm active:scale-95 ${
                      isSending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black'
                    }`}
                  >
                    <span>{isSending ? 'MENGIRIM...' : 'KIRIM'}</span>
                    {!isSending && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};