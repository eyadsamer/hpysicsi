const Centers = () => {
    const centers = ["Faysal", "October", "Dokki"];

    return (
        <section className="py-20 bg-dark-bg text-white text-center">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl md:text-7xl font-physics mb-12 italic tracking-tighter uppercase text-white/90">
                    Available Centers
                </h2>
                <div className="flex flex-wrap justify-center gap-6">
                    {centers.map((center) => (
                        <div
                            key={center}
                            className="bg-physics-purple/10 border-2 border-physics-purple/30 text-physics-purple font-black py-4 px-12 rounded-2xl text-2xl md:text-4xl transition-all shadow-[0_0_20px_rgba(109,40,217,0.2)] hover:bg-physics-purple hover:text-white hover:border-physics-purple cursor-default"
                        >
                            {center}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Centers;
