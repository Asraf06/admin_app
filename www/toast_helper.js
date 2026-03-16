        // --- TOAST NOTIFICATION ---
        function showToast(message, duration = 3000) {
            let toast = document.getElementById('toast-notification');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'toast-notification';
                toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.3)] text-xs font-bold uppercase tracking-widest z-[200] opacity-0 transition-opacity duration-300 pointer-events-none transform translate-y-2';
                document.body.appendChild(toast);
                
                // Add show class style
                const style = document.createElement('style');
                style.innerHTML = `
                    #toast-notification.show { opacity: 1; transform: translate(-50%, 0); }
                `;
                document.head.appendChild(style);
            }
            
            toast.innerText = message;
            // Force reflow
            void toast.offsetWidth;
            
            toast.classList.add('show');
            toast.classList.remove('opacity-0', 'translate-y-2'); // Tailwind fallback
            
            if (window.toastTimeout) clearTimeout(window.toastTimeout);
            
            window.toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
                toast.classList.add('opacity-0', 'translate-y-2');
            }, duration);
        }
