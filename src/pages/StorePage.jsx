import { useNavigate } from 'react-router-dom';

/**
 * StorePage Component
 * Page where students can purchase new revisions/courses
 */
const StorePage = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with real data later
  const availableRevisions = [
    {
      id: 5,
      title: "REVISION-5",
      chapter: "Chapter-5",
      lessons: "From lesson 1 till lesson 2",
      price: "150 EGP"
    },
    {
      id: 6,
      title: "REVISION-6",
      chapter: "Chapter-6",
      lessons: "From lesson 1 till lesson 3",
      price: "200 EGP"
    },
    {
      id: 7,
      title: "REVISION-7",
      chapter: "Chapter-7",
      lessons: "Only one lesson",
      price: "100 EGP"
    },
    {
      id: 8,
      title: "REVISION-8",
      chapter: "Chapter-8",
      lessons: "Only one lesson",
      price: "100 EGP"
    }
  ];

  const handleBuy = (revisionId) => {
    console.log(`Buying revision ${revisionId}`);
    // TODO: Add purchase logic
  };

  return (
    <div className="min-h-screen bg-[#111827] p-6 md:p-8 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-white text-5xl md:text-7xl font-physics italic uppercase mb-2 tracking-wider flex items-center gap-4">
            GET NEW REVISIONS
            <span className="text-physics-purple text-6xl md:text-8xl">+</span>
          </h1>
        </div>

        {/* Available Revisions Grid */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-6 min-w-max">
            {availableRevisions.map((revision) => (
              <div 
                key={revision.id}
                className="bg-[#1F2937] border-4 border-physics-purple rounded-[30px] p-8 flex flex-col items-center justify-between min-w-[320px] min-h-[400px]"
              >
                <div className="flex flex-col items-center flex-grow justify-center">
                  <h3 className="text-white text-4xl font-physics italic uppercase mb-4 tracking-wider">
                    {revision.title}
                  </h3>
                  <p className="text-white text-3xl font-bold mb-2">
                    {revision.chapter}
                  </p>
                  <p className="text-white text-xl mb-6 text-center">
                    {revision.lessons}
                  </p>
                </div>

                <button 
                  onClick={() => handleBuy(revision.id)}
                  className="bg-physics-purple hover:bg-purple-700 text-white font-black py-3 px-16 rounded-2xl text-2xl transition-all shadow-[0_10px_30px_rgba(109,40,217,0.5)] active:scale-95 uppercase tracking-wider"
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-physics-purple transition-colors uppercase tracking-widest font-bold text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorePage;
