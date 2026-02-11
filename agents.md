# AI Agent Instructions for Teaching Platform Development

## Project Overview

You are building a single-instructor teaching platform (similar to Udemy but for one teacher). This is a 6-page React
application that must be completed within 1 month. The developer has limited JavaScript/React experience, so provide
clear, well-commented code with defensive error handling.

## Tech Stack (MANDATORY)

- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS (match Figma design provided by user)
- **Language**: JavaScript (NOT TypeScript - developer is new to JS)
- **Backend**: Supabase (auth, database, storage)
- **Video Hosting**: Mux (secure video streaming)
- **Deployment**: Vercel
- **Component Pattern**: Functional components with React Hooks ONLY

## Required Libraries & Tools

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.38.0",
    "@mux/mux-player-react": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "lucide-react": "^0.300.0",
    "date-fns": "^3.0.0"
  }
}
```

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── CourseUploadForm.jsx
│   │   ├── SectionManager.jsx
│   │   └── CodeGenerator.jsx
│   ├── student/
│   │   ├── VideoPlayer.jsx
│   │   ├── CourseCard.jsx
│   │   └── ProgressTracker.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── ProtectedRoute.jsx
│   └── shared/
│       ├── Layout.jsx
│       ├── Navigation.jsx
│       └── ErrorBoundary.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── StudentDashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── CoursePage.jsx
│   ├── VideoPage.jsx
│   └── RedeemCode.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useCourses.js
│   └── useVideoProgress.js
├── lib/
│   ├── supabase.js
│   └── mux.js
├── store/
│   └── authStore.js
└── utils/
    ├── errorHandling.js
    └── validation.js
```

## Core Features & Pages

### 1. Authentication (Supabase Auth)

- Login/Signup with email & password
- Protected routes for admin and student areas
- Role-based access control (admin vs student)
- Password reset functionality
- Session management with automatic refresh

**Error Handling Requirements:**

- Validate email format before submission
- Check password strength (min 8 chars, 1 uppercase, 1 number)
- Handle network failures gracefully
- Show clear error messages for invalid credentials
- Implement rate limiting awareness

### 2. Student Dashboard

**Must Display:**

- Latest watched video/session (resume where left off)
- All enrolled courses with progress indicators
- Course access via redemption code system
- Personal profile settings

**Video Progress Tracking:**

- Save timestamp every 5 seconds while watching
- Mark video as "completed" at 95% watched
- Show progress bar on course cards
- Store in Supabase `video_progress` table

**Error Handling:**

- Handle video loading failures (show retry button)
- Validate code redemption (check expiry, usage limits)
- Handle missing course data gracefully
- Offline detection (disable video playback)

### 3. Admin Dashboard

**Must Include:**

- Course creation and management
- Section/module creation within courses
- Video upload workflow (to Mux)
- Access code generation system
- Student enrollment overview

**Code Generation System:**

- Generate unique alphanumeric codes (12 chars)
- Set expiration dates for codes
- Limit number of uses per code
- Associate codes with specific courses or sessions
- Track redemption history

**Error Handling:**

- Validate all form inputs before submission
- Handle file upload failures (size limits, format validation)
- Check for duplicate course names
- Verify Mux upload status before saving
- Show upload progress indicators

### 4. Video Page

- Mux video player integration
- Playback controls with custom styling
- Progress saving (every 5 seconds)
- Next/Previous navigation
- Course sidebar with all sections
- Video cannot be downloaded or shared

**Error Handling:**

- Handle video stream failures
- Validate user access to video
- Show appropriate error for expired subscriptions
- Handle slow network (show buffering state)
- Prevent direct URL access (check auth + enrollment)

### 5. Course Redemption Page

- Simple form to enter access code
- Validation and code redemption
- Automatic enrollment upon successful redemption
- Redirect to newly unlocked course

### 6. Home/Landing Page

- Brief instructor bio
- Featured courses (with preview/sample lesson)
- Clear call-to-action for code redemption
- Responsive design matching Figma

## Supabase Database Schema

### Tables Required:

