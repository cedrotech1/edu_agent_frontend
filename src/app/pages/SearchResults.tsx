import { useSearchParams, useNavigate } from "react-router";
import { Search, BookOpen, GraduationCap, Users, BarChart3, ChevronRight } from "lucide-react";

const allData = {
  quizzes: [
    { id: 1, name: "Biology Basics",        desc: "10 questions · S3 Biology · Due Jul 30" },
    { id: 2, name: "Geometry Fundamentals", desc: "8 questions · Mathematics · Due Aug 5"  },
    { id: 3, name: "Chemistry Chapter 5",   desc: "12 questions · Chemistry · Due Aug 10"  },
    { id: 4, name: "Physics Chapter 3",     desc: "15 questions · Physics · Due Aug 15"    },
    { id: 5, name: "World History Quiz",    desc: "10 questions · History · Due Aug 20"    },
  ],
  classes: [
    { id: 1, name: "S3 Biology 2026",   desc: "24 students · Ms. Johnson" },
    { id: 2, name: "S5 Chemistry 2026", desc: "18 students · Ms. Johnson" },
    { id: 3, name: "S4 History 2026",   desc: "21 students · Mr. Smith"   },
  ],
  students: [
    { id: 1, name: "Alex Martinez",  desc: "S3 Biology 2026 · 92% avg"   },
    { id: 2, name: "Amina Uwase",    desc: "S3 Biology 2026 · 78% avg"   },
    { id: 3, name: "John Nkusi",     desc: "S5 Chemistry 2026 · 45% avg" },
    { id: 4, name: "Grace Mukamana", desc: "S4 History 2026 · 85% avg"   },
  ],
  results: [
    { id: 1, name: "Biology Basics — Alex Martinez",  desc: "Score: 92% · Jul 25, 2026" },
    { id: 2, name: "Geometry Quiz — Amina Uwase",     desc: "Score: 78% · Jul 24, 2026" },
    { id: 3, name: "Physics Ch3 — John Nkusi",        desc: "Score: 45% · Jul 23, 2026" },
  ],
};

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = (e.target as HTMLInputElement).value.trim();
      if (val) navigate(`/search?q=${encodeURIComponent(val)}`);
    }
  };

  if (query.length < 3) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header query={query} onSearch={handleSearch} onBack={() => navigate(-1)} />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Search className="w-12 h-12 text-[#8686AC] mb-4" style={{ strokeWidth: 1.25 }} />
          <p className="text-sm text-[#64748B]">Type at least 3 characters to search.</p>
        </div>
      </div>
    );
  }

  const q = query.toLowerCase();
  const results = {
    quizzes:  allData.quizzes.filter(x  => x.name.toLowerCase().includes(q)),
    classes:  allData.classes.filter(x  => x.name.toLowerCase().includes(q)),
    students: allData.students.filter(x => x.name.toLowerCase().includes(q)),
    results:  allData.results.filter(x  => x.name.toLowerCase().includes(q)),
  };
  const hasAny = Object.values(results).some(arr => arr.length > 0);

  const sections: {
    key: keyof typeof results;
    label: string;
    Icon: React.ElementType;
    getLink: (id: number) => string;
  }[] = [
    { key: "quizzes",  label: "Quizzes",  Icon: BookOpen,      getLink: (id) => `/teacher/results/${id}` },
    { key: "classes",  label: "Classes",  Icon: GraduationCap, getLink: (id) => `/teacher/class/${id}`   },
    { key: "students", label: "Students", Icon: Users,          getLink: ()   => `/admin/users`           },
    { key: "results",  label: "Results",  Icon: BarChart3,      getLink: (id) => `/student/results/${id}` },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header query={query} onSearch={handleSearch} onBack={() => navigate(-1)} />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#0F0E47] mb-6">
          Search results for <span className="text-[#272757]">"{query}"</span>
        </h1>

        {!hasAny && (
          <div className="flex flex-col items-center py-20 text-center">
            <Search className="w-14 h-14 text-[#8686AC] mb-4" style={{ strokeWidth: 1.25 }} />
            <h3 className="text-lg font-semibold text-[#0F0E47] mb-2">No results found for "{query}"</h3>
            <p className="text-sm text-[#64748B]">Try different keywords or check your spelling.</p>
          </div>
        )}

        {sections.map(({ key, label, Icon, getLink }) => {
          const items = results[key];
          if (items.length === 0) return null;
          return (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3 mt-5">
                <Icon className="w-5 h-5 text-[#272757]" style={{ strokeWidth: 1.75 }} />
                <h2 className="text-base font-semibold text-[#0F0E47]">{label}</h2>
                <span className="bg-[#EDE9FE] text-[#272757] text-xs px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(getLink(item.id))}
                  className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 mb-2 hover:bg-[#EDE9FE] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#272757]" style={{ strokeWidth: 1.75 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0F0E47] text-sm">{item.name}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{item.desc}</p>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-[#272757] font-medium hover:underline shrink-0">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Header({
  query,
  onSearch,
  onBack,
}: {
  query: string;
  onSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBack: () => void;
}) {
  return (
    <header className="sticky top-0 bg-white border-b border-[#E2E8F0] h-14 z-10 flex items-center px-6 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-[#272757] rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-black">Q</span>
        </div>
        <span className="font-bold text-[#0F0E47] text-base hidden sm:block">QuizMind AI</span>
      </div>

      {/* Search input */}
      <div className="flex-1 max-w-xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8686AC] pointer-events-none" style={{ strokeWidth: 1.75 }} />
        <input
          defaultValue={query}
          onKeyDown={onSearch}
          placeholder="Search quizzes, students, classes…"
          className="w-full pl-9 pr-4 h-9 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm focus:outline-none focus:border-[#272757] text-[#0F0E47]"
        />
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm text-[#272757] flex items-center gap-1 shrink-0 hover:underline"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Back
      </button>
    </header>
  );
}
