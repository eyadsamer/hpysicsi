import {useNavigate} from 'react-router-dom';
import bannerImg from '../../assets/banner.png';

/**
 * Banner Component
 * Hero section with call-to-action buttons for Login and Sign-up
 */
const Banner = () => {
    const navigate = useNavigate();

    return (
        <section className="relative w-full aspect-[4/3] md:aspect-video lg:h-[800px] overflow-hidden bg-[#111827]">
            {/* Background Image */}
            <img
                src={bannerImg}
                alt="Physics Banner"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Content Overlay */}
            <div
                className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center md:items-end px-6 md:px-24 lg:px-48 text-white">
                <div className="flex flex-col gap-4 md:gap-6 w-full max-w-[280px] md:max-w-[320px] z-50">
                    <button
                        onClick={() => {
                            console.log('Login button clicked - Navigating to dashboard');
                            navigate('/dashboard');
                        }}
                        className="bg-physics-purple hover:bg-purple-700 text-white font-black py-4 md:py-5 px-10 md:px-14 rounded-xl md:rounded-2xl text-xl md:text-3xl transition-all shadow-[0_10px_30px_rgba(109,40,217,0.5)] active:scale-95 uppercase tracking-wider cursor-pointer"
                    >
                        Log-in
                    </button>

                    <button
                        onClick={() => {
                            console.log('Sign-up button clicked! Navigating...');
                            navigate('/signup');
                        }}
                        className="bg-physics-purple hover:bg-purple-700 text-white font-black py-4 md:py-5 px-10 md:px-14 rounded-xl md:rounded-2xl text-xl md:text-3xl transition-all shadow-[0_10px_30px_rgba(109,40,217,0.5)] active:scale-95 uppercase tracking-wider cursor-pointer"
                    >
                        Sign-up
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Banner;