```sql
-- Users table (handled by Supabase Auth, but add metadata)
CREATE TABLE user_profiles (
                               id UUID REFERENCES auth.users PRIMARY KEY,
                               role TEXT CHECK (role IN ('admin', 'student')) DEFAULT 'student',
                               created_at TIMESTAMP DEFAULT NOW(),
                               updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         title TEXT NOT NULL,
                         description TEXT,
                         thumbnail_url TEXT,
                         instructor_name TEXT,
                         is_published BOOLEAN DEFAULT false,
                         preview_video_id TEXT, -- Mux video ID for preview
                         created_at TIMESTAMP DEFAULT NOW(),
                         updated_at TIMESTAMP DEFAULT NOW()
);

-- Course sections/modules
CREATE TABLE course_sections (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                                 title TEXT NOT NULL,
                                 order_index INTEGER NOT NULL,
                                 created_at TIMESTAMP DEFAULT NOW()
);

-- Videos/Lessons
CREATE TABLE videos (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
                        title TEXT NOT NULL,
                        description TEXT,
                        mux_video_id TEXT NOT NULL, -- Mux asset ID
                        mux_playback_id TEXT NOT NULL, -- Mux playback ID
                        duration_seconds INTEGER,
                        order_index INTEGER NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW()
);

-- Access codes
CREATE TABLE access_codes (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              code TEXT UNIQUE NOT NULL,
                              course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                              max_uses INTEGER DEFAULT 1,
                              current_uses INTEGER DEFAULT 0,
                              expires_at TIMESTAMP,
                              created_by UUID REFERENCES auth.users(id),
                              created_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments (tracks who has access to what)
CREATE TABLE enrollments (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                             course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                             enrolled_via_code UUID REFERENCES access_codes(id),
                             enrolled_at TIMESTAMP DEFAULT NOW(),
                             UNIQUE(user_id, course_id)
);

-- Video progress tracking
CREATE TABLE video_progress (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                                video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
                                current_timestamp DECIMAL NOT NULL DEFAULT 0, -- seconds
                                completed BOOLEAN DEFAULT false,
                                last_watched_at TIMESTAMP DEFAULT NOW(),
                                UNIQUE(user_id, video_id)
);
```

### Row Level Security (RLS) Policies:

Enable RLS on ALL tables. Examples:

```sql
-- Students can only read their own enrollments
CREATE POLICY "Students view own enrollments"
  ON enrollments FOR SELECT
                                USING (auth.uid() = user_id);

-- Only admins can create courses
CREATE POLICY "Admins create courses"
  ON courses FOR INSERT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can only update their own progress
CREATE POLICY "Students update own progress"
  ON video_progress FOR UPDATE
                                          USING (auth.uid() = user_id);
```

## Mux Integration

### Video Upload Flow (Admin):

1. Admin selects video file in form
2. Frontend creates Mux Direct Upload URL via Supabase Edge Function
3. Upload video directly to Mux from browser
4. Poll Mux API for asset status (ready/processing/error)
5. Save `mux_asset_id` and `mux_playback_id` to database
6. Show success/error state to admin

### Video Playback (Student):

1. Verify user enrollment in course
2. Fetch `mux_playback_id` from database
3. Use `@mux/mux-player-react` component
4. Enable signed URLs for security (optional but recommended)
5. Track playback progress every 5 seconds
6. Update `video_progress` table in Supabase

**Security:**

- NEVER expose Mux API keys in frontend code
- Use Supabase Edge Functions for Mux API calls
- Implement signed playback URLs to prevent unauthorized access
- Validate user enrollment before returning playback IDs

## State Management (Zustand)

### Auth Store Example:

```javascript
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
    user: null,
    profile: null,
    loading: true,

    setUser: (user, profile) => set({ user, profile, loading: false }),

    logout: async () => {
        try {
            await supabase.auth.signOut();
            set({ user: null, profile: null });
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }
}));
```

Keep stores simple and focused. Create separate stores for:

- Auth state
- Course data (if needed for caching)
- UI state (modals, notifications)

## Error Handling Strategy

### Defensive Coding Requirements:

1. **Always validate user inputs** before submission
2. **Wrap all async operations** in try-catch blocks
3. **Check for null/undefined** before accessing nested properties
4. **Provide fallback UI** for loading and error states
5. **Log errors** to console with context
6. **Show user-friendly error messages** (not technical stack traces)

### Error Handling Template:

```javascript
const handleOperation = async () => {
    try {
        setLoading(true);
        setError(null);

        // Validate inputs
        if (!requiredField) {
            throw new Error('Required field is missing');
        }

        // Perform operation
        const { data, error } = await supabase
            .from('table')
            .select()
            .single();

        if (error) throw error;

        // Success handling
        setData(data);
    } catch (error) {
        console.error('Operation failed:', error);
        setError(error.message || 'Something went wrong');
    } finally {
        setLoading(false);
    }
};
```

### Common Error Scenarios to Handle:

- Network failures (offline detection)
- Invalid authentication tokens (expired sessions)
- Insufficient permissions (admin vs student)
- File upload failures (size, format, network)
- Video playback errors (DRM, buffering, format)
- Database constraint violations
- Race conditions in progress tracking
- Missing or corrupted data

## React Query Usage

Use React Query for ALL data fetching from Supabase:

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetching data
const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true);

        if (error) throw error;
        return data;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations
const createCourseMutation = useMutation({
    mutationFn: async (courseData) => {
        const { data, error } = await supabase
            .from('courses')
            .insert(courseData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['courses']);
    },
    onError: (error) => {
        console.error('Course creation failed:', error);
    }
});
```

## Styling with Tailwind

### Match Figma Design:

- Extract exact colors, fonts, spacing from Figma
- Use Tailwind config to define custom theme values
- Create reusable component classes with `@apply`
- Ensure responsive breakpoints match design

### Tailwind Config Template:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#YOUR_PRIMARY_COLOR',
                secondary: '#YOUR_SECONDARY_COLOR',
                // Add custom colors from Figma
            },
            fontFamily: {
                sans: ['YOUR_FONT', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
```

