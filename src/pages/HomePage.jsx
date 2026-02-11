import Banner from '../components/shared/Banner';
import Centers from '../components/shared/Centers';
import AboutUs from '../components/shared/AboutUs';
import Footer from '../components/shared/Footer';

/**
 * HomePage - The Landing Page of the application.
 * This page introduces the instructor, shows available centers,
 * and provides navigation to login/signup.
 */
const HomePage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section with Physics Branding */}
            <Banner/>

            {/* Main Content Areas */}
            <main className="flex-grow bg-[#111827]">
                {/* Physical locations where the teacher is available */}
                <Centers/>

                {/* Bio and System information */}
                <AboutUs/>

                {/*
            TODO: Add FeaturedCourses section here 
            as mentioned in the project requirements.
        */}
            </main>

            {/* Global Footer with Arabic Verse */}
            <Footer/>
        </div>
    );
};

export default HomePage;
