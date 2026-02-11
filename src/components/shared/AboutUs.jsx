const AboutUs = () => {
    return (
        <section className="py-24 bg-dark-bg text-white px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
                {/* Instructor Bio Section */}
                <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                    <div className="inline-block border-l-8 border-physics-purple pl-6">
                        <h2 className="text-5xl md:text-7xl font-physics italic tracking-tighter uppercase leading-none">
                            Who Are We?
                        </h2>
                    </div>
                    <div className="text-xl md:text-2xl text-gray-400 leading-relaxed font-light space-y-6">
                        <p>
                            Driven by a passion for science and a commitment to excellence, we
                            provide a premium physics education designed for the modern
                            student. Our approach combines rigorous academic standards with
                            intuitive teaching methods.
                        </p>
                        <p>
                            With years of experience in simplifying the complex, we've helped
                            hundreds of students unlock their potential and achieve
                            outstanding results in their academic journeys.
                        </p>
                    </div>
                </div>

                {/* System Information Section */}
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-1000">
                    <div className="inline-block border-l-8 border-physics-purple pl-6">
                        <h2 className="text-5xl md:text-7xl font-physics italic tracking-tighter uppercase leading-none">
                            Our System
                        </h2>
                    </div>
                    <div className="text-xl md:text-2xl text-gray-400 leading-relaxed font-light space-y-6">
                        <p>
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facilis
                            expedita quis voluptatum quia autem, omnis dolorum a vitae eius
                            tenetur impedit reiciendis. Consectetur aliquam cupiditate magnam
                            quasi earum. Iusto, voluptate!
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4">
                                <span
                                    className="w-3 h-3 bg-physics-purple rounded-full shadow-[0_0_10px_rgba(109,40,217,0.8)]"></span>
                                <span>lorem ipsum</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span
                                    className="w-3 h-3 bg-physics-purple rounded-full shadow-[0_0_10px_rgba(109,40,217,0.8)]"></span>
                                <span>lorem ipsum</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span
                                    className="w-3 h-3 bg-physics-purple rounded-full shadow-[0_0_10px_rgba(109,40,217,0.8)]"></span>
                                <span>lorem ipsum</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
