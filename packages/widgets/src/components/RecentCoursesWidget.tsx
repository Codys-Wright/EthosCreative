import { Progress } from "@repo/ui"
import { ScrollArea } from "@repo/ui"
import { createSizeComponent, WidgetProps } from "./base/BaseWidget";
import { GraduationCap, Clock, BookOpen, Calendar } from "lucide-react";
import { Card, CardContent } from "@repo/ui"


const mockData = {
  recentCourses: [
    { id: 1, title: "Advanced JavaScript", progress: 75, instructor: "John Doe", category: "Programming", lastAccessed: "2 days ago", nextLesson: "Functions & Methods", duration: "20 min", totalLessons: 24, completedLessons: 18 },
    { id: 2, title: "React Fundamentals", progress: 60, instructor: "Jane Smith", category: "Web Dev", lastAccessed: "1 week ago", nextLesson: "Component Lifecycle", duration: "15 min", totalLessons: 32, completedLessons: 19 },
    { id: 3, title: "TypeScript Basics", progress: 45, instructor: "Bob Wilson", category: "Programming", lastAccessed: "3 days ago", nextLesson: "Type Inference", duration: "25 min", totalLessons: 28, completedLessons: 12 },
    { id: 4, title: "Node.js Mastery", progress: 30, instructor: "Alice Brown", category: "Backend", lastAccessed: "1 day ago", nextLesson: "Express Routing", duration: "30 min", totalLessons: 40, completedLessons: 12 },
    { id: 5, title: "CSS Animations", progress: 90, instructor: "Eve White", category: "Design", lastAccessed: "4 days ago", nextLesson: "Keyframes", duration: "15 min", totalLessons: 20, completedLessons: 18 },
    { id: 6, title: "Vue.js Basics", progress: 15, instructor: "Steve Black", category: "Web Dev", lastAccessed: "2 weeks ago", nextLesson: "Vue Router", duration: "20 min", totalLessons: 30, completedLessons: 4 },
    { id: 7, title: "GraphQL API Design", progress: 85, instructor: "Mary Johnson", category: "Backend", lastAccessed: "5 days ago", nextLesson: "Mutations", duration: "25 min", totalLessons: 25, completedLessons: 21 },
    { id: 8, title: "Docker Essentials", progress: 40, instructor: "Tom Davis", category: "DevOps", lastAccessed: "1 month ago", nextLesson: "Containers", duration: "30 min", totalLessons: 35, completedLessons: 14 },
  ]
};

// Row 1 - Minimal to basic info
function _1x1() {
  return (
    <div className="flex items-center gap-2">
      <GraduationCap className="w-5 h-5" />
      <div className="font-medium">Recent</div>
    </div>
  );
}

function _1x2() {
  const course = mockData.recentCourses[0];
  return (
    <div className="space-y-2">
      <GraduationCap className="w-5 h-5" />
      <div className="font-medium truncate">{course?.title}</div>
    </div>
  );
}

function _1x3() {
  const course = mockData.recentCourses[0];
  return (
    <div className="space-y-2">
      <GraduationCap className="w-5 h-5" />
      <div className="font-medium truncate">{course?.title}</div>
      <div className="text-sm text-muted-foreground">{course?.instructor}</div>
    </div>

  );
}

function _1x4() {
  const course = mockData.recentCourses[0];
  return (
    <div className="space-y-2">
      <GraduationCap className="w-5 h-5" />
      <div className="font-medium truncate">{course?.title}</div>
      <div className="text-sm text-muted-foreground">{course?.instructor}</div>
      <Progress value={course?.progress} />

    </div>
  );
}

function _1x5() {
  const course = mockData.recentCourses[0];
  return (
    <div className="space-y-2">
      <GraduationCap className="w-5 h-5" />
      <div className="font-medium truncate">{course?.title}</div>
      <div className="text-sm text-muted-foreground">{course?.instructor}</div>
      <Progress value={course?.progress} />
      <div className="text-sm text-muted-foreground">{course?.category}</div>

    </div>
  );
}

function _1x6() {
  const course = mockData.recentCourses[0];
  return (
    <div className="space-y-2">
      <GraduationCap className="w-5 h-5" />
      <div className="font-medium truncate">{course?.title}</div>
      <div className="text-sm text-muted-foreground">{course?.instructor}</div>
      <Progress value={course?.progress} />
      <div className="text-sm text-muted-foreground">{course?.category}</div>
      <div className="text-sm text-muted-foreground">{course?.lastAccessed}</div>

    </div>
  );
}

