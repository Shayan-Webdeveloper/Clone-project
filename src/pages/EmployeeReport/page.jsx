import { useEffect, useState } from "react";

function EmployeeReport() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/questions/active`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch questions");
        }

        setQuestions(data.questions);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    const formattedAnswers = questions.map((question) => ({
      question: question._id,
      answer: answers[question._id] || "",
    }));

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/reports`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: formattedAnswers,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit report");
    }

    alert("Report submitted successfully!");
  } catch (error) {
    alert(error.message);
  }
};

  const answeredCount = questions.filter(
    (question) => answers[question._id]?.trim()
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-indigo-600">
              Daily Standup
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Daily Standup Report
            </h1>

            <p className="mt-2 text-gray-500">
              Share what you worked on and how your day is going.
            </p>
          </div>

          {questions.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Progress
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {answeredCount}{" "}
                <span className="font-normal text-gray-400">
                  / {questions.length}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            No questions available
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your admin has not added any active standup questions yet.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {questions.map((question, index) => (
              <div
                key={question._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                    {index + 1}
                  </div>

                  <div>
                    <label
                      htmlFor={question._id}
                      className="block text-base font-semibold leading-6 text-gray-900"
                    >
                      {question.questionText}
                    </label>

                    <p className="mt-1 text-xs text-gray-400">
                      Write your response below
                    </p>
                  </div>
                </div>

                <textarea
                  id={question._id}
                  value={answers[question._id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question._id, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            ))}
          </div>

          {/* Submit section */}
          <div className="mt-6 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="font-semibold text-gray-900">
                Ready to submit?
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Make sure you have answered all the questions.
              </p>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              Submit Report
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default EmployeeReport;