import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Lock, Clock, ArrowLeft } from "lucide-react";

export function QuizClosed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Quiz Closed ⏳
        </h1>

        <p className="text-xl text-gray-600 mb-4">
          This quiz is no longer accepting submissions
        </p>

        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-gray-800">Deadline Passed</p>
          </div>
          <p className="text-gray-600 text-sm">
            The submission window for this quiz has closed. Contact your teacher if you need an extension.
          </p>
        </div>

        <Button
          onClick={() => navigate("/student")}
          className="bg-[#272757] hover:bg-[#505081] text-white px-8 py-6 rounded-2xl text-lg font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
      </Card>
    </div>
  );
}