// Row 2 - Single course with varying detail
function _2x1() {
  const course = mockData.recentCourses[0];
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-1 truncate pr-4">
        <div className="font-medium truncate">{course?.title}</div>
        <div className="text-sm text-muted-foreground">{course?.instructor}</div>
      </div>

      <Progress value={course?.progress} className="w-20 flex-shrink-0" />
    </div>

  );
}

function _2x2() {
  const course = mockData.recentCourses[0];
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
        <div className="truncate">{course?.title}</div>
      </div>
      <div className="space-y-2">

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{course?.instructor}</div>
          <div className="text-sm text-muted-foreground">{course?.category}</div>
        </div>

        <Progress value={course?.progress} />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>

          <span className="font-medium">{course?.progress}%</span>
        </div>
      </div>

    </div>
  );
}

function _2x3() {
  const course = mockData.recentCourses[0];
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        <div className="truncate">{course?.title}</div>
      </div>
      <div className="space-y-2">

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{course?.instructor}</div>
          <div className="text-sm text-muted-foreground">{course?.category}</div>
        </div>
        <Progress value={course?.progress} />
        <div className="flex justify-between text-sm">

          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{course?.progress}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">

          <Clock className="w-4 h-4" />
          <span>Next: {course?.nextLesson}</span>
        </div>
      </div>
    </div>

  );
}

function _2x4() {
  const course = mockData.recentCourses[0];
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
        <div className="truncate">{course?.title}</div>
      </div>
      <div className="space-y-2">

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{course?.instructor}</div>
          <div className="text-sm text-muted-foreground">{course?.category}</div>
        </div>
        <Progress value={course?.progress} />
        <div className="flex justify-between text-sm">

          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{course?.progress}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">

          <Clock className="w-4 h-4" />
          <span>Next: {course?.nextLesson}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">

          <BookOpen className="w-4 h-4" />
          <span>{course?.completedLessons} of {course?.totalLessons} lessons</span>
        </div>
      </div>

    </div>
  );
}

function _2x5() {
  const course = mockData.recentCourses[0];
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        <div className="truncate">{course?.title}</div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">

          <div className="text-sm text-muted-foreground">{course?.instructor}</div>
          <div className="text-sm text-muted-foreground">{course?.category}</div>
        </div>
        <Progress value={course?.progress} />
        <div className="flex justify-between text-sm">

          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{course?.progress}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">

          <Clock className="w-4 h-4" />
          <span>Next: {course?.nextLesson}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">

          <BookOpen className="w-4 h-4" />
          <span>{course?.completedLessons} of {course?.totalLessons} lessons</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">

          <Calendar className="w-4 h-4" />
          <span>Last accessed {course?.lastAccessed}</span>
        </div>
      </div>

    </div>
  );
}

function _2x6() {
  return <_2x5 />;
}

// Row 3 - Multiple courses in grid layout
function _3x1() {
  const courses = mockData.recentCourses.slice(0, 2);
  return (
    <div className="flex justify-between items-center gap-4">
      {courses.map(course => (
        <div key={course.id} className="flex-1 truncate">
          <div className="font-medium truncate">{course.title}</div>
          <div className="text-sm text-muted-foreground truncate">{course.instructor}</div>
        </div>
      ))}
    </div>
  );
}