### Component Styling Best Practices:

- Use consistent spacing scale (4, 8, 16, 24, 32, 48px)
- Implement dark mode support if Figma includes it
- Create shared button/input styles
- Use Tailwind's group/peer utilities for interactive states

## Code Quality Standards

### Comments & Documentation:

Since the developer is learning JavaScript/React, add:

- **Explanatory comments** for complex logic
- **JSDoc comments** for function parameters and returns
- **Inline comments** explaining React hooks usage
- **TODO comments** for future improvements

### Example:

```javascript
/**
 * Tracks video playback progress and saves to Supabase
 * @param {string} videoId - The UUID of the current video
 * @param {number} currentTime - Current playback position in seconds
 */
const saveProgress = async (videoId, currentTime) => {
        try {
            // Only save if user is authenticated
            if (!user) {
                console.warn('Cannot save progress: User not authenticated');
                return;
            }

            // Mark as completed if watched 95% or more
            const isCompleted = (currentTime / videoDuration) >= 0.95;

            const { error } = await supabase
                .from('video_progress')
                .upsert({
                    user_id: user.id,
                    video_id: videoId,
                    current_timestamp: currentTime,
                    completed: isCompleted,
                    last_watched_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Failed to save video progress:', error);
            // Don't block video playback on save failures
        }
    };
```

### Naming Conventions:

- Components: PascalCase (`VideoPlayer.jsx`)
- Functions/variables: camelCase (`handleSubmit`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- Files: Match component name or purpose

## Performance Considerations

1. **Lazy load routes** with React Router:

```javascript
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
```

2. **Memoize expensive computations**:

```javascript
const sortedCourses = useMemo(() =>
        courses?.sort((a, b) => a.title.localeCompare(b.title)),
    [courses]
);
```

3. **Debounce form inputs** (search, auto-save)
4. **Implement pagination** for course/video lists
5. **Optimize images** (use Supabase storage transforms)

## Security Checklist

- [ ] All Supabase tables have RLS enabled
- [ ] API keys stored in `.env` files (never committed)
- [ ] Admin routes protected by role check
- [ ] Video playback validates enrollment
- [ ] Access codes validated server-side
- [ ] File uploads validated (type, size)
- [ ] SQL injection prevented (use Supabase query builders)
- [ ] XSS prevented (React escapes by default, but be careful with dangerouslySetInnerHTML)
- [ ] CORS properly configured in Supabase
- [ ] Rate limiting on auth endpoints

## Testing & Debugging

### Manual Testing Checklist:

- [ ] Student can redeem valid code
- [ ] Student cannot access videos without enrollment
- [ ] Progress saves correctly and persists
- [ ] Admin can upload videos successfully
- [ ] Admin can generate and manage codes
- [ ] Video player works on mobile devices
- [ ] Authentication redirects work properly
- [ ] Error messages display correctly
- [ ] Form validations prevent bad submissions

### Common Issues & Solutions:

**"Supabase client not initialized"**

- Ensure `.env` variables are loaded
- Check `VITE_` prefix on environment variables

**"Video won't play"**

- Verify Mux playback ID is correct
- Check browser console for CORS errors
- Ensure user is enrolled in course

**"Progress not saving"**

- Check RLS policies on `video_progress` table
- Verify user authentication status
- Look for errors in network tab

## Deployment (Vercel)

### Environment Variables (Vercel Dashboard):

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_MUX_ENV_KEY=your_mux_env_key (if using signed URLs)
```

### Build Settings:

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Post-Deployment:

1. Test all auth flows in production
2. Verify video playback works
3. Check that admin uploads succeed
4. Test code redemption
5. Monitor Vercel analytics for errors

## Communication Guidelines for AI Agent

When generating code:

1. **Explain what you're building** before showing code
2. **Highlight important sections** with comments
3. **Mention potential pitfalls** or common mistakes
4. **Suggest where to add custom logic** from Figma design
5. **Provide clear next steps** after each component

When encountering ambiguity:

1. **Ask clarifying questions** before making assumptions
2. **Suggest multiple approaches** when appropriate
3. **Explain trade-offs** of different solutions
4. **Default to simpler solutions** given developer's experience level

## Additional Notes

- The developer has a Figma design - always ask to see it before styling components
- Prioritize getting a working MVP over perfect code
- Add TODO comments for optimizations that can wait
- Document any third-party API integrations clearly
- Keep bundle size small (avoid heavy libraries)

---

**Remember**: The developer is new to JavaScript/React and has a 1-month deadline. Write clean, commented, defensive
code that works reliably and is easy to understand and modify.
