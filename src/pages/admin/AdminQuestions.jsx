import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2 } from "lucide-react";

const API = "http://localhost:5000/api";

function AdminQuestions() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message || "Unable to load questions");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setAdding(true);
    setError("");
    try {
      const response = await fetch(`${API}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionText: newQuestion.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setQuestions((prev) => [data.question, ...prev]);
      setNewQuestion("");
    } catch (err) {
      setError(err.message || "Unable to add question");
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      const response = await fetch(`${API}/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? data.question : q))
      );
    } catch (err) {
      setError(err.message || "Unable to update question");
    }
  };

  const removeQuestion = async (id) => {
    try {
      const response = await fetch(`${API}/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      setError(err.message || "Unable to delete question");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Questions</h1>
      <p className="text-slate-500 mt-1">
        These are the questions employees answer each day.
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
        <p className="text-sm text-slate-400 mb-5">
          Toggle a question off to pause it without losing past answers.
        </p>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="e.g. What did you work on today?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Add
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {!questions ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></span>
            Loading questions...
          </div>
        ) : questions.length === 0 ? (
          <p className="text-sm text-slate-400">
            No questions yet — add your first one above.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {questions.map((q) => (
              <li
                key={q._id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      q.isActive ? "bg-green-500" : "bg-slate-300"
                    }`}
                  ></span>
                  <span
                    className={`text-sm truncate ${
                      q.isActive ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {q.questionText}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => toggleActive(q._id, !q.isActive)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    {q.isActive ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => removeQuestion(q._id)}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminQuestions;
