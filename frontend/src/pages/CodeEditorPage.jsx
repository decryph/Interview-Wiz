import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

const CodeEditorPage = () => {
  const [question, setQuestion] = useState("Loading question...");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState(1800);
  const [timerStarted, setTimerStarted] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);

  const navigate = useNavigate();
  const outputRef = useRef(null);

  const role = localStorage.getItem("dsa-role");
  const difficulty = localStorage.getItem("dsa-difficulty");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const questionText = localStorage.getItem("dsa-question");
  const expectedOutput = localStorage.getItem("dsa-expectedOutput");
  const input = localStorage.getItem("dsa-input");

  useEffect(() => {
    if (!role || !difficulty || !questionText) {
      alert("Please start from the DSA dashboard.");
      navigate("/dsadashboard");
    } else {
      setQuestion(questionText);
    }
    setCode(""); // Always start with empty editor
  }, [navigate, role, difficulty]);

  useEffect(() => {
    if (!timerStarted || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time's up!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, timeLeft]);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const scrollToOutput = () => {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleCompile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to compile code.");
      return;
    }

    if (!code.trim()) {
      alert("Please write your code before compiling.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setOutput("");

    try {
      const response = await fetch(`${BASE_URL}/api/dsa/compile-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language,
          stdin: useCustomInput ? customInput : input,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setOutput(result.output || "✅ Code compiled successfully.");
        setSuccessMessage("✅ Compilation successful!");
      } else {
        setOutput(result.error || "⚠️ Compilation failed.");
        setSuccessMessage("⚠️ Something went wrong.");
      }
    } catch (error) {
      console.error("Compile error:", error);
      setOutput("❌ Compilation failed due to timeout or network issue.");
      setSuccessMessage("❌ Compilation error.");
    } finally {
      setLoading(false);
      scrollToOutput();
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to submit code.");
      return;
    }

    if (!code.trim()) {
      alert("Please write your code before submitting.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setOutput("");

    try {
      const response = await fetch(`${BASE_URL}/api/dsa/submit-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language,
          role,
          difficulty,
          question: questionText,
          stdin: useCustomInput ? customInput : input,
        }),
      });

      const result = await response.json();
      let isCorrect = false;

      if (!useCustomInput && expectedOutput) {
        const trimmedUserOutput = (result.output || "").trim();
        const trimmedExpectedOutput = expectedOutput.trim();
        isCorrect = trimmedUserOutput === trimmedExpectedOutput;
      }

      if (isCorrect) {
        setOutput("✅ Successfully submitted.");
      } else {
        let msg = result.output || "✔️ Code submitted.";
        if (!useCustomInput && expectedOutput) {
          msg += "\n⚠️ Output did not match expected output.";
        }
        setOutput(msg);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setOutput("❌ Submission failed due to timeout or network error.");
      setSuccessMessage("❌ Error submitting code.");
    } finally {
      setLoading(false);
      scrollToOutput();
    }
  };

  const handleStartTimer = () => {
    setTimeLeft(selectedTime);
    setTimerStarted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-purple-700">Code Challenge</h2>
          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
            <label className="text-sm font-semibold text-gray-600">Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border px-3 py-2 rounded-md bg-white text-gray-800 shadow-sm"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>

            <label className="text-sm font-semibold text-gray-600">Theme:</label>
            <select
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value)}
              className="border px-3 py-2 rounded-md bg-white text-gray-800 shadow-sm"
            >
              <option value="vs-dark">Dark</option>
              <option value="vs-light">Light</option>
            </select>

            {!timerStarted ? (
              <div className="flex gap-2 items-center">
                <label className="text-sm font-semibold text-gray-600">Timer:</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(parseInt(e.target.value))}
                  className="border px-3 py-2 rounded-md bg-white text-gray-800 shadow-sm"
                >
                  <option value={900}>15 min</option>
                  <option value={1800}>30 min</option>
                  <option value={3600}>1 hour</option>
                </select>
                <button
                  onClick={handleStartTimer}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Start Timer
                </button>
              </div>
            ) : (
              <span className="text-sm font-semibold text-red-600 ml-4">
                Time Left: {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 p-4 border border-purple-300 bg-purple-50 rounded-md shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-purple-800">Problem Statement:</h3>
          <div className="text-gray-700 whitespace-pre-line">
            <p className="mb-2">{question}</p>
            {!useCustomInput && input && (
              <>
                <p className="text-sm mt-2">
                  <strong className="text-purple-700">Input:</strong> <code>{input}</code>
                </p>
                <p className="text-sm mt-1">
                  <strong className="text-purple-700">Expected Output:</strong>{" "}
                  <code>{expectedOutput}</code>
                </p>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600 italic mt-2">
            Please write a complete program including the <code>main()</code> function.
          </p>
        </div>

        <Editor
          height="400px"
          language={language}
          value={code}
          theme={editorTheme}
          onChange={(val) => setCode(val || "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
            wordWrap: "on",
            formatOnType: true,
            formatOnPaste: true,
          }}
        />

        <div className="my-4">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={useCustomInput}
              onChange={() => setUseCustomInput(!useCustomInput)}
            />
            <span>Run with Custom Input</span>
          </label>
          {useCustomInput && (
            <textarea
              rows={4}
              className="mt-2 w-full border rounded-md p-2 text-sm"
              placeholder="Enter your input here..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-between items-center mt-4 gap-4 flex-wrap">
          <button
            onClick={() => navigate("/past-submissions")}
            className="text-purple-700 font-semibold underline"
          >
            View Past Submissions
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleCompile}
              disabled={loading}
              className={`${
                loading ? "bg-yellow-300" : "bg-yellow-500 hover:bg-yellow-600"
              } text-white px-6 py-2 rounded-md font-semibold`}
            >
              {loading ? "Compiling..." : "Compile Code"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`${
                loading ? "bg-green-300" : "bg-green-600 hover:bg-green-700"
              } text-white px-6 py-2 rounded-md font-semibold`}
            >
              {loading ? "Submitting..." : "Submit Code"}
            </button>
            <button
              onClick={() => navigate("/dsadashboard")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-semibold"
            >
              End Test
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md">
            {successMessage}
          </div>
        )}
        <div
          ref={outputRef}
          className="mt-6 bg-gray-100 p-4 rounded-md border text-sm text-gray-800"
        >
          <strong>Output:</strong>
          <pre className="mt-2 whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;