function _3x2() {
  const courses = mockData.recentCourses.slice(0, 2);
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <div className="grid grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} className="space-y-2">
            <div className="font-medium truncate">{course.title}</div>
            <Progress value={course.progress} />
            <div className="text-sm text-muted-foreground truncate">{course.instructor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function _3x3() {
  const courses = mockData.recentCourses.slice(0, 4);
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <div className="grid grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} className="space-y-2">
            <div className="font-medium truncate">{course.title}</div>
            <Progress value={course.progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="truncate pr-2">{course.instructor}</span>
              <span>{course.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function _3x4() {
  const courses = mockData.recentCourses.slice(0, 4);
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <div className="grid grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} className="space-y-2">
            <div className="font-medium truncate">{course.title}</div>
            <Progress value={course.progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="truncate pr-2">{course.instructor}</span>
              <span>{course.category}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Next: {course.nextLesson}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function _3x5() {
  return <_3x4 />;
}

function _3x6() {
  return <_3x4 />;
}

// Row 4 - Scrollable layouts
function _4x1() {
  const courses = mockData.recentCourses.slice(0, 3);
  return (
    <div className="flex gap-4 overflow-x-auto">
      {courses.map(course => (
        <div key={course.id} className="flex-1 min-w-[150px] truncate">
          <div className="font-medium truncate">{course.title}</div>
          <div className="text-sm text-muted-foreground truncate">{course.instructor}</div>
        </div>
      ))}
    </div>
  );
}

function _4x2() {
  const courses = mockData.recentCourses.slice(0, 3);
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <div className="grid grid-cols-3 gap-4">
        {courses.map(course => (
          <div key={course.id} className="space-y-2">
            <div className="font-medium truncate">{course.title}</div>
            <Progress value={course.progress} />
            <div className="text-sm text-muted-foreground truncate">{course.instructor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function _4x3() {
  const courses = mockData.recentCourses.slice(0, 6);
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <div className="grid grid-cols-3 gap-4">
        {courses.map(course => (
          <div key={course.id} className="space-y-2">
            <div className="font-medium truncate">{course.title}</div>
            <Progress value={course.progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="truncate pr-2">{course.instructor}</span>
              <span>{course.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function _4x4() {
  return (
    <div className="space-y-3 h-full">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-4 pr-4">
          {mockData.recentCourses.map(course => (
            <div key={course.id} className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{course.title}</div>
                  <div className="text-sm text-muted-foreground">{course.instructor}</div>
                </div>
                <div className="text-sm text-muted-foreground">{course.lastAccessed}</div>
              </div>
              <Progress value={course.progress} />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{course.category}</span>
                <span className="font-medium">{course.progress}% Complete</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function _4x5() {
  return <_4x6 />;
}

function _4x6() {
  return (
    <div className="space-y-3 h-full">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-4 pr-4" style={{ minWidth: 'unset', display: 'block' }}>
          {mockData.recentCourses.map(course => (
            <div key={course.id} className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{course.title}</div>
                  <div className="text-sm text-muted-foreground">{course.instructor}</div>
                </div>
                <div className="text-sm text-muted-foreground">{course.lastAccessed}</div>
              </div>
              <Progress value={course.progress} />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{course.category}</span>
                <span className="font-medium">{course.progress}% Complete</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Next: {course.nextLesson}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{course.completedLessons} of {course.totalLessons} lessons</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Row 5 - Wide grid layouts
function _5x1() {
  return <_4x1 />;
}

function _5x2() {
  const courses = mockData.recentCourses.slice(0, 4);
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <div className="grid grid-cols-4 gap-4">
        {courses.map(course => (
          <div key={course.id} className="space-y-2">
            <div className="font-medium truncate">{course.title}</div>
            <Progress value={course.progress} />
            <div className="text-sm text-muted-foreground truncate">{course.instructor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function _5x3() {
  return <_4x3 />;
}

function _5x4() {
  return <_4x4 />;
}

function _5x5() {
  return <_4x6 />;
}

function _5x6() {
  return <_4x6 />;
}

// Row 6 - Widest layouts
function _6x1() {
  return <_4x1 />;
}

function _6x2() {
  return <_5x2 />;
}

function _6x3() {
  const courses = mockData.recentCourses.slice(0, 6);
  return (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <div className="grid grid-cols-3 gap-4">
        {courses.map(course => (
          <div key={course.id} className="space-y-2">
            <div className="font-medium truncate">{course.title}</div>
            <Progress value={course.progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="truncate pr-2">{course.instructor}</span>
              <span>{course.category}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Next: {course.nextLesson}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function _6x4() {
  return (
    <div className="space-y-3 h-full">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-4 pr-4">
          {mockData.recentCourses.map(course => (
            <div key={course.id} className="grid grid-cols-4 gap-4 items-center">
              <div className="space-y-1 col-span-2">
                <div className="font-medium">{course.title}</div>
                <div className="text-sm text-muted-foreground">{course.instructor}</div>
              </div>
              <div className="space-y-1">
                <Progress value={course.progress} />
                <div className="text-sm font-medium text-right">{course.progress}% Complete</div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-sm text-muted-foreground">{course.category}</div>
                <div className="text-sm text-muted-foreground">{course.lastAccessed}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function _6x5() {
  return <_6x6 />;
}

function _6x6() {
  return (
    <div className="space-y-3 h-full">
      <div className="font-medium flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        Recent Courses
      </div>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-4 pr-4" style={{ minWidth: 'unset', display: 'block' }}>
          {mockData.recentCourses.map(course => (
            <div key={course.id} className="grid grid-cols-4 gap-4 items-start">
              <div className="space-y-1 col-span-2">
                <div className="font-medium">{course.title}</div>
                <div className="text-sm text-muted-foreground">{course.instructor}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Next: {course.nextLesson}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={course.progress} />
                <div className="text-sm font-medium text-right">{course.progress}% Complete</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="text-sm text-muted-foreground">{course.category}</div>
                <div className="text-sm text-muted-foreground">{course.lastAccessed}</div>
                <div className="text-sm text-muted-foreground">Duration: {course.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

const supportedSizes = [
  // 1x rows
  { width: 1, height: 1 }, { width: 1, height: 2 }, { width: 1, height: 3 }, 
  { width: 1, height: 4 }, { width: 1, height: 5 }, { width: 1, height: 6 },
  
  // 2x rows
  { width: 2, height: 1 }, { width: 2, height: 2 }, { width: 2, height: 3 },
  { width: 2, height: 4 }, { width: 2, height: 5 }, { width: 2, height: 6 },
  
  // 3x rows
  { width: 3, height: 1 }, { width: 3, height: 2 }, { width: 3, height: 3 },
  { width: 3, height: 4 }, { width: 3, height: 5 }, { width: 3, height: 6 },
  
  // 4x rows
  { width: 4, height: 1 }, { width: 4, height: 2 }, { width: 4, height: 3 },
  { width: 4, height: 4 }, { width: 4, height: 5 }, { width: 4, height: 6 },
  
  // 5x rows
  { width: 5, height: 1 }, { width: 5, height: 2 }, { width: 5, height: 3 },
  { width: 5, height: 4 }, { width: 5, height: 5 }, { width: 5, height: 6 },
  
  // 6x rows
  { width: 6, height: 1 }, { width: 6, height: 2 }, { width: 6, height: 3 },
  { width: 6, height: 4 }, { width: 6, height: 5 }, { width: 6, height: 6 },
];

export const RecentCoursesWidget = createSizeComponent<WidgetProps>(
  ({ size, id }: WidgetProps) => {
    const width = size?.width || 1;
    const height = size?.height || 1;

    const content = (() => {
      // 1x rows
      if (width === 1 && height === 1) return <_1x1 />;
      if (width === 1 && height === 2) return <_1x2 />;
      if (width === 1 && height === 3) return <_1x3 />;
      if (width === 1 && height === 4) return <_1x4 />;
      if (width === 1 && height === 5) return <_1x5 />;
      if (width === 1 && height === 6) return <_1x6 />;

      // 2x rows
      if (width === 2 && height === 1) return <_2x1 />;
      if (width === 2 && height === 2) return <_2x2 />;
      if (width === 2 && height === 3) return <_2x3 />;
      if (width === 2 && height === 4) return <_2x4 />;
      if (width === 2 && height === 5) return <_2x5 />;
      if (width === 2 && height === 6) return <_2x6 />;

      // 3x rows
      if (width === 3 && height === 1) return <_3x1 />;
      if (width === 3 && height === 2) return <_3x2 />;
      if (width === 3 && height === 3) return <_3x3 />;
      if (width === 3 && height === 4) return <_3x4 />;
      if (width === 3 && height === 5) return <_3x5 />;
      if (width === 3 && height === 6) return <_3x6 />;

      // 4x rows
      if (width === 4 && height === 1) return <_4x1 />;
      if (width === 4 && height === 2) return <_4x2 />;
      if (width === 4 && height === 3) return <_4x3 />;
      if (width === 4 && height === 4) return <_4x4 />;
      if (width === 4 && height === 5) return <_4x5 />;
      if (width === 4 && height === 6) return <_4x6 />;

      // 5x rows
      if (width === 5 && height === 1) return <_5x1 />;
      if (width === 5 && height === 2) return <_5x2 />;
      if (width === 5 && height === 3) return <_5x3 />;
      if (width === 5 && height === 4) return <_5x4 />;
      if (width === 5 && height === 5) return <_5x5 />;
      if (width === 5 && height === 6) return <_5x6 />;

      // 6x rows
      if (width === 6 && height === 1) return <_6x1 />;
      if (width === 6 && height === 2) return <_6x2 />;
      if (width === 6 && height === 3) return <_6x3 />;
      if (width === 6 && height === 4) return <_6x4 />;
      if (width === 6 && height === 5) return <_6x5 />;
      if (width === 6 && height === 6) return <_6x6 />;
      
      return null;
    })();

    return content;
  },
  supportedSizes
);
