import { useNavigate } from 'react-router-dom';

/**
 * StudentDashboard Component
 * Main dashboard for students showing recent video progress and available revisions
 */
const StudentDashboard = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with real data later
  const recentVideo = {
    title: "Chapter 1 - Lesson 3",
    progress: 75,
    totalParts: 4,
    completedParts: 3
  };

  const revisions = [
    {
      id: 1,
      title: "REVISION-1",
      chapter: "Chapter-1",
      lessons: "From lesson 1 till lesson 6"
    },
    {
      id: 2,
      title: "REVISION-2",
      chapter: "Chapter-2",
      lessons: "From lesson 1 till lesson 5"
    },
    {
      id: 3,
      title: "REVISION-3",
      chapter: "Chapter-3",
      lessons: "From lesson 1 till lesson 4"
    },
    {
      id: 4,
      title: "REVISION-4",
      chapter: "Chapter-4",
      lessons: "From lesson 1 till lesson 3"
    }
  ];

  return (
    <div className="min-h-screen bg-[#111827] p-6 md:p-8 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          
          {/* Video Progress Card */}
          <div className="relative bg-[#1F2937] border-4 border-physics-purple rounded-[40px] p-8 overflow-hidden min-h-[300px]">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 flex items-center justify-center">
                <div 
                  className="w-0 h-0 border-l-[60px] border-l-physics-purple border-t-[40px] border-t-transparent border-b-[40px] border-b-transparent ml-4"
                />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-20 flex">
              <div 
                className="bg-physics-purple flex items-center justify-center text-white font-black text-3xl"
                style={{ width: '75%' }}
              >
                75%
              </div>
              <div 
                className="bg-white flex items-center justify-center text-[#1F2937] font-black text-3xl"
                style={{ width: '25%' }}
              >
                25%
              </div>
            </div>
          </div>

          {/* Get New Revisions Card */}
          <div className="bg-[#1F2937] border-4 border-physics-purple rounded-[40px] p-8 flex flex-col items-center justify-center min-h-[300px]">
            <h2 className="text-white text-4xl md:text-5xl font-physics italic uppercase text-center mb-8 tracking-wider">
              GET<br />NEW REVISIONS
            </h2>
            <button 
              onClick={() => navigate('/store')}
              className="bg-physics-purple hover:bg-purple-700 w-32 h-32 flex items-center justify-center rounded-xl transition-all shadow-[0_10px_30px_rgba(109,40,217,0.5)] active:scale-95 cursor-pointer"
            >
              <div className="text-white text-8xl font-bold leading-none">+</div>
            </button>
          </div>
        </div>

        {/* Revisions Section */}
        <div>
          <h2 className="text-white text-5xl md:text-6xl font-physics italic uppercase mb-8 tracking-wider">
            YOUR REVISIONS
          </h2>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-6 min-w-max">
              {revisions.map((revision) => (
                <div 
                  key={revision.id}
                  className="bg-[#1F2937] border-4 border-physics-purple rounded-[30px] p-8 flex flex-col items-center min-w-[320px]"
                >
                  <h3 className="text-white text-4xl font-physics italic uppercase mb-4 tracking-wider">
                    {revision.title}
                  </h3>
                  <p className="text-white text-3xl font-bold mb-2">
                    {revision.chapter}
                  </p>
                  <p className="text-white text-xl mb-6 text-center">
                    {revision.lessons}
                  </p>
                  <button className="bg-physics-purple hover:bg-purple-700 text-white font-black py-3 px-12 rounded-2xl text-2xl transition-all shadow-[0_10px_30px_rgba(109,40,217,0.5)] active:scale-95 uppercase tracking-wider">
                    Enter
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-physics-purple transition-colors uppercase tracking-widest font-bold text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
