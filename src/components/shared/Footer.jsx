const Footer = () => {
    return (
        <footer className="py-20 bg-dark-bg text-white border-t border-white/5">
            <div className="max-w-5xl mx-auto px-6 text-center space-y-10">
                <div className="space-y-6">
                    <p className="text-3xl md:text-5xl font-serif italic leading-loose text-physics-purple/90 drop-shadow-sm"
                       dir="rtl">
                        ﴿ إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ
                        عَمَلًا ﴾
                    </p>
                    <p className="text-xl md:text-2xl text-gray-500 font-physics italic tracking-widest">
                        [ الكهف: 30 ]
                    </p>
                </div>

                <div
                    className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-600 uppercase tracking-widest text-sm font-bold">
                    <div>
                        © {new Date().getFullYear()} PHYSICS SYSTEM
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-physics-purple transition-colors">Privacy</a>
                        <a href="#" className="hover:text-physics-purple transition-colors">Terms</a>
                        <a href="#" className="hover:text-physics-purple transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
